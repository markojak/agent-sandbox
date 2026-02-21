import { getPool } from "./db.mjs";
import { createSessionToken, hashPassword, verifyPassword } from "./auth.mjs";
import { trackError, trackEvent } from "./observability.mjs";
import { validateCredentials, validateProfileInput } from "./validation.mjs";

const SESSION_TTL_HOURS = 24;

export async function signup(input) {
  const parsed = validateCredentials(input);
  if (!parsed.valid) {
    return { status: 400, body: { error: parsed.error } };
  }

  const { email, password } = parsed.value;
  trackEvent("signup_started", { email });

  try {
    const pool = getPool();
    const passwordHash = hashPassword(password);
    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email`,
      [email, passwordHash],
    );

    if (userResult.rowCount === 0) {
      return { status: 409, body: { error: "account already exists" } };
    }

    const user = userResult.rows[0];

    await pool.query(
      `INSERT INTO profiles (user_id, timezone, units, daily_calorie_goal)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO NOTHING`,
      [user.id, "UTC", "metric", 2200],
    );

    const token = await createAndStoreSession(user.id);

    trackEvent("signup_completed", { userId: user.id });

    return {
      status: 201,
      body: {
        token,
        user,
      },
    };
  } catch (error) {
    trackError("signup_failed", error, { email });
    return { status: 500, body: { error: "internal server error" } };
  }
}

export async function login(input) {
  const parsed = validateCredentials(input);
  if (!parsed.valid) {
    return { status: 400, body: { error: parsed.error } };
  }

  const { email, password } = parsed.value;

  try {
    const pool = getPool();
    const userResult = await pool.query(
      `SELECT id, email, password_hash FROM users WHERE email = $1`,
      [email],
    );

    if (userResult.rowCount === 0) {
      trackEvent("login_failure", { reason: "missing_user", email });
      return { status: 401, body: { error: "invalid credentials" } };
    }

    const user = userResult.rows[0];
    if (!verifyPassword(password, user.password_hash)) {
      trackEvent("login_failure", { reason: "bad_password", userId: user.id });
      return { status: 401, body: { error: "invalid credentials" } };
    }

    const token = await createAndStoreSession(user.id);
    trackEvent("login_success", { userId: user.id });

    return {
      status: 200,
      body: {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      },
    };
  } catch (error) {
    trackError("login_failed", error, { email });
    return { status: 500, body: { error: "internal server error" } };
  }
}

export async function updateProfile(token, input) {
  if (!token) {
    return { status: 401, body: { error: "missing bearer token" } };
  }

  const parsed = validateProfileInput(input);
  if (!parsed.valid) {
    return { status: 400, body: { error: parsed.error } };
  }

  try {
    const pool = getPool();
    const user = await getUserByToken(token);

    if (!user) {
      return { status: 401, body: { error: "invalid session" } };
    }

    const { timezone, units, dailyCalorieGoal } = parsed.value;

    const profileResult = await pool.query(
      `UPDATE profiles
       SET timezone = $1,
           units = $2,
           daily_calorie_goal = $3,
           updated_at = NOW()
       WHERE user_id = $4
       RETURNING timezone, units, daily_calorie_goal AS "dailyCalorieGoal"`,
      [timezone, units, dailyCalorieGoal, user.id],
    );

    trackEvent("profile_updated", { userId: user.id });

    return {
      status: 200,
      body: {
        profile: profileResult.rows[0],
      },
    };
  } catch (error) {
    trackError("profile_update_failed", error);
    return { status: 500, body: { error: "internal server error" } };
  }
}

async function createAndStoreSession(userId) {
  const pool = getPool();
  const token = createSessionToken();
  await pool.query(
    `INSERT INTO auth_sessions (token, user_id, expires_at)
     VALUES ($1, $2, NOW() + ($3 || ' hours')::interval)`,
    [token, userId, SESSION_TTL_HOURS],
  );

  return token;
}

async function getUserByToken(token) {
  const pool = getPool();
  const result = await pool.query(
    `SELECT u.id, u.email
     FROM auth_sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE s.token = $1
       AND s.expires_at > NOW()`,
    [token],
  );

  return result.rows[0] ?? null;
}

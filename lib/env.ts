type AppEnvironment = "development" | "test" | "staging" | "production";

const APP_ENVIRONMENTS: AppEnvironment[] = [
  "development",
  "test",
  "staging",
  "production",
];

export type EnvironmentValidationResult = {
  ok: boolean;
  errors: string[];
};

export type RuntimeEnvironment = {
  APP_ENV: AppEnvironment;
  AUTH_SECRET: string;
  DATABASE_URL: string;
  LOG_INGEST_TOKEN: string;
};

type EnvironmentSource = Record<string, string | undefined>;

function isValidAppEnvironment(value: string | undefined): value is AppEnvironment {
  if (!value) {
    return false;
  }

  return APP_ENVIRONMENTS.includes(value as AppEnvironment);
}

function isValidUrl(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return Boolean(url.protocol && url.hostname);
  } catch {
    return false;
  }
}

export function validateEnvironment(env: EnvironmentSource): EnvironmentValidationResult {
  const errors: string[] = [];

  if (!isValidAppEnvironment(env.APP_ENV)) {
    errors.push(
      `APP_ENV must be one of: ${APP_ENVIRONMENTS.join(", ")}. Received: ${
        env.APP_ENV ?? "<missing>"
      }`,
    );
  }

  if (!env.AUTH_SECRET || env.AUTH_SECRET.length < 32) {
    errors.push("AUTH_SECRET is required and must be at least 32 characters long.");
  }

  if (!isValidUrl(env.DATABASE_URL)) {
    errors.push("DATABASE_URL is required and must be a valid URL.");
  }

  if (!env.LOG_INGEST_TOKEN || env.LOG_INGEST_TOKEN.length < 16) {
    errors.push("LOG_INGEST_TOKEN is required and must be at least 16 characters long.");
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function getRuntimeEnvironment(env: EnvironmentSource = process.env): RuntimeEnvironment {
  const validation = validateEnvironment(env);

  if (!validation.ok) {
    const details = validation.errors.map((error) => `- ${error}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  return {
    APP_ENV: env.APP_ENV as AppEnvironment,
    AUTH_SECRET: env.AUTH_SECRET as string,
    DATABASE_URL: env.DATABASE_URL as string,
    LOG_INGEST_TOKEN: env.LOG_INGEST_TOKEN as string,
  };
}

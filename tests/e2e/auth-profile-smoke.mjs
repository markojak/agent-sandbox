const baseUrl = process.env.APP_BASE_URL ?? "http://127.0.0.1:3000";

const email = `smoke-${Date.now()}@example.com`;
const password = "password1234";

async function jsonRequest(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const payload = await response.json();

  return {
    status: response.status,
    body: payload,
  };
}

const signupResult = await jsonRequest("/api/auth/signup", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email, password }),
});

if (signupResult.status !== 201 || !signupResult.body.token) {
  throw new Error(`signup failed: ${JSON.stringify(signupResult)}`);
}

const profileResult = await jsonRequest("/api/profile", {
  method: "PATCH",
  headers: {
    "content-type": "application/json",
    authorization: `Bearer ${signupResult.body.token}`,
  },
  body: JSON.stringify({
    timezone: "America/Chicago",
    units: "metric",
    dailyCalorieGoal: 2300,
  }),
});

if (profileResult.status !== 200) {
  throw new Error(`profile update failed: ${JSON.stringify(profileResult)}`);
}

const reloginResult = await jsonRequest("/api/auth/login", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email, password }),
});

if (reloginResult.status !== 200 || !reloginResult.body.token) {
  throw new Error(`relogin failed: ${JSON.stringify(reloginResult)}`);
}

console.log("auth/profile smoke passed");

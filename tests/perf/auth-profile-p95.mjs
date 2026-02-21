const baseUrl = process.env.APP_BASE_URL ?? "http://127.0.0.1:3000";
const thresholdMs = Number(process.env.P95_THRESHOLD_MS ?? 700);

async function request(path, options) {
  const started = performance.now();
  const response = await fetch(`${baseUrl}${path}`, options);
  const elapsed = performance.now() - started;
  const payload = await response.json();

  return {
    elapsed,
    status: response.status,
    body: payload,
  };
}

const email = `perf-${Date.now()}@example.com`;
const password = "password1234";

const signup = await request("/api/auth/signup", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email, password }),
});

if (signup.status !== 201) {
  throw new Error(`perf setup signup failed: ${JSON.stringify(signup.body)}`);
}

const samples = [];
for (let index = 0; index < 20; index += 1) {
  const sample = await request("/api/profile", {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${signup.body.token}`,
    },
    body: JSON.stringify({
      timezone: "America/Chicago",
      units: index % 2 === 0 ? "metric" : "imperial",
      dailyCalorieGoal: 2200 + index,
    }),
  });

  if (sample.status !== 200) {
    throw new Error(`perf profile write failed: ${JSON.stringify(sample.body)}`);
  }

  samples.push(sample.elapsed);
}

samples.sort((a, b) => a - b);
const p95Index = Math.ceil(samples.length * 0.95) - 1;
const p95 = samples[p95Index];

console.log(`profile update p95=${p95.toFixed(2)}ms threshold=${thresholdMs}ms`);

if (p95 > thresholdMs) {
  throw new Error(`p95 ${p95.toFixed(2)}ms exceeds threshold ${thresholdMs}ms`);
}

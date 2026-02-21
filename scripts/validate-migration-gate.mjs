import { execSync } from "node:child_process";

const required = ["DATABASE_URL"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `Missing required environment variables for migration gate: ${missing.join(", ")}`,
  );
  process.exit(1);
}

function run(command) {
  console.log(`\n$ ${command}`);
  execSync(command, {
    stdio: "inherit",
    env: process.env,
  });
}

run("npx prisma migrate deploy");
run("npx prisma db seed");
run("node scripts/assert-seed-fixtures.mjs");
run("npx prisma migrate reset --force --skip-seed");
run("npx prisma migrate deploy");
run("npx prisma db seed");
run("node scripts/assert-seed-fixtures.mjs");

console.log("\nMigration gate validation passed (apply -> reset -> reapply + deterministic seed).");

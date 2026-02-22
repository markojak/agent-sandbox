import { getRuntimeEnvironment } from "@/lib/env";

try {
  const env = getRuntimeEnvironment(process.env);
  console.log(`Environment validated for APP_ENV=${env.APP_ENV}`);
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown environment validation error";
  console.error(message);
  process.exit(1);
}

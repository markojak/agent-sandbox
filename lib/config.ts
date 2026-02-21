export function oauthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_OAUTH === "true" || process.env.ENABLE_OAUTH === "true";
}

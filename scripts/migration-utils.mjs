export function isForwardMigration(filename) {
  if (!filename.endsWith(".sql")) {
    return false;
  }

  const normalized = filename.toLowerCase();
  return !normalized.endsWith("_down.sql") && !normalized.endsWith("_rollback.sql");
}

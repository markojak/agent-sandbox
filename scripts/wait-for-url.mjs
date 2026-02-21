const url = process.argv[2];
const timeoutMs = Number(process.argv[3] ?? 60_000);

if (!url) {
  throw new Error("Usage: node scripts/wait-for-url.mjs <url> [timeoutMs]");
}

const started = Date.now();

while (Date.now() - started < timeoutMs) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      console.log(`${url} is ready`);
      process.exit(0);
    }
  } catch {
    // keep polling
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));
}

throw new Error(`Timed out waiting for ${url}`);

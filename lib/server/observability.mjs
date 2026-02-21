function baseEvent(name, payload = {}) {
  return {
    event: name,
    domain: "auth-profile",
    timestamp: new Date().toISOString(),
    ...payload,
  };
}

export function trackEvent(name, payload = {}) {
  const event = baseEvent(name, payload);
  console.info(JSON.stringify(event));
  return event;
}

export function trackError(name, error, payload = {}) {
  const event = baseEvent(name, {
    ...payload,
    errorName: error?.name ?? "Error",
    errorMessage: error?.message ?? "Unknown error",
  });

  console.error(JSON.stringify(event));
  return event;
}

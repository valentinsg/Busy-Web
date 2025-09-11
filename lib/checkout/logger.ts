export function logInfo(message: string, meta?: Record<string, any>) {
  // eslint-disable-next-line no-console
  console.log(`[MP] ${message}`, meta ?? {})
}

export function logError(message: string, meta?: Record<string, any>) {
  // eslint-disable-next-line no-console
  console.error(`[MP][ERROR] ${message}`, meta ?? {})
}

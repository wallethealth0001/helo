export function walletErrorDetails(error: unknown): { code: string | number | undefined; message: string } {
  const record = error as { code?: string | number; message?: string; shortMessage?: string } | null
  const message = record?.shortMessage ?? record?.message ?? String(error)
  return {
    code: record?.code,
    message: message
      .replace(/wc:[^\s"'<>]+/gi, '[redacted pairing URI]')
      .replace(/([?&]uri=)[^&\s"'<>]+/gi, '$1[redacted]'),
  }
}

export function walletErrorMessage(error: unknown): string {
  const { code, message } = walletErrorDetails(error)
  const codeText = code === undefined ? '' : ` (code ${code})`
  return `${message}${codeText}`
}

export interface NotificationMessage {
  subject: 'wallet_connection' | 'approval_status' | 'transaction_status'
  address?: string
  status: string
}

export async function notifyBackend(_message: NotificationMessage): Promise<void> {
  throw new Error(
    'Notification delivery is intentionally disabled in the browser. Configure a consented secured backend endpoint before enabling notifications.',
  )
}

import type { ReactNode } from 'react'

export function MainLayout({ children }: { children: ReactNode }) {
  return <div className="app-shell">{children}</div>
}


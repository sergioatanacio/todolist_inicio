import type { ReactNode } from 'react'

type AppShellProps = {
  userName: string
  userEmail: string
  projectName: string | null
  onLogout: () => void
  sidebar: ReactNode
  children: ReactNode
}

export function AppShell({
  userName,
  userEmail,
  projectName,
  onLogout,
  sidebar,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 p-4 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <header className="mb-4 rounded-2xl border border-slate-300 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm">
              Usuario: {userName} ({userEmail}) | Proyecto: {projectName ?? '-'}
            </p>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              Cerrar sesion
            </button>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-[240px_1fr]">
          <aside className="rounded-2xl border border-slate-300 bg-white p-4">
            {sidebar}
          </aside>
          <main className="space-y-4">{children}</main>
        </div>
      </div>
    </div>
  )
}

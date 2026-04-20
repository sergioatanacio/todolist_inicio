type BaseAppViewProps = {
  onCreateWorkspace: () => void
}

export function BaseAppView({ onCreateWorkspace }: BaseAppViewProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f8fafc_0%,_#eef2ff_35%,_#e2e8f0_100%)] text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
            Workspace
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Planificador</h1>
          <p className="mt-3 text-sm text-slate-600">
            Nueva base UI para workspaces, proyectos, kanban y calendario.
          </p>

          <button
            type="button"
            onClick={onCreateWorkspace}
            className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Crear Workspace
          </button>

          <div className="mt-6 space-y-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium">
              Vista General
            </div>
            <div className="rounded-2xl px-3 py-2 text-sm text-slate-600">
              Proyectos
            </div>
            <div className="rounded-2xl px-3 py-2 text-sm text-slate-600">
              Kanban
            </div>
            <div className="rounded-2xl px-3 py-2 text-sm text-slate-600">
              Calendario
            </div>
          </div>
        </aside>

        <main className="grid gap-6">
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
              Estado
            </p>
            <h2 className="mt-2 text-2xl font-semibold">UI Base Montada</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">
              Esta pantalla reemplaza la UI anterior y sirve como punto de
              partida para integrar los casos de uso de workspace y RBAC.
            </p>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg">
              <h3 className="text-lg font-semibold">Kanban</h3>
              <p className="mt-2 text-sm text-slate-600">
                Pendiente de integrar tareas por estado y acciones de arrastre.
              </p>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg">
              <h3 className="text-lg font-semibold">Calendario</h3>
              <p className="mt-2 text-sm text-slate-600">
                Pendiente de integrar disponibilidad, segmentos y agenda.
              </p>
            </article>
          </section>
        </main>
      </div>
    </div>
  )
}

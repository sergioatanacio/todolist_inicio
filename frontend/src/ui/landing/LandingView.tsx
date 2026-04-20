type LandingViewProps = {
  onLogin: () => void
  onRegister: () => void
}

export function LandingView({ onLogin, onRegister }: LandingViewProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eef2ff_0%,_#dbeafe_35%,_#e2e8f0_100%)] px-4 py-10 text-slate-900">
      <div className="mx-auto grid max-w-6xl gap-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-2xl md:grid-cols-[1.1fr_1fr] md:p-10">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-700">
            TodoFlow
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
            Planifica tareas con workspaces, kanban y calendario.
          </h1>
          <p className="mt-4 max-w-xl text-sm text-slate-600 md:text-base">
            Gestiona equipos y proyectos con roles, disponibilidad y trazabilidad
            de estados y comentarios.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onRegister}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Crear cuenta
            </button>
            <button
              type="button"
              onClick={onLogin}
              className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Iniciar sesion
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-lg font-semibold">Que incluye</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li>RBAC por workspace y acceso por proyecto.</li>
            <li>Tareas con estados y auditoria de cambios.</li>
            <li>Comentarios en cascada tipo foro.</li>
            <li>Disponibilidad por segmentos y fechas.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}

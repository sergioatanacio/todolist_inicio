export function LoadingView() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed_0%,_#f1e7dc_45%,_#eadfd7_100%)] px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white/80 p-10 shadow-2xl">
        <p className="text-lg font-semibold">Cargando base de datos...</p>
        <p className="mt-2 text-slate-500">
          Inicializando SQLite en tu navegador.
        </p>
      </div>
    </div>
  )
}

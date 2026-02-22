export function ProjectOverviewScreen({ projectName }: { projectName: string | null }) {
  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4">
      <h1 className="text-lg font-semibold">Overview</h1>
      <p className="text-sm text-slate-600">Proyecto: {projectName ?? '-'}</p>
    </section>
  )
}

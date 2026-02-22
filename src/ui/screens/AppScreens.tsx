import type {
  AvailabilityPlanVm,
  DisponibilidadVm,
  ProjectVm,
  TaskStatus,
  TaskVm,
  TodoListVm,
  WorkspaceVm,
} from '../types/AppUiModels'

export const TASK_STATUSES: TaskStatus[] = [
  'PENDING',
  'IN_PROGRESS',
  'DONE',
  'ABANDONED',
]

type WorkspacesScreenProps = {
  workspaceName: string
  onWorkspaceNameChange: (value: string) => void
  onCreate: () => void
  busy: boolean
  error: string | null
  workspaces: WorkspaceVm[]
  onOpenWorkspace: (workspaceId: string) => void
}

export function WorkspacesScreen({
  workspaceName,
  onWorkspaceNameChange,
  onCreate,
  busy,
  error,
  workspaces,
  onOpenWorkspace,
}: WorkspacesScreenProps) {
  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4">
      <h1 className="text-lg font-semibold">Workspaces</h1>
      <div className="mt-3 flex gap-2">
        <input
          value={workspaceName}
          onChange={(e) => onWorkspaceNameChange(e.target.value)}
          placeholder="Nombre workspace"
          className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={onCreate}
          disabled={busy}
          className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Crear
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
      <div className="mt-3 space-y-2">
        {workspaces.map((workspace) => (
          <button
            key={workspace.id}
            type="button"
            onClick={() => onOpenWorkspace(workspace.id)}
            className="block w-full rounded border border-slate-300 px-3 py-2 text-left text-sm"
          >
            {workspace.name}
          </button>
        ))}
      </div>
    </section>
  )
}

type WorkspaceProjectsScreenProps = {
  projectName: string
  projectDescription: string
  onProjectNameChange: (value: string) => void
  onProjectDescriptionChange: (value: string) => void
  onCreateProject: () => void
  busy: boolean
  error: string | null
  projects: ProjectVm[]
  onOpenProject: (workspaceId: string, projectId: string) => void
}

export function WorkspaceProjectsScreen({
  projectName,
  projectDescription,
  onProjectNameChange,
  onProjectDescriptionChange,
  onCreateProject,
  busy,
  error,
  projects,
  onOpenProject,
}: WorkspaceProjectsScreenProps) {
  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4">
      <h1 className="text-lg font-semibold">Proyectos</h1>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <input
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          placeholder="Nombre proyecto"
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          value={projectDescription}
          onChange={(e) => onProjectDescriptionChange(e.target.value)}
          placeholder="Descripcion"
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="button"
        onClick={onCreateProject}
        disabled={busy}
        className="mt-2 rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
      >
        Crear proyecto
      </button>
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}

      <div className="mt-3 space-y-2">
        {projects.map((project) => (
          <button
            key={project.id}
            type="button"
            onClick={() => onOpenProject(project.workspaceId, project.id)}
            className="block w-full rounded border border-slate-300 px-3 py-2 text-left text-sm"
          >
            {project.name}
          </button>
        ))}
      </div>
    </section>
  )
}

export function ProjectOverviewScreen({ projectName }: { projectName: string | null }) {
  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4">
      <h1 className="text-lg font-semibold">Overview</h1>
      <p className="text-sm text-slate-600">Proyecto: {projectName ?? '-'}</p>
    </section>
  )
}

type DisponibilidadesScreenProps = {
  dispName: string
  dispDescription: string
  dispStart: string
  dispEnd: string
  onDispNameChange: (value: string) => void
  onDispDescriptionChange: (value: string) => void
  onDispStartChange: (value: string) => void
  onDispEndChange: (value: string) => void
  onCreate: () => void
  busy: boolean
  error: string | null
  disponibilidades: DisponibilidadVm[]
  onOpenSegments: (disponibilidadId: string) => void
  onOpenCalendar: (disponibilidadId: string) => void
}

export function DisponibilidadesScreen({
  dispName,
  dispDescription,
  dispStart,
  dispEnd,
  onDispNameChange,
  onDispDescriptionChange,
  onDispStartChange,
  onDispEndChange,
  onCreate,
  busy,
  error,
  disponibilidades,
  onOpenSegments,
  onOpenCalendar,
}: DisponibilidadesScreenProps) {
  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4">
      <h1 className="text-lg font-semibold">Disponibilidades</h1>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <input value={dispName} onChange={(e) => onDispNameChange(e.target.value)} placeholder="Nombre" className="rounded border border-slate-300 px-3 py-2 text-sm" />
        <input value={dispDescription} onChange={(e) => onDispDescriptionChange(e.target.value)} placeholder="Descripcion" className="rounded border border-slate-300 px-3 py-2 text-sm" />
        <input type="date" value={dispStart} onChange={(e) => onDispStartChange(e.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm" />
        <input type="date" value={dispEnd} onChange={(e) => onDispEndChange(e.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <button type="button" onClick={onCreate} disabled={busy} className="mt-2 rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Crear disponibilidad</button>
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
      <div className="mt-3 space-y-2">
        {disponibilidades.map((disp) => (
          <div key={disp.id} className="rounded border border-slate-300 p-2 text-sm">
            <p>{disp.name} ({disp.startDate} - {disp.endDate})</p>
            <div className="mt-1 flex gap-2">
              <button type="button" onClick={() => onOpenSegments(disp.id)} className="rounded border border-slate-300 px-2 py-1 text-xs">Segmentos</button>
              <button type="button" onClick={() => onOpenCalendar(disp.id)} className="rounded border border-slate-300 px-2 py-1 text-xs">Calendar</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

type SegmentsScreenProps = {
  disponibilidadName: string
  disponibilidadStartDate: string
  disponibilidadEndDate: string
  segments: DisponibilidadVm['segments']
  segName: string
  segDescription: string
  segStart: string
  segEnd: string
  segDates: string
  segDaysWeek: string
  segDaysMonth: string
  segExclusions: string
  onSegDescriptionChange: (value: string) => void
  onSegNameChange: (value: string) => void
  onSegStartChange: (value: string) => void
  onSegEndChange: (value: string) => void
  onSegDatesChange: (value: string) => void
  onSegDaysWeekChange: (value: string) => void
  onSegDaysMonthChange: (value: string) => void
  onSegExclusionsChange: (value: string) => void
  onAddSegment: () => void
  busy: boolean
  error: string | null
}

export function SegmentsScreen({
  disponibilidadName,
  disponibilidadStartDate,
  disponibilidadEndDate,
  segments,
  segName,
  segDescription,
  segStart,
  segEnd,
  segDates,
  segDaysWeek,
  segDaysMonth,
  segExclusions,
  onSegDescriptionChange,
  onSegNameChange,
  onSegStartChange,
  onSegEndChange,
  onSegDatesChange,
  onSegDaysWeekChange,
  onSegDaysMonthChange,
  onSegExclusionsChange,
  onAddSegment,
  busy,
  error,
}: SegmentsScreenProps) {
  const parsedSpecificDates = segDates
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
  const parsedExclusions = segExclusions
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
  const parsedDaysOfWeek = segDaysWeek
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item))
  const parsedDaysOfMonth = segDaysMonth
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item))
  const conflictDates = parsedSpecificDates.filter((item) =>
    parsedExclusions.includes(item),
  )
  const crossesMidnight = segStart.length > 0 && segEnd.length > 0 && segEnd < segStart
  const hasRules =
    parsedSpecificDates.length > 0 ||
    parsedDaysOfWeek.length > 0 ||
    parsedDaysOfMonth.length > 0

  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4">
      <h1 className="text-lg font-semibold">Segmentos</h1>
      <p className="text-xs text-slate-600">
        Disponibilidad: {disponibilidadName} | Rango: {disponibilidadStartDate} a{' '}
        {disponibilidadEndDate}
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="rounded-xl border border-slate-300 bg-slate-50 p-3">
          <p className="text-sm font-semibold">Segmentos existentes</p>
          <div className="mt-2 space-y-2">
            {segments.length === 0 ? (
              <p className="text-xs text-slate-500">Aun no hay segmentos.</p>
            ) : (
              segments.map((segment) => (
                <div key={segment.id} className="rounded-lg border border-slate-300 bg-white p-2">
                  <p className="text-xs font-semibold">{segment.name}</p>
                  <p className="text-[11px] text-slate-600">
                    {segment.startTime} - {segment.endTime}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    reglas: {segment.specificDates.length + segment.daysOfWeek.length + segment.daysOfMonth.length}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    exclusiones: {segment.exclusionDates.length}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-300 p-3">
          <div className="grid gap-2 md:grid-cols-2">
            <input value={segName} onChange={(e) => onSegNameChange(e.target.value)} placeholder="Nombre segmento" className="rounded border border-slate-300 px-3 py-2 text-sm" />
            <input value={segDescription} onChange={(e) => onSegDescriptionChange(e.target.value)} placeholder="Descripcion (opcional)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
            <input type="time" value={segStart} onChange={(e) => onSegStartChange(e.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm" />
            <input type="time" value={segEnd} onChange={(e) => onSegEndChange(e.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm" />
          </div>

          <div className="rounded-lg border border-slate-300 p-3">
            <p className="text-sm font-semibold">Reglas de aplicacion</p>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              <input value={segDates} onChange={(e) => onSegDatesChange(e.target.value)} placeholder="Fechas especificas CSV (YYYY-MM-DD)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
              <input value={segDaysWeek} onChange={(e) => onSegDaysWeekChange(e.target.value)} placeholder="Dias semana CSV (1..7)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
              <input value={segDaysMonth} onChange={(e) => onSegDaysMonthChange(e.target.value)} placeholder="Dias mes CSV (1..31)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
              <input value={segExclusions} onChange={(e) => onSegExclusionsChange(e.target.value)} placeholder="Exclusiones CSV (YYYY-MM-DD)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="rounded-lg border border-slate-300 bg-slate-50 p-3">
            <p className="text-sm font-semibold">Vista previa</p>
            <p className="text-xs text-slate-600">
              Reglas activas: {parsedSpecificDates.length + parsedDaysOfWeek.length + parsedDaysOfMonth.length}
            </p>
            <p className="text-xs text-slate-600">Exclusiones: {parsedExclusions.length}</p>
            <p className="text-xs text-slate-600">
              Cruza medianoche: {crossesMidnight ? 'Si' : 'No'}
            </p>
            {!hasRules ? (
              <p className="text-xs text-rose-600">Debes definir al menos una regla.</p>
            ) : null}
            {conflictDates.length > 0 ? (
              <p className="text-xs text-amber-700">
                Conflicto reglas/exclusiones en: {conflictDates.join(', ')} (gana exclusion).
              </p>
            ) : null}
          </div>

          <button type="button" onClick={onAddSegment} disabled={busy} className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Agregar segmento</button>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </div>
      </div>
    </section>
  )
}

type ListsScreenProps = {
  listName: string
  selectedDispId: string
  onListNameChange: (value: string) => void
  onSelectedDispIdChange: (value: string) => void
  onCreateList: () => void
  busy: boolean
  error: string | null
  disponibilidades: DisponibilidadVm[]
  lists: TodoListVm[]
  onOpenKanban: (listId: string) => void
}

export function ListsScreen({
  listName,
  selectedDispId,
  onListNameChange,
  onSelectedDispIdChange,
  onCreateList,
  busy,
  error,
  disponibilidades,
  lists,
  onOpenKanban,
}: ListsScreenProps) {
  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4">
      <h1 className="text-lg font-semibold">Listas</h1>
      <div className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
        <input value={listName} onChange={(e) => onListNameChange(e.target.value)} placeholder="Nombre lista" className="rounded border border-slate-300 px-3 py-2 text-sm" />
        <select value={selectedDispId} onChange={(e) => onSelectedDispIdChange(e.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm">
          <option value="">Selecciona disponibilidad</option>
          {disponibilidades.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <button type="button" onClick={onCreateList} disabled={busy} className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Crear lista</button>
      </div>
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
      <div className="mt-3 space-y-2">
        {lists.map((list) => (
          <div key={list.id} className="rounded border border-slate-300 p-2 text-sm">
            <p>{list.name}</p>
            <button type="button" onClick={() => onOpenKanban(list.id)} className="mt-1 rounded border border-slate-300 px-2 py-1 text-xs">Abrir kanban</button>
          </div>
        ))}
      </div>
    </section>
  )
}

type KanbanScreenProps = {
  taskTitle: string
  taskDuration: string
  onTaskTitleChange: (value: string) => void
  onTaskDurationChange: (value: string) => void
  onCreateTask: () => void
  busy: boolean
  error: string | null
  kanban: Record<TaskStatus, TaskVm[]>
  onChangeStatus: (taskId: string, toStatus: TaskStatus) => void
}

export function KanbanScreen({
  taskTitle,
  taskDuration,
  onTaskTitleChange,
  onTaskDurationChange,
  onCreateTask,
  busy,
  error,
  kanban,
  onChangeStatus,
}: KanbanScreenProps) {
  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4">
      <h1 className="text-lg font-semibold">Kanban</h1>
      <div className="mt-3 grid gap-2 md:grid-cols-[1fr_140px_auto]">
        <input value={taskTitle} onChange={(e) => onTaskTitleChange(e.target.value)} placeholder="Titulo tarea" className="rounded border border-slate-300 px-3 py-2 text-sm" />
        <input type="number" min={1} value={taskDuration} onChange={(e) => onTaskDurationChange(e.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm" />
        <button type="button" onClick={onCreateTask} disabled={busy} className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Crear tarea</button>
      </div>
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
      <div className="mt-3 grid gap-2 md:grid-cols-4">
        {TASK_STATUSES.map((status) => (
          <div key={status} className="rounded border border-slate-300 bg-slate-50 p-2">
            <p className="text-sm font-semibold">{status}</p>
            <div className="mt-2 space-y-2">
              {kanban[status].map((task) => (
                <div key={task.id} className="rounded border border-slate-300 bg-white p-2">
                  <p className="text-xs font-semibold">{task.title}</p>
                  <p className="text-[11px]">{task.durationMinutes} min</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {TASK_STATUSES.filter((next) => next !== task.status).map((next) => (
                      <button key={next} type="button" onClick={() => onChangeStatus(task.id, next)} className="rounded border border-slate-300 px-1 py-0.5 text-[10px]">{next}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function ProjectCalendarScreen({ calendar }: { calendar: Record<string, number> }) {
  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4">
      <h1 className="text-lg font-semibold">Calendar proyecto</h1>
      <div className="mt-2 space-y-1">
        {Object.keys(calendar).length === 0 ? <p className="text-sm text-slate-500">Sin tareas planificadas.</p> : Object.entries(calendar).sort(([a], [b]) => a.localeCompare(b)).map(([day, count]) => <div key={day} className="rounded border border-slate-300 px-2 py-1 text-sm">{day}: {count} tareas</div>)}
      </div>
    </section>
  )
}

export function AvailabilityCalendarScreen({ plan }: { plan: AvailabilityPlanVm | null }) {
  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4">
      <h1 className="text-lg font-semibold">Calendar disponibilidad</h1>
      {!plan ? (
        <p className="text-sm text-slate-500">Sin datos.</p>
      ) : (
        <div className="space-y-2 text-sm">
          <p>Bloques: {plan.plannedBlocks.length}</p>
          <p>No planificadas: {plan.unplannedTaskIds.length}</p>
          {plan.plannedBlocks.map((block) => (
            <div key={`${block.taskId}-${block.scheduledStart}`} className="rounded border border-slate-300 px-2 py-1 text-xs">
              {block.taskId} | {new Date(block.scheduledStart).toLocaleString()} - {new Date(block.scheduledEnd).toLocaleString()}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

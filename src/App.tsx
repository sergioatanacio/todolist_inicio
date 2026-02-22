import { useEffect, useMemo, useRef, useState } from 'react'
import { type AppServices, createAppServices } from './aplicacion/AppBootstrap'
import { initDatabase, persistDatabase } from './infra/SqliteDatabase'
import { AuthCardView } from './ui/auth/AuthCardView'
import { LandingView } from './ui/landing/LandingView'

type AuthMode = 'login' | 'register'
type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'ABANDONED'

type Route =
  | { kind: 'landing' }
  | { kind: 'auth'; mode: AuthMode }
  | { kind: 'workspaces' }
  | { kind: 'workspace'; workspaceId: string }
  | { kind: 'project'; workspaceId: string; projectId: string; tab: 'overview' | 'disponibilidades' | 'lists' | 'calendar' }
  | { kind: 'availability'; workspaceId: string; projectId: string; disponibilidadId: string }
  | { kind: 'availabilityCalendar'; workspaceId: string; projectId: string; disponibilidadId: string }
  | { kind: 'kanban'; workspaceId: string; projectId: string; listId: string }

type WorkspaceVm = { id: string; name: string }
type ProjectVm = { id: string; workspaceId: string; name: string; description: string }
type DisponibilidadVm = { id: string; projectId: string; name: string; startDate: string; endDate: string; segments: Array<{ id: string; name: string; startTime: string; endTime: string }> }
type TodoListVm = { id: string; projectId: string; disponibilidadId: string; name: string }
type TaskVm = { id: string; title: string; status: TaskStatus; durationMinutes: number }

type Errors = {
  auth: string | null
  workspace: string | null
  project: string | null
  disponibilidad: string | null
  segment: string | null
  list: string | null
  task: string | null
}

const SESSION_KEY = 'todo_user_id'
const TASK_STATUSES: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'DONE', 'ABANDONED']

const parseCsvDates = (raw: string) => raw.split(',').map((s) => s.trim()).filter(Boolean)
const parseCsvNumbers = (raw: string) => raw.split(',').map((s) => Number(s.trim())).filter((n) => Number.isInteger(n))

const navigate = (path: string, replace = false) => {
  if (replace) window.history.replaceState(null, '', path)
  else window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

const parseRoute = (): Route => {
  const url = new URL(window.location.href)
  const p = url.pathname
  if (p === '/') return { kind: 'landing' }
  if (p === '/auth') return { kind: 'auth', mode: url.searchParams.get('mode') === 'register' ? 'register' : 'login' }
  if (p === '/app/workspaces') return { kind: 'workspaces' }
  const w = p.match(/^\/app\/workspaces\/([^/]+)$/)
  if (w) return { kind: 'workspace', workspaceId: decodeURIComponent(w[1]) }
  const pt = p.match(/^\/app\/workspaces\/([^/]+)\/projects\/([^/]+)\/(overview|disponibilidades|lists|calendar)$/)
  if (pt) return { kind: 'project', workspaceId: decodeURIComponent(pt[1]), projectId: decodeURIComponent(pt[2]), tab: pt[3] as 'overview' | 'disponibilidades' | 'lists' | 'calendar' }
  const ad = p.match(/^\/app\/workspaces\/([^/]+)\/projects\/([^/]+)\/disponibilidades\/([^/]+)$/)
  if (ad) return { kind: 'availability', workspaceId: decodeURIComponent(ad[1]), projectId: decodeURIComponent(ad[2]), disponibilidadId: decodeURIComponent(ad[3]) }
  const ac = p.match(/^\/app\/workspaces\/([^/]+)\/projects\/([^/]+)\/disponibilidades\/([^/]+)\/calendar$/)
  if (ac) return { kind: 'availabilityCalendar', workspaceId: decodeURIComponent(ac[1]), projectId: decodeURIComponent(ac[2]), disponibilidadId: decodeURIComponent(ac[3]) }
  const k = p.match(/^\/app\/workspaces\/([^/]+)\/projects\/([^/]+)\/lists\/([^/]+)\/kanban$/)
  if (k) return { kind: 'kanban', workspaceId: decodeURIComponent(k[1]), projectId: decodeURIComponent(k[2]), listId: decodeURIComponent(k[3]) }
  return { kind: 'landing' }
}

function App() {
  const servicesRef = useRef<AppServices | null>(null)
  const [ready, setReady] = useState(false)
  const [route, setRoute] = useState<Route>(() => parseRoute())
  const [authMode, setAuthMode] = useState<AuthMode>('login')

  const [userId, setUserId] = useState<number | null>(null)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')

  const [workspaces, setWorkspaces] = useState<WorkspaceVm[]>([])
  const [projects, setProjects] = useState<ProjectVm[]>([])
  const [disponibilidades, setDisponibilidades] = useState<DisponibilidadVm[]>([])
  const [lists, setLists] = useState<TodoListVm[]>([])
  const [kanban, setKanban] = useState<Record<TaskStatus, TaskVm[]>>({ PENDING: [], IN_PROGRESS: [], DONE: [], ABANDONED: [] })
  const [projectCalendar, setProjectCalendar] = useState<Record<string, number>>({})
  const [availabilityPlan, setAvailabilityPlan] = useState<{ plannedBlocks: Array<{ taskId: string; todoListId: string; scheduledStart: number; scheduledEnd: number; durationMinutes: number }>; unplannedTaskIds: string[] } | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [dispName, setDispName] = useState('')
  const [dispDescription, setDispDescription] = useState('')
  const [dispStart, setDispStart] = useState('')
  const [dispEnd, setDispEnd] = useState('')
  const [segName, setSegName] = useState('')
  const [segStart, setSegStart] = useState('')
  const [segEnd, setSegEnd] = useState('')
  const [segDates, setSegDates] = useState('')
  const [segDaysWeek, setSegDaysWeek] = useState('')
  const [segDaysMonth, setSegDaysMonth] = useState('')
  const [segExclusions, setSegExclusions] = useState('')
  const [listName, setListName] = useState('')
  const [selectedDispId, setSelectedDispId] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDuration, setTaskDuration] = useState('30')

  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<Errors>({ auth: null, workspace: null, project: null, disponibilidad: null, segment: null, list: null, task: null })

  const workspaceId = route.kind === 'workspace' || route.kind === 'project' || route.kind === 'availability' || route.kind === 'availabilityCalendar' || route.kind === 'kanban' ? route.workspaceId : null
  const projectId = route.kind === 'project' || route.kind === 'availability' || route.kind === 'availabilityCalendar' || route.kind === 'kanban' ? route.projectId : null
  const disponibilidadId = route.kind === 'availability' || route.kind === 'availabilityCalendar' ? route.disponibilidadId : null
  const listId = route.kind === 'kanban' ? route.listId : null

  const activeProject = useMemo(() => projects.find((p) => p.id === projectId) ?? null, [projects, projectId])

  const setError = (k: keyof Errors, m: string | null) => setErrors((e) => ({ ...e, [k]: m }))

  const loadWorkspaces = (services: AppServices, actorUserId: number) => {
    const rows = services.workspace.listByOwnerUserId(actorUserId).map((w) => ({ id: w.id, name: w.name }))
    setWorkspaces(rows)
    return rows
  }

  const loadWorkspaceContext = (services: AppServices, wsId: string, actorUserId: number) => {
    const ps = services.project.listByWorkspace(wsId, actorUserId).map((p) => ({ id: p.id, workspaceId: p.workspaceId, name: p.name, description: p.description }))
    setProjects(ps)
    return ps
  }

  const loadProjectContext = (services: AppServices, prjId: string) => {
    const ds = services.disponibilidad.listByProject(prjId).map((d) => ({
      id: d.id,
      projectId: d.projectId,
      name: d.name,
      startDate: d.startDate,
      endDate: d.endDate,
      segments: d.segments.map((s) => ({ id: s.id, name: s.name, startTime: s.startTime, endTime: s.endTime })),
    }))
    setDisponibilidades(ds)
    setSelectedDispId((c) => c || ds[0]?.id || '')
    const ls = services.todoList.listByProject(prjId).map((l) => ({ id: l.id, projectId: l.projectId, disponibilidadId: l.disponibilidadId, name: l.name, orderInDisponibilidad: l.orderInDisponibilidad }))
    setLists(ls)
  }

  const loadKanban = (services: AppServices, todoListId: string) => {
    const data = services.taskPlanning.getKanbanByTodoList(todoListId)
    setKanban({
      PENDING: data.PENDING.map((t) => ({ id: t.id, title: t.title, status: t.status, durationMinutes: t.durationMinutes })),
      IN_PROGRESS: data.IN_PROGRESS.map((t) => ({ id: t.id, title: t.title, status: t.status, durationMinutes: t.durationMinutes })),
      DONE: data.DONE.map((t) => ({ id: t.id, title: t.title, status: t.status, durationMinutes: t.durationMinutes })),
      ABANDONED: data.ABANDONED.map((t) => ({ id: t.id, title: t.title, status: t.status, durationMinutes: t.durationMinutes })),
    })
  }

  useEffect(() => {
    const onPop = () => {
      const next = parseRoute()
      setRoute(next)
      if (next.kind === 'auth') setAuthMode(next.mode)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    let mounted = true
    const boot = async () => {
      const db = await initDatabase()
      if (!mounted) return
      const services = createAppServices(db, persistDatabase)
      servicesRef.current = services
      const stored = localStorage.getItem(SESSION_KEY)
      if (stored) {
        const session = services.auth.restoreSession(Number(stored))
        if (session) {
          setUserId(session.id)
          setUserName(session.name)
          setUserEmail(session.email)
          const ws = loadWorkspaces(services, session.id)
          const current = parseRoute()
          if (current.kind === 'landing' || current.kind === 'auth') {
            navigate(ws[0] ? `/app/workspaces/${ws[0].id}` : '/app/workspaces', true)
          }
        } else {
          localStorage.removeItem(SESSION_KEY)
        }
      }
      setReady(true)
    }
    void boot()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!ready || userId !== null) return
    if (route.kind !== 'landing' && route.kind !== 'auth') navigate('/', true)
  }, [ready, route.kind, userId])

  useEffect(() => {
    const services = servicesRef.current
    if (!services || userId === null) return
    loadWorkspaces(services, userId)
    if (workspaceId) loadWorkspaceContext(services, workspaceId, userId)
    else setProjects([])
    if (projectId) loadProjectContext(services, projectId)
    else {
      setDisponibilidades([])
      setLists([])
    }
    if (listId) loadKanban(services, listId)
    else setKanban({ PENDING: [], IN_PROGRESS: [], DONE: [], ABANDONED: [] })
    if (route.kind === 'project' && route.tab === 'calendar') {
      setProjectCalendar(services.taskPlanning.buildProjectCalendar(route.projectId))
    } else setProjectCalendar({})
    if (route.kind === 'availabilityCalendar') {
      setAvailabilityPlan(services.taskPlanning.buildDisponibilidadCalendar(route.disponibilidadId))
    } else setAvailabilityPlan(null)
  }, [workspaceId, projectId, listId, route.kind, route.kind === 'project' ? route.tab : '', route.kind === 'availabilityCalendar' ? route.disponibilidadId : '', userId])

  const submitAuth = async () => {
    const services = servicesRef.current
    if (!services) return
    setBusy(true)
    setError('auth', null)
    if (!email.trim() || !password.trim() || (authMode === 'register' && !name.trim())) {
      setError('auth', 'Completa los campos requeridos.')
      setBusy(false)
      return
    }
    const result = authMode === 'register'
      ? await services.auth.register({ name: name.trim(), email: email.trim().toLowerCase(), password: password.trim() })
      : await services.auth.login({ email: email.trim().toLowerCase(), password: password.trim() })
    if (!result.ok) {
      setError('auth', 'error' in result ? result.error : 'No se pudo autenticar.')
      setBusy(false)
      return
    }
    setUserId(result.user.id)
    setUserName(result.user.name)
    setUserEmail(result.user.email)
    localStorage.setItem(SESSION_KEY, String(result.user.id))
    const ws = loadWorkspaces(services, result.user.id)
    navigate(ws[0] ? `/app/workspaces/${ws[0].id}` : '/app/workspaces')
    setBusy(false)
  }

  const logout = () => {
    setUserId(null)
    setUserName('')
    setUserEmail('')
    localStorage.removeItem(SESSION_KEY)
    navigate('/', true)
  }

  const createWorkspace = async () => {
    const services = servicesRef.current
    if (!services || userId === null) return
    setBusy(true)
    setError('workspace', null)
    try {
      const created = await services.workspace.createWorkspace({ ownerUserId: userId, name: workspaceName })
      setWorkspaceName('')
      loadWorkspaces(services, userId)
      navigate(`/app/workspaces/${created.id}`)
    } catch (error) {
      setError('workspace', error instanceof Error ? error.message : 'No se pudo crear workspace.')
    } finally {
      setBusy(false)
    }
  }

  const createProject = async () => {
    const services = servicesRef.current
    if (!services || userId === null || !workspaceId) return
    setBusy(true)
    setError('project', null)
    try {
      const p = await services.project.createProject({ workspaceId, actorUserId: userId, name: projectName, description: projectDescription })
      setProjectName('')
      setProjectDescription('')
      loadWorkspaceContext(services, workspaceId, userId)
      navigate(`/app/workspaces/${workspaceId}/projects/${p.id}/overview`)
    } catch (error) {
      setError('project', error instanceof Error ? error.message : 'No se pudo crear proyecto.')
    } finally {
      setBusy(false)
    }
  }

  const createDisponibilidad = async () => {
    const services = servicesRef.current
    if (!services || userId === null || !projectId) return
    setBusy(true)
    setError('disponibilidad', null)
    try {
      await services.disponibilidad.create({ projectId, actorUserId: userId, name: dispName, description: dispDescription, startDate: dispStart, endDate: dispEnd })
      setDispName('')
      setDispDescription('')
      setDispStart('')
      setDispEnd('')
      loadProjectContext(services, projectId)
    } catch (error) {
      setError('disponibilidad', error instanceof Error ? error.message : 'No se pudo crear disponibilidad.')
    } finally {
      setBusy(false)
    }
  }

  const addSegment = async () => {
    const services = servicesRef.current
    const targetDisponibilidadId = disponibilidadId ?? selectedDispId
    if (!services || userId === null || !projectId || !targetDisponibilidadId) return
    setBusy(true)
    setError('segment', null)
    try {
      await services.disponibilidad.addSegment({
        projectId,
        disponibilidadId: targetDisponibilidadId,
        actorUserId: userId,
        name: segName,
        description: '',
        startTime: segStart,
        endTime: segEnd,
        specificDates: parseCsvDates(segDates),
        daysOfWeek: parseCsvNumbers(segDaysWeek),
        daysOfMonth: parseCsvNumbers(segDaysMonth),
      })
      setSegName('')
      setSegStart('')
      setSegEnd('')
      setSegDates('')
      setSegDaysWeek('')
      setSegDaysMonth('')
      setSegExclusions('')
      loadProjectContext(services, projectId)
    } catch (error) {
      setError('segment', error instanceof Error ? error.message : 'No se pudo agregar segmento.')
    } finally {
      setBusy(false)
    }
  }

  const createList = async () => {
    const services = servicesRef.current
    if (!services || userId === null || !workspaceId || !projectId || !selectedDispId) return
    setBusy(true)
    setError('list', null)
    try {
      await services.todoList.create({ workspaceId, projectId, disponibilidadId: selectedDispId, actorUserId: userId, name: listName, description: '' })
      setListName('')
      loadProjectContext(services, projectId)
    } catch (error) {
      setError('list', error instanceof Error ? error.message : 'No se pudo crear lista.')
    } finally {
      setBusy(false)
    }
  }

  const createTask = async () => {
    const services = servicesRef.current
    if (!services || userId === null || !workspaceId || !projectId || !listId) return
    setBusy(true)
    setError('task', null)
    try {
      await services.taskPlanning.createTask({ workspaceId, projectId, todoListId: listId, actorUserId: userId, title: taskTitle, durationMinutes: Number(taskDuration) })
      setTaskTitle('')
      setTaskDuration('30')
      loadKanban(services, listId)
    } catch (error) {
      setError('task', error instanceof Error ? error.message : 'No se pudo crear tarea.')
    } finally {
      setBusy(false)
    }
  }

  const changeStatus = async (taskId: string, toStatus: TaskStatus) => {
    const services = servicesRef.current
    if (!services || userId === null || !workspaceId || !projectId || !listId) return
    setBusy(true)
    setError('task', null)
    try {
      await services.taskPlanning.changeTaskStatus({ workspaceId, projectId, actorUserId: userId, taskId, toStatus })
      loadKanban(services, listId)
    } catch (error) {
      setError('task', error instanceof Error ? error.message : 'No se pudo cambiar estado.')
    } finally {
      setBusy(false)
    }
  }

  if (!ready) return <div className="flex min-h-screen items-center justify-center">Cargando...</div>

  if (route.kind === 'landing') {
    return <LandingView onLogin={() => navigate('/auth?mode=login')} onRegister={() => navigate('/auth?mode=register')} />
  }

  if (route.kind === 'auth') {
    return (
      <AuthCardView
        mode={authMode}
        name={name}
        email={email}
        password={password}
        submitting={busy}
        error={errors.auth}
        onModeChange={(mode) => {
          setAuthMode(mode)
          navigate(`/auth?mode=${mode}`, true)
        }}
        onNameChange={setName}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={() => void submitAuth()}
        onBack={() => navigate('/')}
      />
    )
  }

  const projectPath = (tab: 'overview' | 'disponibilidades' | 'lists' | 'calendar') =>
    workspaceId && projectId ? `/app/workspaces/${workspaceId}/projects/${projectId}/${tab}` : '#'

  return (
    <div className="min-h-screen bg-slate-100 p-4 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <header className="mb-4 rounded-2xl border border-slate-300 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm">Usuario: {userName} ({userEmail}) | Proyecto: {activeProject?.name ?? '-'}</p>
            <button type="button" onClick={logout} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Cerrar sesion</button>
          </div>
        </header>
        <div className="grid gap-4 md:grid-cols-[240px_1fr]">
          <aside className="rounded-2xl border border-slate-300 bg-white p-4">
            <button type="button" onClick={() => navigate('/app/workspaces')} className="mb-2 w-full rounded border border-slate-300 px-2 py-2 text-left text-sm">Workspaces</button>
            {workspaceId ? <button type="button" onClick={() => navigate(`/app/workspaces/${workspaceId}`)} className="mb-2 w-full rounded border border-slate-300 px-2 py-2 text-left text-sm">Proyectos</button> : null}
            {projectId ? (
              <>
                <button type="button" onClick={() => navigate(projectPath('overview'))} className="mb-2 w-full rounded border border-slate-300 px-2 py-2 text-left text-sm">Overview</button>
                <button type="button" onClick={() => navigate(projectPath('disponibilidades'))} className="mb-2 w-full rounded border border-slate-300 px-2 py-2 text-left text-sm">Disponibilidades</button>
                <button type="button" onClick={() => navigate(projectPath('lists'))} className="mb-2 w-full rounded border border-slate-300 px-2 py-2 text-left text-sm">Listas</button>
                <button type="button" onClick={() => navigate(projectPath('calendar'))} className="w-full rounded border border-slate-300 px-2 py-2 text-left text-sm">Calendar proyecto</button>
              </>
            ) : null}
          </aside>

          <main className="space-y-4">
            {route.kind === 'workspaces' ? (
              <section className="rounded-2xl border border-slate-300 bg-white p-4">
                <h1 className="text-lg font-semibold">Workspaces</h1>
                <div className="mt-3 flex gap-2">
                  <input value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} placeholder="Nombre workspace" className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm" />
                  <button type="button" onClick={() => void createWorkspace()} disabled={busy} className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Crear</button>
                </div>
                {errors.workspace ? <p className="mt-2 text-sm text-rose-600">{errors.workspace}</p> : null}
                <div className="mt-3 space-y-2">
                  {workspaces.map((w) => <button key={w.id} type="button" onClick={() => navigate(`/app/workspaces/${w.id}`)} className="block w-full rounded border border-slate-300 px-3 py-2 text-left text-sm">{w.name}</button>)}
                </div>
              </section>
            ) : null}

            {route.kind === 'workspace' ? (
              <section className="rounded-2xl border border-slate-300 bg-white p-4">
                <h1 className="text-lg font-semibold">Proyectos</h1>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Nombre proyecto" className="rounded border border-slate-300 px-3 py-2 text-sm" />
                  <input value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} placeholder="Descripcion" className="rounded border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <button type="button" onClick={() => void createProject()} disabled={busy} className="mt-2 rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Crear proyecto</button>
                {errors.project ? <p className="mt-2 text-sm text-rose-600">{errors.project}</p> : null}
                <div className="mt-3 space-y-2">
                  {projects.map((p) => <button key={p.id} type="button" onClick={() => navigate(`/app/workspaces/${p.workspaceId}/projects/${p.id}/overview`)} className="block w-full rounded border border-slate-300 px-3 py-2 text-left text-sm">{p.name}</button>)}
                </div>
              </section>
            ) : null}

            {route.kind === 'project' && route.tab === 'overview' ? <section className="rounded-2xl border border-slate-300 bg-white p-4"><h1 className="text-lg font-semibold">Overview</h1><p className="text-sm text-slate-600">Proyecto: {activeProject?.name}</p></section> : null}

            {route.kind === 'project' && route.tab === 'disponibilidades' ? (
              <section className="rounded-2xl border border-slate-300 bg-white p-4">
                <h1 className="text-lg font-semibold">Disponibilidades</h1>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <input value={dispName} onChange={(e) => setDispName(e.target.value)} placeholder="Nombre" className="rounded border border-slate-300 px-3 py-2 text-sm" />
                  <input value={dispDescription} onChange={(e) => setDispDescription(e.target.value)} placeholder="Descripcion" className="rounded border border-slate-300 px-3 py-2 text-sm" />
                  <input type="date" value={dispStart} onChange={(e) => setDispStart(e.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm" />
                  <input type="date" value={dispEnd} onChange={(e) => setDispEnd(e.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <button type="button" onClick={() => void createDisponibilidad()} disabled={busy} className="mt-2 rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Crear disponibilidad</button>
                {errors.disponibilidad ? <p className="mt-2 text-sm text-rose-600">{errors.disponibilidad}</p> : null}
                <div className="mt-3 space-y-2">
                  {disponibilidades.map((d) => <div key={d.id} className="rounded border border-slate-300 p-2 text-sm"><p>{d.name} ({d.startDate} - {d.endDate})</p><div className="mt-1 flex gap-2"><button type="button" onClick={() => navigate(`/app/workspaces/${route.workspaceId}/projects/${route.projectId}/disponibilidades/${d.id}`)} className="rounded border border-slate-300 px-2 py-1 text-xs">Segmentos</button><button type="button" onClick={() => navigate(`/app/workspaces/${route.workspaceId}/projects/${route.projectId}/disponibilidades/${d.id}/calendar`)} className="rounded border border-slate-300 px-2 py-1 text-xs">Calendar</button></div></div>)}
                </div>
              </section>
            ) : null}

            {route.kind === 'availability' ? (
              <section className="rounded-2xl border border-slate-300 bg-white p-4">
                <h1 className="text-lg font-semibold">Segmentos</h1>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <input value={segName} onChange={(e) => setSegName(e.target.value)} placeholder="Nombre segmento" className="rounded border border-slate-300 px-3 py-2 text-sm" />
                  <input type="time" value={segStart} onChange={(e) => setSegStart(e.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm" />
                  <input type="time" value={segEnd} onChange={(e) => setSegEnd(e.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm" />
                  <input value={segDates} onChange={(e) => setSegDates(e.target.value)} placeholder="Fechas CSV" className="rounded border border-slate-300 px-3 py-2 text-sm" />
                  <input value={segDaysWeek} onChange={(e) => setSegDaysWeek(e.target.value)} placeholder="Dias semana CSV" className="rounded border border-slate-300 px-3 py-2 text-sm" />
                  <input value={segDaysMonth} onChange={(e) => setSegDaysMonth(e.target.value)} placeholder="Dias mes CSV" className="rounded border border-slate-300 px-3 py-2 text-sm" />
                  <input value={segExclusions} onChange={(e) => setSegExclusions(e.target.value)} placeholder="Exclusiones CSV" className="rounded border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <button type="button" onClick={() => void addSegment()} disabled={busy} className="mt-2 rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Agregar segmento</button>
                {errors.segment ? <p className="mt-2 text-sm text-rose-600">{errors.segment}</p> : null}
              </section>
            ) : null}

            {route.kind === 'project' && route.tab === 'lists' ? (
              <section className="rounded-2xl border border-slate-300 bg-white p-4">
                <h1 className="text-lg font-semibold">Listas</h1>
                <div className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                  <input value={listName} onChange={(e) => setListName(e.target.value)} placeholder="Nombre lista" className="rounded border border-slate-300 px-3 py-2 text-sm" />
                  <select value={selectedDispId} onChange={(e) => setSelectedDispId(e.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm">
                    <option value="">Selecciona disponibilidad</option>
                    {disponibilidades.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <button type="button" onClick={() => void createList()} disabled={busy} className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Crear lista</button>
                </div>
                {errors.list ? <p className="mt-2 text-sm text-rose-600">{errors.list}</p> : null}
                <div className="mt-3 space-y-2">
                  {lists.map((l) => <div key={l.id} className="rounded border border-slate-300 p-2 text-sm"><p>{l.name}</p><button type="button" onClick={() => navigate(`/app/workspaces/${route.workspaceId}/projects/${route.projectId}/lists/${l.id}/kanban`)} className="mt-1 rounded border border-slate-300 px-2 py-1 text-xs">Abrir kanban</button></div>)}
                </div>
              </section>
            ) : null}

            {route.kind === 'kanban' ? (
              <section className="rounded-2xl border border-slate-300 bg-white p-4">
                <h1 className="text-lg font-semibold">Kanban</h1>
                <div className="mt-3 grid gap-2 md:grid-cols-[1fr_140px_auto]">
                  <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Titulo tarea" className="rounded border border-slate-300 px-3 py-2 text-sm" />
                  <input type="number" min={1} value={taskDuration} onChange={(e) => setTaskDuration(e.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm" />
                  <button type="button" onClick={() => void createTask()} disabled={busy} className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Crear tarea</button>
                </div>
                {errors.task ? <p className="mt-2 text-sm text-rose-600">{errors.task}</p> : null}
                <div className="mt-3 grid gap-2 md:grid-cols-4">
                  {TASK_STATUSES.map((status) => (
                    <div key={status} className="rounded border border-slate-300 bg-slate-50 p-2">
                      <p className="text-sm font-semibold">{status}</p>
                      <div className="mt-2 space-y-2">
                        {kanban[status].map((t) => (
                          <div key={t.id} className="rounded border border-slate-300 bg-white p-2">
                            <p className="text-xs font-semibold">{t.title}</p>
                            <p className="text-[11px]">{t.durationMinutes} min</p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {TASK_STATUSES.filter((next) => next !== t.status).map((next) => (
                                <button key={next} type="button" onClick={() => void changeStatus(t.id, next)} className="rounded border border-slate-300 px-1 py-0.5 text-[10px]">{next}</button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {route.kind === 'project' && route.tab === 'calendar' ? (
              <section className="rounded-2xl border border-slate-300 bg-white p-4">
                <h1 className="text-lg font-semibold">Calendar proyecto</h1>
                <div className="mt-2 space-y-1">
                  {Object.keys(projectCalendar).length === 0 ? <p className="text-sm text-slate-500">Sin tareas planificadas.</p> : Object.entries(projectCalendar).sort(([a], [b]) => a.localeCompare(b)).map(([day, count]) => <div key={day} className="rounded border border-slate-300 px-2 py-1 text-sm">{day}: {count} tareas</div>)}
                </div>
              </section>
            ) : null}

            {route.kind === 'availabilityCalendar' ? (
              <section className="rounded-2xl border border-slate-300 bg-white p-4">
                <h1 className="text-lg font-semibold">Calendar disponibilidad</h1>
                {!availabilityPlan ? <p className="text-sm text-slate-500">Sin datos.</p> : (
                  <div className="space-y-2 text-sm">
                    <p>Bloques: {availabilityPlan.plannedBlocks.length}</p>
                    <p>No planificadas: {availabilityPlan.unplannedTaskIds.length}</p>
                    {availabilityPlan.plannedBlocks.map((b) => <div key={`${b.taskId}-${b.scheduledStart}`} className="rounded border border-slate-300 px-2 py-1 text-xs">{b.taskId} | {new Date(b.scheduledStart).toLocaleString()} - {new Date(b.scheduledEnd).toLocaleString()}</div>)}
                  </div>
                )}
              </section>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  )
}

export default App

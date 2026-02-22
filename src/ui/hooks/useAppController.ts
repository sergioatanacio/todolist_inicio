import { useEffect, useRef, useState } from 'react'
import { type AppServices, createAppServices } from '../../aplicacion/AppBootstrap'
import { initDatabase, persistDatabase } from '../../infra/SqliteDatabase'
import {
  type AppRoute,
  isPrivateRoute,
  navigate,
  parseRoute,
} from '../router/AppRoute'
import type {
  AppControllerState,
  TaskStatus,
  UiErrors,
} from '../types/AppUiModels'

const SESSION_KEY = 'todo_user_id'

const parseCsvDates = (raw: string) =>
  raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

const parseCsvNumbers = (raw: string) =>
  raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => Number(s))
    .filter((n) => Number.isInteger(n) && n > 0)

export type AppController = {
  state: AppControllerState
  forms: {
    name: string
    email: string
    password: string
    workspaceName: string
    projectName: string
    projectDescription: string
    dispName: string
    dispDescription: string
    dispStart: string
    dispEnd: string
    segName: string
    segDescription: string
    segStart: string
    segEnd: string
    segDates: string
    segDaysWeek: string
    segDaysMonth: string
    segExclusions: string
    listName: string
    selectedDispId: string
    taskTitle: string
    taskDuration: string
  }
  setForms: {
    setName: (value: string) => void
    setEmail: (value: string) => void
    setPassword: (value: string) => void
    setWorkspaceName: (value: string) => void
    setProjectName: (value: string) => void
    setProjectDescription: (value: string) => void
    setDispName: (value: string) => void
    setDispDescription: (value: string) => void
    setDispStart: (value: string) => void
    setDispEnd: (value: string) => void
    setSegName: (value: string) => void
    setSegDescription: (value: string) => void
    setSegStart: (value: string) => void
    setSegEnd: (value: string) => void
    setSegDates: (value: string) => void
    setSegDaysWeek: (value: string) => void
    setSegDaysMonth: (value: string) => void
    setSegExclusions: (value: string) => void
    setListName: (value: string) => void
    setSelectedDispId: (value: string) => void
    setTaskTitle: (value: string) => void
    setTaskDuration: (value: string) => void
  }
  actions: {
    navigate: (path: string, replace?: boolean) => void
    submitAuth: () => Promise<void>
    logout: () => void
    createWorkspace: () => Promise<void>
    createProject: () => Promise<void>
    createDisponibilidad: () => Promise<void>
    addSegment: () => Promise<void>
    createList: () => Promise<void>
    createTask: () => Promise<void>
    changeStatus: (taskId: string, toStatus: TaskStatus) => Promise<void>
    setAuthMode: (mode: 'login' | 'register') => void
  }
}

const initialErrors: UiErrors = {
  auth: null,
  workspace: null,
  project: null,
  disponibilidad: null,
  segment: null,
  list: null,
  task: null,
}

export const useAppController = (): AppController => {
  const servicesRef = useRef<AppServices | null>(null)

  const [ready, setReady] = useState(false)
  const [route, setRoute] = useState<AppRoute>(() => parseRoute())
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  const [userId, setUserId] = useState<number | null>(null)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')

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
  const [segDescription, setSegDescription] = useState('')
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
  const [errors, setErrors] = useState<UiErrors>(initialErrors)

  const [workspaces, setWorkspaces] = useState<AppControllerState['workspaces']>([])
  const [projects, setProjects] = useState<AppControllerState['projects']>([])
  const [disponibilidades, setDisponibilidades] = useState<
    AppControllerState['disponibilidades']
  >([])
  const [lists, setLists] = useState<AppControllerState['lists']>([])
  const [kanban, setKanban] = useState<AppControllerState['kanban']>({
    PENDING: [],
    IN_PROGRESS: [],
    DONE: [],
    ABANDONED: [],
  })
  const [projectCalendar, setProjectCalendar] = useState<Record<string, number>>({})
  const [availabilityPlan, setAvailabilityPlan] = useState<
    AppControllerState['availabilityPlan']
  >(null)

  const workspaceId =
    route.kind === 'workspace' ||
    route.kind === 'project' ||
    route.kind === 'availability' ||
    route.kind === 'availabilityCalendar' ||
    route.kind === 'kanban'
      ? route.workspaceId
      : null

  const projectId =
    route.kind === 'project' ||
    route.kind === 'availability' ||
    route.kind === 'availabilityCalendar' ||
    route.kind === 'kanban'
      ? route.projectId
      : null

  const disponibilidadId =
    route.kind === 'availability' || route.kind === 'availabilityCalendar'
      ? route.disponibilidadId
      : null

  const listId = route.kind === 'kanban' ? route.listId : null

  const setError = (key: keyof UiErrors, message: string | null) => {
    setErrors((current) => ({ ...current, [key]: message }))
  }

  const loadWorkspaces = (services: AppServices, actorUserId: number) => {
    const rows = services.workspace
      .listByOwnerUserId(actorUserId)
      .map((w) => ({ id: w.id, name: w.name }))
    setWorkspaces(rows)
    return rows
  }

  const loadWorkspaceContext = (
    services: AppServices,
    wsId: string,
    actorUserId: number,
  ) => {
    const rows = services.project
      .listByWorkspace(wsId, actorUserId)
      .map((p) => ({
        id: p.id,
        workspaceId: p.workspaceId,
        name: p.name,
        description: p.description,
      }))
    setProjects(rows)
  }

  const loadProjectContext = (services: AppServices, prjId: string) => {
    const ds = services.disponibilidad.listByProject(prjId).map((d) => ({
      id: d.id,
      projectId: d.projectId,
      name: d.name,
      startDate: d.startDate,
      endDate: d.endDate,
      segments: d.segments.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        startTime: s.startTime,
        endTime: s.endTime,
        specificDates: s.specificDates,
        exclusionDates: s.exclusionDates,
        daysOfWeek: s.daysOfWeek,
        daysOfMonth: s.daysOfMonth,
      })),
    }))
    setDisponibilidades(ds)
    setSelectedDispId((current) => current || ds[0]?.id || '')

    const ls = services.todoList.listByProject(prjId).map((l) => ({
      id: l.id,
      projectId: l.projectId,
      disponibilidadId: l.disponibilidadId,
      name: l.name,
    }))
    setLists(ls)
  }

  const loadKanban = (services: AppServices, todoListId: string) => {
    const data = services.taskPlanning.getKanbanByTodoList(todoListId)
    setKanban({
      PENDING: data.PENDING.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        durationMinutes: t.durationMinutes,
      })),
      IN_PROGRESS: data.IN_PROGRESS.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        durationMinutes: t.durationMinutes,
      })),
      DONE: data.DONE.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        durationMinutes: t.durationMinutes,
      })),
      ABANDONED: data.ABANDONED.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        durationMinutes: t.durationMinutes,
      })),
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
    if (isPrivateRoute(route)) navigate('/', true)
  }, [ready, route, userId])

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
    else {
      setKanban({ PENDING: [], IN_PROGRESS: [], DONE: [], ABANDONED: [] })
    }

    if (route.kind === 'project' && route.tab === 'calendar') {
      setProjectCalendar(services.taskPlanning.buildProjectCalendar(route.projectId))
    } else {
      setProjectCalendar({})
    }

    if (route.kind === 'availabilityCalendar') {
      setAvailabilityPlan(
        services.taskPlanning.buildDisponibilidadCalendar(route.disponibilidadId),
      )
    } else {
      setAvailabilityPlan(null)
    }
  }, [workspaceId, projectId, listId, route, userId])

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

    const result =
      authMode === 'register'
        ? await services.auth.register({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: password.trim(),
          })
        : await services.auth.login({
            email: email.trim().toLowerCase(),
            password: password.trim(),
          })

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
      const created = await services.workspace.createWorkspace({
        ownerUserId: userId,
        name: workspaceName,
      })
      setWorkspaceName('')
      loadWorkspaces(services, userId)
      navigate(`/app/workspaces/${created.id}`)
    } catch (error) {
      setError(
        'workspace',
        error instanceof Error ? error.message : 'No se pudo crear workspace.',
      )
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
      const project = await services.project.createProject({
        workspaceId,
        actorUserId: userId,
        name: projectName,
        description: projectDescription,
      })
      setProjectName('')
      setProjectDescription('')
      loadWorkspaceContext(services, workspaceId, userId)
      navigate(`/app/workspaces/${workspaceId}/projects/${project.id}/overview`)
    } catch (error) {
      setError(
        'project',
        error instanceof Error ? error.message : 'No se pudo crear proyecto.',
      )
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
      await services.disponibilidad.create({
        projectId,
        actorUserId: userId,
        name: dispName,
        description: dispDescription,
        startDate: dispStart,
        endDate: dispEnd,
      })
      setDispName('')
      setDispDescription('')
      setDispStart('')
      setDispEnd('')
      loadProjectContext(services, projectId)
    } catch (error) {
      setError(
        'disponibilidad',
        error instanceof Error
          ? error.message
          : 'No se pudo crear disponibilidad.',
      )
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
        description: segDescription,
        startTime: segStart,
        endTime: segEnd,
        specificDates: parseCsvDates(segDates),
        exclusionDates: parseCsvDates(segExclusions),
        daysOfWeek: parseCsvNumbers(segDaysWeek),
        daysOfMonth: parseCsvNumbers(segDaysMonth),
      })
      setSegName('')
      setSegDescription('')
      setSegStart('')
      setSegEnd('')
      setSegDates('')
      setSegDaysWeek('')
      setSegDaysMonth('')
      setSegExclusions('')
      loadProjectContext(services, projectId)
    } catch (error) {
      setError(
        'segment',
        error instanceof Error ? error.message : 'No se pudo agregar segmento.',
      )
    } finally {
      setBusy(false)
    }
  }

  const createList = async () => {
    const services = servicesRef.current
    if (!services || userId === null || !workspaceId || !projectId || !selectedDispId) {
      return
    }
    setBusy(true)
    setError('list', null)
    try {
      await services.todoList.create({
        workspaceId,
        projectId,
        disponibilidadId: selectedDispId,
        actorUserId: userId,
        name: listName,
        description: '',
      })
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
      await services.taskPlanning.createTask({
        workspaceId,
        projectId,
        todoListId: listId,
        actorUserId: userId,
        title: taskTitle,
        durationMinutes: Number(taskDuration),
      })
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
      await services.taskPlanning.changeTaskStatus({
        workspaceId,
        projectId,
        actorUserId: userId,
        taskId,
        toStatus,
      })
      loadKanban(services, listId)
    } catch (error) {
      setError(
        'task',
        error instanceof Error ? error.message : 'No se pudo cambiar estado.',
      )
    } finally {
      setBusy(false)
    }
  }

  const state: AppControllerState = {
    ready,
    route,
    authMode,
    userId,
    userName,
    userEmail,
    busy,
    errors,
    workspaces,
    projects,
    disponibilidades,
    lists,
    kanban,
    projectCalendar,
    availabilityPlan,
    context: {
      workspaceId,
      projectId,
      disponibilidadId,
      listId,
    },
  }

  return {
    state,
    forms: {
      name,
      email,
      password,
      workspaceName,
      projectName,
      projectDescription,
      dispName,
      dispDescription,
      dispStart,
      dispEnd,
      segName,
      segDescription,
      segStart,
      segEnd,
      segDates,
      segDaysWeek,
      segDaysMonth,
      segExclusions,
      listName,
      selectedDispId,
      taskTitle,
      taskDuration,
    },
    setForms: {
      setName,
      setEmail,
      setPassword,
      setWorkspaceName,
      setProjectName,
      setProjectDescription,
      setDispName,
      setDispDescription,
      setDispStart,
      setDispEnd,
      setSegName,
      setSegDescription,
      setSegStart,
      setSegEnd,
      setSegDates,
      setSegDaysWeek,
      setSegDaysMonth,
      setSegExclusions,
      setListName,
      setSelectedDispId,
      setTaskTitle,
      setTaskDuration,
    },
    actions: {
      navigate,
      submitAuth,
      logout,
      createWorkspace,
      createProject,
      createDisponibilidad,
      addSegment,
      createList,
      createTask,
      changeStatus,
      setAuthMode,
    },
  }
}

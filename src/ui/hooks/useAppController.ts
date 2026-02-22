import { useEffect, useMemo, useRef, useState } from 'react'
import { type AppServices, createAppServices } from '../../aplicacion/AppBootstrap'
import { initDatabase, persistDatabase } from '../../infra/SqliteDatabase'
import { createAppDataLoaders } from './app/createAppDataLoaders'
import { parseCsvDates, parseCsvNumbers } from './app/parsers'
import { useRouteState } from './app/useRouteState'
import { useSessionState } from './state/useSessionState'
import type { UiForms, UiFormSetters } from './state/useUiForms'
import { useUiForms } from './state/useUiForms'
import { useUiDataState } from './state/useUiDataState'
import { useUiErrors } from './state/useUiErrors'
import {
  isPrivateRoute,
  navigate,
  parseRoute,
} from '../router/AppRoute'
import type { AppControllerState, TaskStatus } from '../types/AppUiModels'

const SESSION_KEY = 'todo_user_id'

export type AppController = {
  state: AppControllerState
  forms: UiForms
  setForms: UiFormSetters
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

export const useAppController = (): AppController => {
  const servicesRef = useRef<AppServices | null>(null)

  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)

  const { route, authMode, setAuthMode, context } = useRouteState()
  const { forms, setForms } = useUiForms()
  const { errors, setError } = useUiErrors()
  const { userId, userName, userEmail, setSession, clearSession } = useSessionState()
  const { data, setters, clearers } = useUiDataState()

  const loaders = useMemo(
    () =>
      createAppDataLoaders({
        ...setters,
        setSelectedDispId: setForms.setSelectedDispId,
      }),
    [setForms.setSelectedDispId, setters],
  )

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
          setSession({ id: session.id, name: session.name, email: session.email })
          const workspaces = loaders.loadWorkspaces(services, session.id)
          const currentRoute = parseRoute()
          if (currentRoute.kind === 'landing' || currentRoute.kind === 'auth') {
            navigate(
              workspaces[0] ? `/app/workspaces/${workspaces[0].id}` : '/app/workspaces',
              true,
            )
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

    loaders.loadWorkspaces(services, userId)

    if (context.workspaceId) {
      loaders.loadWorkspaceContext(services, context.workspaceId, userId)
    } else {
      clearers.clearProjects()
    }

    if (context.projectId) {
      loaders.loadProjectContext(services, context.projectId)
    } else {
      clearers.clearProjectContext()
    }

    if (context.listId) {
      loaders.loadKanban(services, context.listId)
    } else {
      clearers.clearKanban()
    }

    if (route.kind === 'project' && route.tab === 'calendar') {
      setters.setProjectCalendar(
        services.taskPlanning.buildProjectCalendarDetailed(route.projectId, Date.now()),
      )
    } else {
      clearers.clearProjectCalendar()
    }

    if (route.kind === 'availabilityCalendar') {
      setters.setAvailabilityPlan(
        services.taskPlanning.buildDisponibilidadCalendar(route.disponibilidadId),
      )
    } else {
      clearers.clearAvailabilityPlan()
    }
  }, [clearers, context, loaders, route, setters, userId])

  const submitAuth = async () => {
    const services = servicesRef.current
    if (!services) return

    setBusy(true)
    setError('auth', null)

    if (
      !forms.email.trim() ||
      !forms.password.trim() ||
      (authMode === 'register' && !forms.name.trim())
    ) {
      setError('auth', 'Completa los campos requeridos.')
      setBusy(false)
      return
    }

    const result =
      authMode === 'register'
        ? await services.auth.register({
            name: forms.name.trim(),
            email: forms.email.trim().toLowerCase(),
            password: forms.password.trim(),
          })
        : await services.auth.login({
            email: forms.email.trim().toLowerCase(),
            password: forms.password.trim(),
          })

    if (!result.ok) {
      setError('auth', 'error' in result ? result.error : 'No se pudo autenticar.')
      setBusy(false)
      return
    }

    setSession({
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
    })
    localStorage.setItem(SESSION_KEY, String(result.user.id))

    const workspaces = loaders.loadWorkspaces(services, result.user.id)
    navigate(workspaces[0] ? `/app/workspaces/${workspaces[0].id}` : '/app/workspaces')
    setBusy(false)
  }

  const logout = () => {
    clearSession()
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
        name: forms.workspaceName,
      })
      setForms.setWorkspaceName('')
      loaders.loadWorkspaces(services, userId)
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
    if (!services || userId === null || !context.workspaceId) return
    setBusy(true)
    setError('project', null)
    try {
      const project = await services.project.createProject({
        workspaceId: context.workspaceId,
        actorUserId: userId,
        name: forms.projectName,
        description: forms.projectDescription,
      })
      setForms.setProjectName('')
      setForms.setProjectDescription('')
      loaders.loadWorkspaceContext(services, context.workspaceId, userId)
      navigate(`/app/workspaces/${context.workspaceId}/projects/${project.id}/overview`)
    } catch (error) {
      setError('project', error instanceof Error ? error.message : 'No se pudo crear proyecto.')
    } finally {
      setBusy(false)
    }
  }

  const createDisponibilidad = async () => {
    const services = servicesRef.current
    if (!services || userId === null || !context.projectId) return
    setBusy(true)
    setError('disponibilidad', null)
    try {
      await services.disponibilidad.create({
        projectId: context.projectId,
        actorUserId: userId,
        name: forms.dispName,
        description: forms.dispDescription,
        startDate: forms.dispStart,
        endDate: forms.dispEnd,
      })
      setForms.setDispName('')
      setForms.setDispDescription('')
      setForms.setDispStart('')
      setForms.setDispEnd('')
      loaders.loadProjectContext(services, context.projectId)
    } catch (error) {
      setError(
        'disponibilidad',
        error instanceof Error ? error.message : 'No se pudo crear disponibilidad.',
      )
    } finally {
      setBusy(false)
    }
  }

  const addSegment = async () => {
    const services = servicesRef.current
    const targetDisponibilidadId = context.disponibilidadId ?? forms.selectedDispId
    if (!services || userId === null || !context.projectId || !targetDisponibilidadId) return
    setBusy(true)
    setError('segment', null)
    try {
      await services.disponibilidad.addSegment({
        projectId: context.projectId,
        disponibilidadId: targetDisponibilidadId,
        actorUserId: userId,
        name: forms.segName,
        description: forms.segDescription,
        startTime: forms.segStart,
        endTime: forms.segEnd,
        specificDates: parseCsvDates(forms.segDates),
        exclusionDates: parseCsvDates(forms.segExclusions),
        daysOfWeek: parseCsvNumbers(forms.segDaysWeek),
        daysOfMonth: parseCsvNumbers(forms.segDaysMonth),
      })
      setForms.setSegName('')
      setForms.setSegDescription('')
      setForms.setSegStart('')
      setForms.setSegEnd('')
      setForms.setSegDates('')
      setForms.setSegDaysWeek('')
      setForms.setSegDaysMonth('')
      setForms.setSegExclusions('')
      loaders.loadProjectContext(services, context.projectId)
    } catch (error) {
      setError('segment', error instanceof Error ? error.message : 'No se pudo agregar segmento.')
    } finally {
      setBusy(false)
    }
  }

  const createList = async () => {
    const services = servicesRef.current
    if (
      !services ||
      userId === null ||
      !context.workspaceId ||
      !context.projectId ||
      !forms.selectedDispId
    ) {
      return
    }
    setBusy(true)
    setError('list', null)
    try {
      await services.todoList.create({
        workspaceId: context.workspaceId,
        projectId: context.projectId,
        disponibilidadId: forms.selectedDispId,
        actorUserId: userId,
        name: forms.listName,
        description: '',
      })
      setForms.setListName('')
      loaders.loadProjectContext(services, context.projectId)
    } catch (error) {
      setError('list', error instanceof Error ? error.message : 'No se pudo crear lista.')
    } finally {
      setBusy(false)
    }
  }

  const createTask = async () => {
    const services = servicesRef.current
    if (!services || userId === null || !context.workspaceId || !context.projectId || !context.listId) {
      return
    }
    setBusy(true)
    setError('task', null)
    try {
      await services.taskPlanning.createTask({
        workspaceId: context.workspaceId,
        projectId: context.projectId,
        todoListId: context.listId,
        actorUserId: userId,
        title: forms.taskTitle,
        durationMinutes: Number(forms.taskDuration),
      })
      setForms.setTaskTitle('')
      setForms.setTaskDuration('30')
      loaders.loadKanban(services, context.listId)
    } catch (error) {
      setError('task', error instanceof Error ? error.message : 'No se pudo crear tarea.')
    } finally {
      setBusy(false)
    }
  }

  const changeStatus = async (taskId: string, toStatus: TaskStatus) => {
    const services = servicesRef.current
    if (!services || userId === null || !context.workspaceId || !context.projectId || !context.listId) {
      return
    }
    setBusy(true)
    setError('task', null)
    try {
      await services.taskPlanning.changeTaskStatus({
        workspaceId: context.workspaceId,
        projectId: context.projectId,
        actorUserId: userId,
        taskId,
        toStatus,
      })
      loaders.loadKanban(services, context.listId)
    } catch (error) {
      setError('task', error instanceof Error ? error.message : 'No se pudo cambiar estado.')
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
    workspaces: data.workspaces,
    projects: data.projects,
    disponibilidades: data.disponibilidades,
    lists: data.lists,
    kanban: data.kanban,
    projectCalendar: data.projectCalendar,
    availabilityPlan: data.availabilityPlan,
    context,
  }

  return {
    state,
    forms,
    setForms,
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

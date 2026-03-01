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
const parseCsvStrings = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

export type AppController = {
  state: AppControllerState
  forms: UiForms
  setForms: UiFormSetters
  actions: {
    navigate: (path: string, replace?: boolean) => void
    submitAuth: () => Promise<void>
    logout: () => void
    createWorkspace: () => Promise<void>
    updateWorkspace: (workspaceId: string, name: string) => Promise<void>
    createProject: () => Promise<void>
    updateProject: (
      projectId: string,
      name: string,
      description: string,
    ) => Promise<void>
    createDisponibilidad: () => Promise<void>
    updateSegment: (
      segmentId: string,
      data: {
        name: string
        description: string
        startTime: string
        endTime: string
        specificDates: string
        exclusionDates: string
        daysOfWeek: string
        daysOfMonth: string
      },
    ) => Promise<void>
    updateDisponibilidad: (
      disponibilidadId: string,
      data: {
        name: string
        description: string
        startDate: string
        endDate: string
      },
    ) => Promise<void>
    addSegment: () => Promise<void>
    createList: () => Promise<void>
    updateList: (todoListId: string, data: { name: string; description: string }) => Promise<void>
    createTask: () => Promise<void>
    updateTask: (
      taskId: string,
      data: { title: string; durationMinutes: number },
    ) => Promise<void>
    changeStatus: (taskId: string, toStatus: TaskStatus) => Promise<void>
    createAiAgent: () => Promise<void>
    setAiAgentState: (
      agentId: string,
      action: 'pause' | 'activate' | 'revoke',
    ) => Promise<void>
    registerAiCredential: () => Promise<void>
    rotateAiCredential: () => Promise<void>
    revokeAiCredential: () => Promise<void>
    saveAiCredentialSecret: () => Promise<void>
    startAiConversation: () => Promise<void>
    selectAiConversation: (conversationId: string) => void
    sendAiChatMessage: () => Promise<void>
    approveAiCommand: (commandId: string) => Promise<void>
    rejectAiCommand: (commandId: string) => Promise<void>
    executeAiCommand: (commandId: string) => Promise<void>
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

    if (route.kind === 'workspaceAi' && context.workspaceId) {
      loaders.loadAiWorkspaceContext(services, context.workspaceId, userId)
    } else if (
      route.kind === 'project' &&
      route.tab === 'ai' &&
      context.workspaceId &&
      context.projectId
    ) {
      loaders.loadAiProjectContext(
        services,
        context.workspaceId,
        context.projectId,
        userId,
      )
    } else {
      clearers.clearAiContext()
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

  const updateWorkspace = async (workspaceId: string, name: string) => {
    const services = servicesRef.current
    if (!services || userId === null) return
    setBusy(true)
    setError('workspace', null)
    try {
      await services.workspace.updateWorkspace({
        workspaceId,
        actorUserId: userId,
        name,
      })
      loaders.loadWorkspaces(services, userId)
    } catch (error) {
      setError(
        'workspace',
        error instanceof Error ? error.message : 'No se pudo editar workspace.',
      )
    } finally {
      setBusy(false)
    }
  }

  const updateProject = async (
    projectId: string,
    name: string,
    description: string,
  ) => {
    const services = servicesRef.current
    if (!services || userId === null || !context.workspaceId) return
    setBusy(true)
    setError('project', null)
    try {
      await services.project.updateProject({
        workspaceId: context.workspaceId,
        projectId,
        actorUserId: userId,
        name,
        description,
      })
      loaders.loadWorkspaceContext(services, context.workspaceId, userId)
    } catch (error) {
      setError(
        'project',
        error instanceof Error ? error.message : 'No se pudo editar proyecto.',
      )
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

  const updateDisponibilidad = async (
    disponibilidadId: string,
    data: {
      name: string
      description: string
      startDate: string
      endDate: string
    },
  ) => {
    const services = servicesRef.current
    if (!services || userId === null || !context.projectId) return
    setBusy(true)
    setError('disponibilidad', null)
    try {
      await services.disponibilidad.update({
        projectId: context.projectId,
        disponibilidadId,
        actorUserId: userId,
        ...data,
      })
      loaders.loadProjectContext(services, context.projectId)
    } catch (error) {
      setError(
        'disponibilidad',
        error instanceof Error ? error.message : 'No se pudo editar disponibilidad.',
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

  const updateSegment = async (
    segmentId: string,
    data: {
      name: string
      description: string
      startTime: string
      endTime: string
      specificDates: string
      exclusionDates: string
      daysOfWeek: string
      daysOfMonth: string
    },
  ) => {
    const services = servicesRef.current
    const targetDisponibilidadId = context.disponibilidadId ?? forms.selectedDispId
    if (!services || userId === null || !context.projectId || !targetDisponibilidadId) return
    setBusy(true)
    setError('segment', null)
    try {
      await services.disponibilidad.updateSegment({
        projectId: context.projectId,
        disponibilidadId: targetDisponibilidadId,
        segmentId,
        actorUserId: userId,
        name: data.name,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        specificDates: parseCsvDates(data.specificDates),
        exclusionDates: parseCsvDates(data.exclusionDates),
        daysOfWeek: parseCsvNumbers(data.daysOfWeek),
        daysOfMonth: parseCsvNumbers(data.daysOfMonth),
      })
      loaders.loadProjectContext(services, context.projectId)
    } catch (error) {
      setError('segment', error instanceof Error ? error.message : 'No se pudo editar segmento.')
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

  const updateList = async (
    todoListId: string,
    data: { name: string; description: string },
  ) => {
    const services = servicesRef.current
    if (!services || userId === null || !context.workspaceId || !context.projectId) {
      return
    }
    setBusy(true)
    setError('list', null)
    try {
      await services.todoList.update({
        workspaceId: context.workspaceId,
        projectId: context.projectId,
        todoListId,
        actorUserId: userId,
        name: data.name,
        description: data.description,
      })
      loaders.loadProjectContext(services, context.projectId)
    } catch (error) {
      setError('list', error instanceof Error ? error.message : 'No se pudo editar lista.')
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

  const updateTask = async (
    taskId: string,
    data: { title: string; durationMinutes: number },
  ) => {
    const services = servicesRef.current
    if (!services || userId === null || !context.workspaceId || !context.projectId || !context.listId) {
      return
    }
    setBusy(true)
    setError('task', null)
    try {
      await services.taskPlanning.updateTask({
        workspaceId: context.workspaceId,
        projectId: context.projectId,
        actorUserId: userId,
        taskId,
        title: data.title,
        durationMinutes: data.durationMinutes,
      })
      loaders.loadKanban(services, context.listId)
    } catch (error) {
      setError('task', error instanceof Error ? error.message : 'No se pudo editar tarea.')
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

  const createAiAgent = async () => {
    const services = servicesRef.current
    if (!services || userId === null || !context.workspaceId) return
    setBusy(true)
    setError('aiWorkspace', null)
    try {
      await services.aiAssistant.createAgent({
        workspaceId: context.workspaceId,
        actorUserId: userId,
        provider: forms.aiAgentProvider,
        model: forms.aiAgentModel,
        policy: {
          allowedIntents: parseCsvStrings(forms.aiAllowedIntentsCsv),
          requireApprovalForWrites: forms.aiRequireApprovalForWrites,
        },
      })
      loaders.loadAiWorkspaceContext(services, context.workspaceId, userId)
    } catch (error) {
      setError('aiWorkspace', error instanceof Error ? error.message : 'No se pudo crear agente.')
    } finally {
      setBusy(false)
    }
  }

  const setAiAgentState = async (
    agentId: string,
    action: 'pause' | 'activate' | 'revoke',
  ) => {
    const services = servicesRef.current
    if (!services || userId === null || !context.workspaceId) return
    setBusy(true)
    setError('aiWorkspace', null)
    try {
      await services.aiAssistant.setAgentState({
        agentId,
        actorUserId: userId,
        action,
      })
      loaders.loadAiWorkspaceContext(services, context.workspaceId, userId)
    } catch (error) {
      setError(
        'aiWorkspace',
        error instanceof Error ? error.message : 'No se pudo actualizar estado del agente.',
      )
    } finally {
      setBusy(false)
    }
  }

  const registerAiCredential = async () => {
    const services = servicesRef.current
    if (!services || userId === null || !context.workspaceId) return
    setBusy(true)
    setError('aiWorkspace', null)
    try {
      await services.aiAssistant.registerUserCredential({
        workspaceId: context.workspaceId,
        userId,
        actorUserId: userId,
        provider: forms.aiCredentialProvider,
        credentialRef: forms.aiCredentialRef,
      })
      loaders.loadAiWorkspaceContext(services, context.workspaceId, userId)
    } catch (error) {
      setError('aiWorkspace', error instanceof Error ? error.message : 'No se pudo registrar credencial.')
    } finally {
      setBusy(false)
    }
  }

  const rotateAiCredential = async () => {
    const services = servicesRef.current
    if (!services || userId === null || !context.workspaceId) return
    setBusy(true)
    setError('aiWorkspace', null)
    try {
      await services.aiAssistant.rotateUserCredential({
        workspaceId: context.workspaceId,
        userId,
        actorUserId: userId,
        credentialRef: forms.aiCredentialRef,
      })
      loaders.loadAiWorkspaceContext(services, context.workspaceId, userId)
    } catch (error) {
      setError('aiWorkspace', error instanceof Error ? error.message : 'No se pudo rotar credencial.')
    } finally {
      setBusy(false)
    }
  }

  const revokeAiCredential = async () => {
    const services = servicesRef.current
    if (!services || userId === null || !context.workspaceId) return
    setBusy(true)
    setError('aiWorkspace', null)
    try {
      await services.aiAssistant.revokeUserCredential({
        workspaceId: context.workspaceId,
        userId,
        actorUserId: userId,
      })
      loaders.loadAiWorkspaceContext(services, context.workspaceId, userId)
    } catch (error) {
      setError('aiWorkspace', error instanceof Error ? error.message : 'No se pudo revocar credencial.')
    } finally {
      setBusy(false)
    }
  }

  const saveAiCredentialSecret = async () => {
    const services = servicesRef.current
    if (!services || userId === null || !context.workspaceId) return
    setBusy(true)
    setError('aiWorkspace', null)
    try {
      await services.aiAssistant.setUserCredentialSecret({
        workspaceId: context.workspaceId,
        userId,
        actorUserId: userId,
        secret: forms.aiCredentialSecret,
      })
      setForms.setAiCredentialSecret('')
      loaders.loadAiWorkspaceContext(services, context.workspaceId, userId)
    } catch (error) {
      setError('aiWorkspace', error instanceof Error ? error.message : 'No se pudo guardar token.')
    } finally {
      setBusy(false)
    }
  }

  const startAiConversation = async () => {
    const services = servicesRef.current
    const agentId = forms.aiSelectedAgentId || data.aiAgents[0]?.id
    if (!services || userId === null || !context.workspaceId || !context.projectId || !agentId) return
    setBusy(true)
    setError('aiProject', null)
    try {
      await services.aiAssistant.startConversation({
        workspaceId: context.workspaceId,
        projectId: context.projectId,
        actorUserId: userId,
        agentId,
      })
      loaders.loadAiProjectContext(services, context.workspaceId, context.projectId, userId)
    } catch (error) {
      setError('aiProject', error instanceof Error ? error.message : 'No se pudo iniciar conversacion.')
    } finally {
      setBusy(false)
    }
  }

  const selectAiConversation = (conversationId: string) => {
    setters.setAiSelectedConversationId(conversationId)
  }

  const sendAiChatMessage = async () => {
    const services = servicesRef.current
    const conversationId = data.aiSelectedConversationId
    if (
      !services ||
      userId === null ||
      !context.workspaceId ||
      !context.projectId ||
      !conversationId
    ) {
      return
    }
    setBusy(true)
    setError('aiProject', null)
    try {
      await services.aiAssistant.sendChatMessage({
        conversationId,
        actorUserId: userId,
        message: forms.aiChatMessage,
      })
      setForms.setAiChatMessage('')
      loaders.loadAiProjectContext(services, context.workspaceId, context.projectId, userId)
    } catch (error) {
      setError('aiProject', error instanceof Error ? error.message : 'No se pudo enviar mensaje.')
    } finally {
      setBusy(false)
    }
  }

  const approveAiCommand = async (commandId: string) => {
    const services = servicesRef.current
    const conversationId = data.aiSelectedConversationId
    if (
      !services ||
      userId === null ||
      !context.workspaceId ||
      !context.projectId ||
      !conversationId
    ) {
      return
    }
    setBusy(true)
    setError('aiProject', null)
    try {
      await services.aiAssistant.approveCommand({
        conversationId,
        commandId,
        actorUserId: userId,
      })
      loaders.loadAiProjectContext(services, context.workspaceId, context.projectId, userId)
    } catch (error) {
      setError('aiProject', error instanceof Error ? error.message : 'No se pudo aprobar comando.')
    } finally {
      setBusy(false)
    }
  }

  const rejectAiCommand = async (commandId: string) => {
    const services = servicesRef.current
    const conversationId = data.aiSelectedConversationId
    if (
      !services ||
      userId === null ||
      !context.workspaceId ||
      !context.projectId ||
      !conversationId
    ) {
      return
    }
    setBusy(true)
    setError('aiProject', null)
    try {
      await services.aiAssistant.rejectCommand({
        conversationId,
        commandId,
        actorUserId: userId,
      })
      loaders.loadAiProjectContext(services, context.workspaceId, context.projectId, userId)
    } catch (error) {
      setError('aiProject', error instanceof Error ? error.message : 'No se pudo rechazar comando.')
    } finally {
      setBusy(false)
    }
  }

  const executeAiCommand = async (commandId: string) => {
    const services = servicesRef.current
    const conversationId = data.aiSelectedConversationId
    if (
      !services ||
      userId === null ||
      !context.workspaceId ||
      !context.projectId ||
      !conversationId
    ) {
      return
    }
    setBusy(true)
    setError('aiProject', null)
    try {
      await services.aiAssistant.executeCommand({
        conversationId,
        commandId,
        actorUserId: userId,
      })
      loaders.loadAiProjectContext(services, context.workspaceId, context.projectId, userId)
    } catch (error) {
      setError('aiProject', error instanceof Error ? error.message : 'No se pudo ejecutar comando.')
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
    aiAgents: data.aiAgents,
    aiConversations: data.aiConversations,
    aiSelectedConversationId: data.aiSelectedConversationId,
    aiUserCredential: data.aiUserCredential,
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
      updateWorkspace,
      createProject,
      updateProject,
      createDisponibilidad,
      updateSegment,
      updateDisponibilidad,
      addSegment,
      createList,
      updateList,
      createTask,
      updateTask,
      changeStatus,
      createAiAgent,
      setAiAgentState,
      registerAiCredential,
      rotateAiCredential,
      revokeAiCredential,
      saveAiCredentialSecret,
      startAiConversation,
      selectAiConversation,
      sendAiChatMessage,
      approveAiCommand,
      rejectAiCommand,
      executeAiCommand,
      setAuthMode,
    },
  }
}

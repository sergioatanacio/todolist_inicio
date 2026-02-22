import { useEffect, useRef, useState } from 'react'
import { type AppServices, createAppServices } from './aplicacion/AppBootstrap'
import { initDatabase, persistDatabase } from './infra/SqliteDatabase'
import { AuthCardView } from './ui/auth/AuthCardView'
import { LandingView } from './ui/landing/LandingView'
import { WorkspaceHomeView } from './ui/workspace/WorkspaceHomeView'

type Screen = 'landing' | 'auth' | 'workspace'
type AuthMode = 'login' | 'register'
type CreatedWorkspace = {
  id: string
  name: string
  createdAt: number
}
type CreatedProject = {
  id: string
  workspaceId: string
  name: string
  description: string
}
type CreatedDisponibilidad = {
  id: string
  projectId: string
  name: string
  description: string
  startDate: string
  endDate: string
  segments: Array<{
    id: string
    name: string
    description: string
    startTime: string
    endTime: string
  }>
}
type CreatedTodoList = {
  id: string
  projectId: string
  disponibilidadId: string
  name: string
  description: string
}

const SESSION_KEY = 'todo_user_id'

function App() {
  const servicesRef = useRef<AppServices | null>(null)
  const [ready, setReady] = useState(false)
  const [screen, setScreen] = useState<Screen>('landing')
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [userId, setUserId] = useState<number | null>(null)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [submittingAuth, setSubmittingAuth] = useState(false)
  const [workspaceName, setWorkspaceName] = useState('')
  const [workspaceError, setWorkspaceError] = useState<string | null>(null)
  const [creatingWorkspace, setCreatingWorkspace] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectError, setProjectError] = useState<string | null>(null)
  const [creatingProject, setCreatingProject] = useState(false)
  const [disponibilidadStartDate, setDisponibilidadStartDate] = useState('')
  const [disponibilidadEndDate, setDisponibilidadEndDate] = useState('')
  const [disponibilidadName, setDisponibilidadName] = useState('')
  const [disponibilidadDescription, setDisponibilidadDescription] = useState('')
  const [disponibilidadError, setDisponibilidadError] = useState<string | null>(null)
  const [creatingDisponibilidad, setCreatingDisponibilidad] = useState(false)
  const [segmentName, setSegmentName] = useState('')
  const [segmentDescription, setSegmentDescription] = useState('')
  const [segmentStartTime, setSegmentStartTime] = useState('')
  const [segmentEndTime, setSegmentEndTime] = useState('')
  const [segmentError, setSegmentError] = useState<string | null>(null)
  const [creatingSegment, setCreatingSegment] = useState(false)
  const [todoListName, setTodoListName] = useState('')
  const [todoListDescription, setTodoListDescription] = useState('')
  const [selectedDisponibilidadId, setSelectedDisponibilidadId] = useState('')
  const [todoListError, setTodoListError] = useState<string | null>(null)
  const [creatingTodoList, setCreatingTodoList] = useState(false)
  const [createdWorkspaces, setCreatedWorkspaces] = useState<CreatedWorkspace[]>(
    [],
  )
  const [createdProjects, setCreatedProjects] = useState<CreatedProject[]>([])
  const [createdDisponibilidades, setCreatedDisponibilidades] = useState<
    CreatedDisponibilidad[]
  >([])
  const [createdTodoLists, setCreatedTodoLists] = useState<CreatedTodoList[]>([])
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

  const loadWorkspaceData = (
    services: AppServices,
    workspaceId: string,
    actorUserId: number,
  ) => {
    const projects = services.project
      .listByWorkspace(workspaceId, actorUserId)
      .map((project) => ({
        id: project.id,
        workspaceId: project.workspaceId,
        name: project.name,
        description: project.description,
      }))
    setCreatedProjects(projects)

    const nextProjectId = projects[0]?.id ?? null
    setActiveProjectId(nextProjectId)
    if (nextProjectId) {
      const disponibilidades = services.disponibilidad
        .listByProject(nextProjectId)
        .map((item) => ({
          id: item.id,
          projectId: item.projectId,
          name: item.name,
          description: item.description,
          startDate: item.startDate,
          endDate: item.endDate,
          segments: item.segments.map((segment) => ({
            id: segment.id,
            name: segment.name,
            description: segment.description,
            startTime: segment.startTime,
            endTime: segment.endTime,
          })),
        }))
      setCreatedDisponibilidades(disponibilidades)
      setSelectedDisponibilidadId(disponibilidades[0]?.id ?? '')
      const todoLists = services.todoList.listByProject(nextProjectId).map((item) => ({
        id: item.id,
        projectId: item.projectId,
        disponibilidadId: item.disponibilidadId,
        name: item.name,
        description: item.description,
      }))
      setCreatedTodoLists(todoLists)
    } else {
      setCreatedDisponibilidades([])
      setCreatedTodoLists([])
    }
  }

  useEffect(() => {
    let mounted = true
    const bootstrap = async () => {
      const db = await initDatabase()
      if (!mounted) return
      servicesRef.current = createAppServices(db, persistDatabase)

      const storedUser = localStorage.getItem(SESSION_KEY)
      if (storedUser && servicesRef.current) {
        const record = servicesRef.current.auth.restoreSession(Number(storedUser))
        if (record) {
          setUserId(record.id)
          setUserName(record.name)
          setUserEmail(record.email)
          const workspaces = servicesRef.current.workspace
            .listByOwnerUserId(record.id)
            .map((workspace) => ({
              id: workspace.id,
              name: workspace.name,
              createdAt: workspace.createdAt,
            }))
          setCreatedWorkspaces(workspaces)
          if (workspaces[0]) {
            setActiveWorkspaceId(workspaces[0].id)
            loadWorkspaceData(servicesRef.current, workspaces[0].id, record.id)
          }
          setScreen('workspace')
        } else {
          localStorage.removeItem(SESSION_KEY)
        }
      }
      setReady(true)
    }
    void bootstrap()
    return () => {
      mounted = false
    }
  }, [])

  const handleAuthSubmit = async () => {
    const services = servicesRef.current
    if (!services) return
    setSubmittingAuth(true)
    setAuthError(null)
    if (
      !email.trim() ||
      !password.trim() ||
      (authMode === 'register' && !name.trim())
    ) {
      setAuthError('Completa los campos requeridos.')
      setSubmittingAuth(false)
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
      setAuthError('error' in result ? result.error : 'No se pudo autenticar.')
      setSubmittingAuth(false)
      return
    }

    setUserId(result.user.id)
    setUserName(result.user.name)
    setUserEmail(result.user.email)
    localStorage.setItem(SESSION_KEY, String(result.user.id))
    setPassword('')
    setScreen('workspace')
    setSubmittingAuth(false)
  }

  const handleLogout = () => {
    setUserId(null)
    setUserName('')
    setUserEmail('')
    setWorkspaceName('')
    setWorkspaceError(null)
    setCreatedWorkspaces([])
    setCreatedProjects([])
    setCreatedDisponibilidades([])
    setCreatedTodoLists([])
    setActiveWorkspaceId(null)
    setActiveProjectId(null)
    setProjectName('')
    setProjectDescription('')
    setProjectError(null)
    setDisponibilidadStartDate('')
    setDisponibilidadEndDate('')
    setDisponibilidadName('')
    setDisponibilidadDescription('')
    setDisponibilidadError(null)
    setSegmentName('')
    setSegmentDescription('')
    setSegmentStartTime('')
    setSegmentEndTime('')
    setSegmentError(null)
    setTodoListName('')
    setTodoListDescription('')
    setSelectedDisponibilidadId('')
    setTodoListError(null)
    localStorage.removeItem(SESSION_KEY)
    setScreen('landing')
  }

  const handleCreateWorkspace = async () => {
    const services = servicesRef.current
    if (!services || userId === null) return
    setWorkspaceError(null)
    setCreatingWorkspace(true)
    try {
      const created = await services.workspace.createWorkspace({
        ownerUserId: userId,
        name: workspaceName,
      })
      const refreshed = services.workspace
        .listByOwnerUserId(userId)
        .map((workspace) => ({
          id: workspace.id,
          name: workspace.name,
          createdAt: workspace.createdAt,
        }))
      setCreatedWorkspaces(refreshed)
      setActiveWorkspaceId(created.id)
      loadWorkspaceData(services, created.id, userId)
      setWorkspaceName('')
    } catch (error) {
      setWorkspaceError(
        error instanceof Error ? error.message : 'No se pudo crear el workspace.',
      )
    } finally {
      setCreatingWorkspace(false)
    }
  }

  const handleEnterWorkspace = (workspaceId: string) => {
    setActiveWorkspaceId(workspaceId)
    if (userId === null || !servicesRef.current) return
    loadWorkspaceData(servicesRef.current, workspaceId, userId)
  }

  const handleCreateProject = async () => {
    const services = servicesRef.current
    if (!services || userId === null || activeWorkspaceId === null) return
    setProjectError(null)
    setCreatingProject(true)
    try {
      const created = await services.project.createProject({
        workspaceId: activeWorkspaceId,
        actorUserId: userId,
        name: projectName,
        description: projectDescription,
      })
      setCreatedProjects((current) => [
        {
          id: created.id,
          workspaceId: created.workspaceId,
          name: created.name,
          description: created.description,
        },
        ...current.filter((item) => item.id !== created.id),
      ])
      setActiveProjectId(created.id)
      const todoLists = services.todoList.listByProject(created.id).map((item) => ({
        id: item.id,
        projectId: item.projectId,
        disponibilidadId: item.disponibilidadId,
        name: item.name,
        description: item.description,
      }))
      setCreatedTodoLists(todoLists)
      setCreatedDisponibilidades([])
      setSelectedDisponibilidadId('')
      setProjectName('')
      setProjectDescription('')
    } catch (error) {
      setProjectError(
        error instanceof Error ? error.message : 'No se pudo crear el proyecto.',
      )
    } finally {
      setCreatingProject(false)
    }
  }

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId)
    if (!servicesRef.current) return
    const disponibilidades = servicesRef.current.disponibilidad
      .listByProject(projectId)
      .map((item) => ({
        id: item.id,
        projectId: item.projectId,
        name: item.name,
        description: item.description,
        startDate: item.startDate,
        endDate: item.endDate,
        segments: item.segments.map((segment) => ({
          id: segment.id,
          name: segment.name,
          description: segment.description,
          startTime: segment.startTime,
          endTime: segment.endTime,
        })),
      }))
    setCreatedDisponibilidades(disponibilidades)
    setSelectedDisponibilidadId(disponibilidades[0]?.id ?? '')
    const todoLists = servicesRef.current.todoList
      .listByProject(projectId)
      .map((item) => ({
        id: item.id,
        projectId: item.projectId,
        disponibilidadId: item.disponibilidadId,
        name: item.name,
        description: item.description,
      }))
    setCreatedTodoLists(todoLists)
  }

  const handleCreateDisponibilidad = async () => {
    const services = servicesRef.current
    if (!services || userId === null || activeProjectId === null) return
    setDisponibilidadError(null)
    setCreatingDisponibilidad(true)
    try {
      const created = await services.disponibilidad.create({
        projectId: activeProjectId,
        actorUserId: userId,
        name: disponibilidadName,
        description: disponibilidadDescription,
        startDate: disponibilidadStartDate,
        endDate: disponibilidadEndDate,
      })
      setCreatedDisponibilidades((current) => [
        {
          id: created.id,
          projectId: created.projectId,
          name: created.name,
          description: created.description,
          startDate: created.startDate,
          endDate: created.endDate,
          segments: created.segments.map((segment) => ({
            id: segment.id,
            name: segment.name,
            description: segment.description,
            startTime: segment.startTime,
            endTime: segment.endTime,
          })),
        },
        ...current.filter((item) => item.id !== created.id),
      ])
      if (!selectedDisponibilidadId) {
        setSelectedDisponibilidadId(created.id)
      }
      setDisponibilidadStartDate('')
      setDisponibilidadEndDate('')
      setDisponibilidadName('')
      setDisponibilidadDescription('')
    } catch (error) {
      setDisponibilidadError(
        error instanceof Error
          ? error.message
          : 'No se pudo crear la disponibilidad.',
      )
    } finally {
      setCreatingDisponibilidad(false)
    }
  }

  const handleCreateSegment = async () => {
    const services = servicesRef.current
    if (!services || userId === null || activeProjectId === null || !selectedDisponibilidadId) {
      return
    }
    setSegmentError(null)
    setCreatingSegment(true)
    try {
      const updated = await services.disponibilidad.addSegment({
        projectId: activeProjectId,
        disponibilidadId: selectedDisponibilidadId,
        actorUserId: userId,
        name: segmentName,
        description: segmentDescription,
        startTime: segmentStartTime,
        endTime: segmentEndTime,
        specificDates: [],
        daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
        daysOfMonth: [],
      })
      setCreatedDisponibilidades((current) =>
        current.map((item) =>
          item.id === updated.id
            ? {
                id: updated.id,
                projectId: updated.projectId,
                name: updated.name,
                description: updated.description,
                startDate: updated.startDate,
                endDate: updated.endDate,
                segments: updated.segments.map((segment) => ({
                  id: segment.id,
                  name: segment.name,
                  description: segment.description,
                  startTime: segment.startTime,
                  endTime: segment.endTime,
                })),
              }
            : item,
        ),
      )
      setSegmentName('')
      setSegmentDescription('')
      setSegmentStartTime('')
      setSegmentEndTime('')
    } catch (error) {
      setSegmentError(
        error instanceof Error ? error.message : 'No se pudo crear el segmento.',
      )
    } finally {
      setCreatingSegment(false)
    }
  }

  const handleCreateTodoList = async () => {
    const services = servicesRef.current
    if (
      !services ||
      userId === null ||
      activeWorkspaceId === null ||
      activeProjectId === null
    ) {
      return
    }
    setTodoListError(null)
    setCreatingTodoList(true)
    try {
      const created = await services.todoList.create({
        workspaceId: activeWorkspaceId,
        projectId: activeProjectId,
        disponibilidadId: selectedDisponibilidadId,
        actorUserId: userId,
        name: todoListName,
        description: todoListDescription,
      })
      setCreatedTodoLists((current) => [
        {
          id: created.id,
          projectId: created.projectId,
          disponibilidadId: created.disponibilidadId,
          name: created.name,
          description: created.description,
        },
        ...current.filter((item) => item.id !== created.id),
      ])
      setTodoListName('')
      setTodoListDescription('')
    } catch (error) {
      setTodoListError(
        error instanceof Error
          ? error.message
          : 'No se pudo crear la lista de tareas.',
      )
    } finally {
      setCreatingTodoList(false)
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-700">
        Cargando...
      </div>
    )
  }

  if (screen === 'landing') {
    return (
      <LandingView
        onLogin={() => {
          setAuthMode('login')
          setAuthError(null)
          setScreen('auth')
        }}
        onRegister={() => {
          setAuthMode('register')
          setAuthError(null)
          setScreen('auth')
        }}
      />
    )
  }

  if (screen === 'auth') {
    return (
      <AuthCardView
        mode={authMode}
        name={name}
        email={email}
        password={password}
        submitting={submittingAuth}
        error={authError}
        onModeChange={(mode) => {
          setAuthMode(mode)
          setAuthError(null)
        }}
        onNameChange={setName}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={() => void handleAuthSubmit()}
        onBack={() => setScreen('landing')}
      />
    )
  }

  return (
    <WorkspaceHomeView
      userName={userName}
      userEmail={userEmail}
      workspaceName={workspaceName}
      creatingWorkspace={creatingWorkspace}
      workspaceError={workspaceError}
      projectName={projectName}
      projectDescription={projectDescription}
      creatingProject={creatingProject}
      projectError={projectError}
      disponibilidadStartDate={disponibilidadStartDate}
      disponibilidadEndDate={disponibilidadEndDate}
      disponibilidadName={disponibilidadName}
      disponibilidadDescription={disponibilidadDescription}
      creatingDisponibilidad={creatingDisponibilidad}
      disponibilidadError={disponibilidadError}
      segmentName={segmentName}
      segmentDescription={segmentDescription}
      segmentStartTime={segmentStartTime}
      segmentEndTime={segmentEndTime}
      creatingSegment={creatingSegment}
      segmentError={segmentError}
      todoListName={todoListName}
      todoListDescription={todoListDescription}
      selectedDisponibilidadId={selectedDisponibilidadId}
      creatingTodoList={creatingTodoList}
      todoListError={todoListError}
      activeWorkspaceProjects={
        activeWorkspaceId
          ? createdProjects.filter(
              (project) => project.workspaceId === activeWorkspaceId,
            )
          : []
      }
      activeWorkspaceDisponibilidades={
        activeProjectId
          ? createdDisponibilidades.filter(
              (item) => item.projectId === activeProjectId,
            )
          : []
      }
      activeProjectTodoLists={
        activeProjectId
          ? createdTodoLists.filter((item) => item.projectId === activeProjectId)
          : []
      }
      createdWorkspaces={createdWorkspaces}
      activeWorkspaceId={activeWorkspaceId}
      activeProjectId={activeProjectId}
      onWorkspaceNameChange={setWorkspaceName}
      onProjectNameChange={setProjectName}
      onProjectDescriptionChange={setProjectDescription}
      onDisponibilidadStartDateChange={setDisponibilidadStartDate}
      onDisponibilidadEndDateChange={setDisponibilidadEndDate}
      onDisponibilidadNameChange={setDisponibilidadName}
      onDisponibilidadDescriptionChange={setDisponibilidadDescription}
      onSegmentNameChange={setSegmentName}
      onSegmentDescriptionChange={setSegmentDescription}
      onSegmentStartTimeChange={setSegmentStartTime}
      onSegmentEndTimeChange={setSegmentEndTime}
      onTodoListNameChange={setTodoListName}
      onTodoListDescriptionChange={setTodoListDescription}
      onSelectedDisponibilidadIdChange={setSelectedDisponibilidadId}
      onCreateWorkspace={() => void handleCreateWorkspace()}
      onCreateProject={() => void handleCreateProject()}
      onCreateDisponibilidad={() => void handleCreateDisponibilidad()}
      onCreateSegment={() => void handleCreateSegment()}
      onCreateTodoList={() => void handleCreateTodoList()}
      onSelectProject={handleSelectProject}
      onEnterWorkspace={handleEnterWorkspace}
      onLogout={handleLogout}
    />
  )
}

export default App

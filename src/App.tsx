import { AuthCardView } from './ui/auth/AuthCardView'
import { useAppController } from './ui/hooks/useAppController'
import { AppShell } from './ui/layout/AppShell'
import { AppSidebar } from './ui/layout/AppSidebar'
import { LandingView } from './ui/landing/LandingView'
import {
  AvailabilityCalendarScreen,
  DisponibilidadesScreen,
  KanbanScreen,
  ListsScreen,
  ProjectCalendarScreen,
  ProjectOverviewScreen,
  SegmentsScreen,
  WorkspacesScreen,
  WorkspaceProjectsScreen,
} from './ui/screens/AppScreens'

function App() {
  const { state, forms, setForms, actions } = useAppController()

  if (!state.ready) {
    return <div className="flex min-h-screen items-center justify-center">Cargando...</div>
  }

  if (state.route.kind === 'landing') {
    return (
      <LandingView
        onLogin={() => actions.navigate('/auth?mode=login')}
        onRegister={() => actions.navigate('/auth?mode=register')}
      />
    )
  }

  if (state.route.kind === 'auth') {
    return (
      <AuthCardView
        mode={state.authMode}
        name={forms.name}
        email={forms.email}
        password={forms.password}
        submitting={state.busy}
        error={state.errors.auth}
        onModeChange={(mode) => {
          actions.setAuthMode(mode)
          actions.navigate(`/auth?mode=${mode}`, true)
        }}
        onNameChange={setForms.setName}
        onEmailChange={setForms.setEmail}
        onPasswordChange={setForms.setPassword}
        onSubmit={() => void actions.submitAuth()}
        onBack={() => actions.navigate('/')}
      />
    )
  }

  const workspaceId = state.context.workspaceId
  const projectId = state.context.projectId
  const activeProjectName =
    state.projects.find((project) => project.id === projectId)?.name ?? null
  const availabilityId =
    state.route.kind === 'availability' ? state.route.disponibilidadId : null
  const activeDisponibilidad = availabilityId
    ? state.disponibilidades.find((item) => item.id === availabilityId) ?? null
    : null
  const currentWorkspaceId = workspaceId ?? ''
  const currentProjectId = projectId ?? ''

  return (
    <AppShell
      userName={state.userName}
      userEmail={state.userEmail}
      projectName={activeProjectName}
      onLogout={actions.logout}
      sidebar={
        <AppSidebar
          workspaceId={workspaceId}
          projectId={projectId}
          onGoWorkspaces={() => actions.navigate('/app/workspaces')}
          onGoWorkspaceProjects={(wsId) => actions.navigate(`/app/workspaces/${wsId}`)}
          onGoProjectOverview={(wsId, prjId) =>
            actions.navigate(`/app/workspaces/${wsId}/projects/${prjId}/overview`)
          }
          onGoProjectDisponibilidades={(wsId, prjId) =>
            actions.navigate(`/app/workspaces/${wsId}/projects/${prjId}/disponibilidades`)
          }
          onGoProjectLists={(wsId, prjId) =>
            actions.navigate(`/app/workspaces/${wsId}/projects/${prjId}/lists`)
          }
          onGoProjectCalendar={(wsId, prjId) =>
            actions.navigate(`/app/workspaces/${wsId}/projects/${prjId}/calendar`)
          }
        />
      }
    >
      {state.route.kind === 'workspaces' ? (
        <WorkspacesScreen
          workspaceName={forms.workspaceName}
          onWorkspaceNameChange={setForms.setWorkspaceName}
          onCreate={() => void actions.createWorkspace()}
          busy={state.busy}
          error={state.errors.workspace}
          workspaces={state.workspaces}
          onOpenWorkspace={(wsId) => actions.navigate(`/app/workspaces/${wsId}`)}
        />
      ) : null}

      {state.route.kind === 'workspace' ? (
        <WorkspaceProjectsScreen
          projectName={forms.projectName}
          projectDescription={forms.projectDescription}
          onProjectNameChange={setForms.setProjectName}
          onProjectDescriptionChange={setForms.setProjectDescription}
          onCreateProject={() => void actions.createProject()}
          busy={state.busy}
          error={state.errors.project}
          projects={state.projects}
          onOpenProject={(wsId, prjId) =>
            actions.navigate(`/app/workspaces/${wsId}/projects/${prjId}/overview`)
          }
        />
      ) : null}

      {state.route.kind === 'project' && state.route.tab === 'overview' ? (
        <ProjectOverviewScreen projectName={activeProjectName} />
      ) : null}

      {state.route.kind === 'project' && state.route.tab === 'disponibilidades' ? (
        <DisponibilidadesScreen
          dispName={forms.dispName}
          dispDescription={forms.dispDescription}
          dispStart={forms.dispStart}
          dispEnd={forms.dispEnd}
          onDispNameChange={setForms.setDispName}
          onDispDescriptionChange={setForms.setDispDescription}
          onDispStartChange={setForms.setDispStart}
          onDispEndChange={setForms.setDispEnd}
          onCreate={() => void actions.createDisponibilidad()}
          busy={state.busy}
          error={state.errors.disponibilidad}
          disponibilidades={state.disponibilidades}
          onOpenSegments={(dispId) =>
            actions.navigate(
              `/app/workspaces/${currentWorkspaceId}/projects/${currentProjectId}/disponibilidades/${dispId}`,
            )
          }
          onOpenCalendar={(dispId) =>
            actions.navigate(
              `/app/workspaces/${currentWorkspaceId}/projects/${currentProjectId}/disponibilidades/${dispId}/calendar`,
            )
          }
        />
      ) : null}

      {state.route.kind === 'availability' ? (
        <SegmentsScreen
          disponibilidadName={activeDisponibilidad?.name ?? '-'}
          disponibilidadStartDate={activeDisponibilidad?.startDate ?? '-'}
          disponibilidadEndDate={activeDisponibilidad?.endDate ?? '-'}
          segments={activeDisponibilidad?.segments ?? []}
          segName={forms.segName}
          segDescription={forms.segDescription}
          segStart={forms.segStart}
          segEnd={forms.segEnd}
          segDates={forms.segDates}
          segDaysWeek={forms.segDaysWeek}
          segDaysMonth={forms.segDaysMonth}
          segExclusions={forms.segExclusions}
          onSegDescriptionChange={setForms.setSegDescription}
          onSegNameChange={setForms.setSegName}
          onSegStartChange={setForms.setSegStart}
          onSegEndChange={setForms.setSegEnd}
          onSegDatesChange={setForms.setSegDates}
          onSegDaysWeekChange={setForms.setSegDaysWeek}
          onSegDaysMonthChange={setForms.setSegDaysMonth}
          onSegExclusionsChange={setForms.setSegExclusions}
          onAddSegment={() => void actions.addSegment()}
          busy={state.busy}
          error={state.errors.segment}
        />
      ) : null}

      {state.route.kind === 'project' && state.route.tab === 'lists' ? (
        <ListsScreen
          listName={forms.listName}
          selectedDispId={forms.selectedDispId}
          onListNameChange={setForms.setListName}
          onSelectedDispIdChange={setForms.setSelectedDispId}
          onCreateList={() => void actions.createList()}
          busy={state.busy}
          error={state.errors.list}
          disponibilidades={state.disponibilidades}
          lists={state.lists}
          onOpenKanban={(listId) =>
            actions.navigate(
              `/app/workspaces/${currentWorkspaceId}/projects/${currentProjectId}/lists/${listId}/kanban`,
            )
          }
        />
      ) : null}

      {state.route.kind === 'kanban' ? (
        <KanbanScreen
          taskTitle={forms.taskTitle}
          taskDuration={forms.taskDuration}
          onTaskTitleChange={setForms.setTaskTitle}
          onTaskDurationChange={setForms.setTaskDuration}
          onCreateTask={() => void actions.createTask()}
          busy={state.busy}
          error={state.errors.task}
          kanban={state.kanban}
          onChangeStatus={(taskId, toStatus) =>
            void actions.changeStatus(taskId, toStatus)
          }
        />
      ) : null}

      {state.route.kind === 'project' && state.route.tab === 'calendar' ? (
        <ProjectCalendarScreen calendar={state.projectCalendar} />
      ) : null}

      {state.route.kind === 'availabilityCalendar' ? (
        <AvailabilityCalendarScreen plan={state.availabilityPlan} />
      ) : null}
    </AppShell>
  )
}

export default App

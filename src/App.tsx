import { AuthCardView } from './ui/auth/AuthCardView'
import { useAppController } from './ui/hooks/useAppController'
import { AppShell } from './ui/layout/AppShell'
import { AppSidebar } from './ui/layout/AppSidebar'
import { LandingView } from './ui/landing/LandingView'
import { WorkspacesScreen } from './ui/features/workspaces/WorkspacesScreen'
import { WorkspaceProjectsScreen } from './ui/features/projects/WorkspaceProjectsScreen'
import { ProjectOverviewScreen } from './ui/features/projects/ProjectOverviewScreen'
import { DisponibilidadesScreen } from './ui/features/disponibilidad/DisponibilidadesScreen'
import { SegmentsScreen } from './ui/features/disponibilidad/SegmentsScreen'
import { ListsScreen } from './ui/features/lists/ListsScreen'
import { KanbanScreen } from './ui/features/kanban/KanbanScreen'
import { ProjectCalendarScreen } from './ui/features/calendars/ProjectCalendarScreen'
import { AvailabilityCalendarScreen } from './ui/features/calendars/AvailabilityCalendarScreen'
import { WorkspaceAiScreen } from './ui/features/ai/WorkspaceAiScreen'
import { ProjectAiScreen } from './ui/features/ai/ProjectAiScreen'

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
          onGoWorkspaceAi={(wsId) => actions.navigate(`/app/workspaces/${wsId}/ai`)}
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
          onGoProjectAi={(wsId, prjId) =>
            actions.navigate(`/app/workspaces/${wsId}/projects/${prjId}/ai`)
          }
        />
      }
    >
      {state.route.kind === 'workspaces' ? (
        <WorkspacesScreen
          workspaceName={forms.workspaceName}
          onWorkspaceNameChange={setForms.setWorkspaceName}
          onCreate={() => void actions.createWorkspace()}
          onUpdate={(workspaceId, name) =>
            void actions.updateWorkspace(workspaceId, name)
          }
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
          onUpdateProject={(projectId, name, description) =>
            void actions.updateProject(projectId, name, description)
          }
          busy={state.busy}
          error={state.errors.project}
          projects={state.projects}
          onOpenProject={(wsId, prjId) =>
            actions.navigate(`/app/workspaces/${wsId}/projects/${prjId}/overview`)
          }
        />
      ) : null}

      {state.route.kind === 'workspaceAi' ? (
        <WorkspaceAiScreen
          agents={state.aiAgents}
          selectedAgentId={forms.aiSelectedAgentId}
          onSelectAgent={setForms.setAiSelectedAgentId}
          credential={state.aiUserCredential}
          provider={forms.aiAgentProvider}
          model={forms.aiAgentModel}
          allowedIntentsCsv={forms.aiAllowedIntentsCsv}
          requireApprovalForWrites={forms.aiRequireApprovalForWrites}
          credentialProvider={forms.aiCredentialProvider}
          credentialRef={forms.aiCredentialRef}
          credentialSecret={forms.aiCredentialSecret}
          onProviderChange={setForms.setAiAgentProvider}
          onModelChange={setForms.setAiAgentModel}
          onAllowedIntentsCsvChange={setForms.setAiAllowedIntentsCsv}
          onRequireApprovalChange={setForms.setAiRequireApprovalForWrites}
          onCredentialProviderChange={setForms.setAiCredentialProvider}
          onCredentialRefChange={setForms.setAiCredentialRef}
          onCredentialSecretChange={setForms.setAiCredentialSecret}
          onCreateAgent={() => void actions.createAiAgent()}
          onPauseAgent={(agentId) => void actions.setAiAgentState(agentId, 'pause')}
          onActivateAgent={(agentId) => void actions.setAiAgentState(agentId, 'activate')}
          onRevokeAgent={(agentId) => void actions.setAiAgentState(agentId, 'revoke')}
          onRegisterCredential={() => void actions.registerAiCredential()}
          onRotateCredential={() => void actions.rotateAiCredential()}
          onRevokeCredential={() => void actions.revokeAiCredential()}
          onSaveSecret={() => void actions.saveAiCredentialSecret()}
          busy={state.busy}
          error={state.errors.aiWorkspace}
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
          onUpdate={(disponibilidadId, data) =>
            void actions.updateDisponibilidad(disponibilidadId, data)
          }
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
        <ProjectCalendarScreen
          calendar={state.projectCalendar}
          onOpenKanban={(listId) =>
            actions.navigate(
              `/app/workspaces/${currentWorkspaceId}/projects/${currentProjectId}/lists/${listId}/kanban`,
            )
          }
        />
      ) : null}

      {state.route.kind === 'project' && state.route.tab === 'ai' ? (
        <ProjectAiScreen
          conversations={state.aiConversations}
          selectedConversationId={state.aiSelectedConversationId}
          message={forms.aiChatMessage}
          onMessageChange={setForms.setAiChatMessage}
          onSelectConversation={actions.selectAiConversation}
          onStartConversation={() => void actions.startAiConversation()}
          onSendMessage={() => void actions.sendAiChatMessage()}
          onApproveCommand={(commandId) => void actions.approveAiCommand(commandId)}
          onRejectCommand={(commandId) => void actions.rejectAiCommand(commandId)}
          onExecuteCommand={(commandId) => void actions.executeAiCommand(commandId)}
          busy={state.busy}
          error={state.errors.aiProject}
        />
      ) : null}

      {state.route.kind === 'availabilityCalendar' ? (
        <AvailabilityCalendarScreen
          plan={state.availabilityPlan}
          onOpenKanban={(listId) =>
            actions.navigate(
              `/app/workspaces/${currentWorkspaceId}/projects/${currentProjectId}/lists/${listId}/kanban`,
            )
          }
        />
      ) : null}
    </AppShell>
  )
}

export default App

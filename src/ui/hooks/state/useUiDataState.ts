import { useMemo, useState } from 'react'
import type { AppControllerState, ProjectCalendarVm, TaskStatus } from '../../types/AppUiModels'

const createEmptyKanban = (): Record<TaskStatus, AppControllerState['kanban'][TaskStatus]> => ({
  PENDING: [],
  IN_PROGRESS: [],
  DONE: [],
  ABANDONED: [],
})

export const useUiDataState = () => {
  const emptyProjectCalendar: ProjectCalendarVm = {
    tasksPerDay: {},
    plannedBlocks: [],
    unplannedTaskIds: [],
  }

  const [workspaces, setWorkspaces] = useState<AppControllerState['workspaces']>([])
  const [projects, setProjects] = useState<AppControllerState['projects']>([])
  const [disponibilidades, setDisponibilidades] = useState<
    AppControllerState['disponibilidades']
  >([])
  const [lists, setLists] = useState<AppControllerState['lists']>([])
  const [kanban, setKanban] = useState<AppControllerState['kanban']>(createEmptyKanban)
  const [projectCalendar, setProjectCalendar] = useState<ProjectCalendarVm>(
    emptyProjectCalendar,
  )
  const [availabilityPlan, setAvailabilityPlan] = useState<
    AppControllerState['availabilityPlan']
  >(null)
  const [aiAgents, setAiAgents] = useState<AppControllerState['aiAgents']>([])
  const [aiConversations, setAiConversations] = useState<AppControllerState['aiConversations']>(
    [],
  )
  const [aiSelectedConversationId, setAiSelectedConversationId] = useState<
    AppControllerState['aiSelectedConversationId']
  >(null)
  const [aiUserCredential, setAiUserCredential] = useState<AppControllerState['aiUserCredential']>(
    null,
  )

  const data = useMemo(
    () => ({
      workspaces,
      projects,
      disponibilidades,
      lists,
      kanban,
      projectCalendar,
      availabilityPlan,
      aiAgents,
      aiConversations,
      aiSelectedConversationId,
      aiUserCredential,
    }),
    [
      workspaces,
      projects,
      disponibilidades,
      lists,
      kanban,
      projectCalendar,
      availabilityPlan,
      aiAgents,
      aiConversations,
      aiSelectedConversationId,
      aiUserCredential,
    ],
  )

  const setters = useMemo(
    () => ({
      setWorkspaces,
      setProjects,
      setDisponibilidades,
      setLists,
      setKanban,
      setProjectCalendar,
      setAvailabilityPlan,
      setAiAgents,
      setAiConversations,
      setAiSelectedConversationId,
      setAiUserCredential,
    }),
    [],
  )

  const clearers = useMemo(
    () => ({
      clearProjects: () => setProjects([]),
      clearProjectContext: () => {
        setDisponibilidades([])
        setLists([])
      },
      clearKanban: () => setKanban(createEmptyKanban()),
      clearProjectCalendar: () => setProjectCalendar(emptyProjectCalendar),
      clearAvailabilityPlan: () => setAvailabilityPlan(null),
      clearAiContext: () => {
        setAiAgents([])
        setAiConversations([])
        setAiSelectedConversationId(null)
        setAiUserCredential(null)
      },
    }),
    [],
  )

  return { data, setters, clearers }
}

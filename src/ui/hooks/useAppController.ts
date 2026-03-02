import { useMemo, useRef, useState } from 'react'
import type { AppServices } from '../../aplicacion/AppBootstrap'
import { createAppDataLoaders } from './app/createAppDataLoaders'
import { useRouteState } from './app/useRouteState'
import { useAiActions } from './actions/useAiActions'
import { useAuthActions } from './actions/useAuthActions'
import { useDisponibilidadActions } from './actions/useDisponibilidadActions'
import { useListTaskActions } from './actions/useListTaskActions'
import { useWorkspaceProjectActions } from './actions/useWorkspaceProjectActions'
import { useAppBootEffect } from './effects/useAppBootEffect'
import { usePrivateRouteGuardEffect } from './effects/usePrivateRouteGuardEffect'
import { useRouteDataSyncEffect } from './effects/useRouteDataSyncEffect'
import { useSessionState } from './state/useSessionState'
import { useUiForms } from './state/useUiForms'
import { useUiDataState } from './state/useUiDataState'
import { useUiErrors } from './state/useUiErrors'
import { navigate } from '../router/AppRoute'
import type { AppController } from './AppController.types'
import type { AppControllerState } from '../types/AppUiModels'

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

  useAppBootEffect({ servicesRef, setReady, setSession, loaders })
  usePrivateRouteGuardEffect({ ready, route, userId })
  useRouteDataSyncEffect({
    servicesRef,
    userId,
    context,
    route,
    loaders,
    setters,
    clearers,
  })

  const { submitAuth, logout } = useAuthActions({
    servicesRef,
    forms,
    authMode,
    setSession,
    loaders,
    navigate,
    clearSession,
    setBusy,
    setError,
  })

  const {
    createWorkspace,
    updateWorkspace,
    createProject,
    updateProject,
  } = useWorkspaceProjectActions({
    servicesRef,
    userId,
    context,
    forms,
    setForms,
    loaders,
    setBusy,
    setError,
    navigate,
  })

  const {
    createDisponibilidad,
    updateDisponibilidad,
    addSegment,
    updateSegment,
    deleteSegment,
  } = useDisponibilidadActions({
    servicesRef,
    userId,
    context,
    forms,
    setForms,
    loaders,
    setBusy,
    setError,
  })

  const {
    createList,
    updateList,
    createTask,
    updateTask,
    changeStatus,
    moveTaskInStatus,
  } = useListTaskActions({
    servicesRef,
    userId,
    context,
    forms,
    setForms,
    loaders,
    setBusy,
    setError,
    data,
  })

  const {
    createAiAgent,
    setAiAgentState,
    deleteAiAgent,
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
  } = useAiActions({
    servicesRef,
    userId,
    context,
    forms,
    setForms,
    loaders,
    setBusy,
    setError,
    data,
    setters,
  })

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
    kanbanTimeline: data.kanbanTimeline,
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
      deleteSegment,
      updateDisponibilidad,
      addSegment,
      createList,
      updateList,
      createTask,
      updateTask,
      changeStatus,
      moveTaskInStatus,
      createAiAgent,
      setAiAgentState,
      deleteAiAgent,
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

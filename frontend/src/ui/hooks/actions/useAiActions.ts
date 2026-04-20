import { runUiAction } from './runUiAction'
import type { BaseActionDeps } from './types'

const parseCsvStrings = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

type AiActionDeps = Pick<
  BaseActionDeps,
  'servicesRef' | 'userId' | 'context' | 'forms' | 'setForms' | 'loaders' | 'setBusy' | 'setError' | 'data' | 'setters'
>

export const useAiActions = ({
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
}: AiActionDeps) => {
  const createAiAgent = async () => {
    const services = servicesRef.current
    if (!services || userId === null || !context.workspaceId) return

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'aiWorkspace',
      fallbackMessage: 'No se pudo crear agente.',
      task: async () => {
        await services.aiAssistant.createAgent({
          workspaceId: context.workspaceId!,
          actorUserId: userId,
          provider: forms.aiAgentProvider,
          model: forms.aiAgentModel,
          policy: {
            allowedIntents: parseCsvStrings(forms.aiAllowedIntentsCsv),
            requireApprovalForWrites: forms.aiRequireApprovalForWrites,
          },
        })
        loaders.loadAiWorkspaceContext(services, context.workspaceId!, userId)
      },
    })
  }

  const setAiAgentState = async (
    agentId: string,
    action: 'pause' | 'activate' | 'revoke',
  ) => {
    const services = servicesRef.current
    if (!services || userId === null || !context.workspaceId) return

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'aiWorkspace',
      fallbackMessage: 'No se pudo actualizar estado del agente.',
      task: async () => {
        await services.aiAssistant.setAgentState({
          agentId,
          actorUserId: userId,
          action,
        })
        loaders.loadAiWorkspaceContext(services, context.workspaceId!, userId)
      },
    })
  }

  const deleteAiAgent = async (agentId: string) => {
    const services = servicesRef.current
    if (!services || userId === null || !context.workspaceId) return

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'aiWorkspace',
      fallbackMessage: 'No se pudo eliminar el agente.',
      task: async () => {
        await services.aiAssistant.deleteAgent({
          agentId,
          actorUserId: userId,
        })
        loaders.loadAiWorkspaceContext(services, context.workspaceId!, userId)
      },
    })
  }

  const registerAiCredential = async () => {
    const services = servicesRef.current
    if (!services || userId === null || !context.workspaceId) return

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'aiWorkspace',
      fallbackMessage: 'No se pudo registrar credencial.',
      task: async () => {
        await services.aiAssistant.registerUserCredential({
          workspaceId: context.workspaceId!,
          userId,
          actorUserId: userId,
          provider: forms.aiCredentialProvider,
          credentialRef: forms.aiCredentialRef,
        })
        loaders.loadAiWorkspaceContext(services, context.workspaceId!, userId)
      },
    })
  }

  const rotateAiCredential = async () => {
    const services = servicesRef.current
    if (!services || userId === null || !context.workspaceId) return

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'aiWorkspace',
      fallbackMessage: 'No se pudo rotar credencial.',
      task: async () => {
        await services.aiAssistant.rotateUserCredential({
          workspaceId: context.workspaceId!,
          userId,
          actorUserId: userId,
          credentialRef: forms.aiCredentialRef,
        })
        loaders.loadAiWorkspaceContext(services, context.workspaceId!, userId)
      },
    })
  }

  const revokeAiCredential = async () => {
    const services = servicesRef.current
    if (!services || userId === null || !context.workspaceId) return

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'aiWorkspace',
      fallbackMessage: 'No se pudo revocar credencial.',
      task: async () => {
        await services.aiAssistant.revokeUserCredential({
          workspaceId: context.workspaceId!,
          userId,
          actorUserId: userId,
        })
        loaders.loadAiWorkspaceContext(services, context.workspaceId!, userId)
      },
    })
  }

  const saveAiCredentialSecret = async () => {
    const services = servicesRef.current
    if (!services || userId === null || !context.workspaceId) return

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'aiWorkspace',
      fallbackMessage: 'No se pudo guardar token.',
      task: async () => {
        await services.aiAssistant.setUserCredentialSecret({
          workspaceId: context.workspaceId!,
          userId,
          actorUserId: userId,
          secret: forms.aiCredentialSecret,
        })
        setForms.setAiCredentialSecret('')
        loaders.loadAiWorkspaceContext(services, context.workspaceId!, userId)
      },
    })
  }

  const startAiConversation = async () => {
    const services = servicesRef.current
    const agentId = forms.aiSelectedAgentId || data.aiAgents[0]?.id
    if (!services || userId === null || !context.workspaceId || !context.projectId || !agentId) return

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'aiProject',
      fallbackMessage: 'No se pudo iniciar conversacion.',
      task: async () => {
        await services.aiAssistant.startConversation({
          workspaceId: context.workspaceId!,
          projectId: context.projectId!,
          actorUserId: userId,
          agentId,
        })
        loaders.loadAiProjectContext(services, context.workspaceId!, context.projectId!, userId)
      },
    })
  }

  const selectAiConversation = (conversationId: string) => {
    setters.setAiSelectedConversationId(conversationId)
  }

  const sendAiChatMessage = async () => {
    const services = servicesRef.current
    const conversationId = data.aiSelectedConversationId
    if (!services || userId === null || !context.workspaceId || !context.projectId || !conversationId) {
      return
    }

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'aiProject',
      fallbackMessage: 'No se pudo enviar mensaje.',
      task: async () => {
        await services.aiAssistant.sendChatMessage({
          conversationId,
          actorUserId: userId,
          message: forms.aiChatMessage,
        })
        setForms.setAiChatMessage('')
        loaders.loadAiProjectContext(services, context.workspaceId!, context.projectId!, userId)
      },
    })
  }

  const approveAiCommand = async (commandId: string) => {
    const services = servicesRef.current
    const conversationId = data.aiSelectedConversationId
    if (!services || userId === null || !context.workspaceId || !context.projectId || !conversationId) {
      return
    }

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'aiProject',
      fallbackMessage: 'No se pudo aprobar comando.',
      task: async () => {
        await services.aiAssistant.approveCommand({
          conversationId,
          commandId,
          actorUserId: userId,
        })
        loaders.loadAiProjectContext(services, context.workspaceId!, context.projectId!, userId)
      },
    })
  }

  const rejectAiCommand = async (commandId: string) => {
    const services = servicesRef.current
    const conversationId = data.aiSelectedConversationId
    if (!services || userId === null || !context.workspaceId || !context.projectId || !conversationId) {
      return
    }

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'aiProject',
      fallbackMessage: 'No se pudo rechazar comando.',
      task: async () => {
        await services.aiAssistant.rejectCommand({
          conversationId,
          commandId,
          actorUserId: userId,
        })
        loaders.loadAiProjectContext(services, context.workspaceId!, context.projectId!, userId)
      },
    })
  }

  const executeAiCommand = async (commandId: string) => {
    const services = servicesRef.current
    const conversationId = data.aiSelectedConversationId
    if (!services || userId === null || !context.workspaceId || !context.projectId || !conversationId) {
      return
    }

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'aiProject',
      fallbackMessage: 'No se pudo ejecutar comando.',
      task: async () => {
        await services.aiAssistant.executeCommand({
          conversationId,
          commandId,
          actorUserId: userId,
        })
        loaders.loadAiProjectContext(services, context.workspaceId!, context.projectId!, userId)
      },
    })
  }

  return {
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
  }
}

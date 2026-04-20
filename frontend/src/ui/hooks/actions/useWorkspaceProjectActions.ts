import { runUiAction } from './runUiAction'
import type { BaseActionDeps } from './types'

type WorkspaceProjectActions = Pick<
  BaseActionDeps,
  'servicesRef' | 'userId' | 'context' | 'forms' | 'setForms' | 'loaders' | 'setBusy' | 'setError'
> & {
  navigate: (path: string, replace?: boolean) => void
}

export const useWorkspaceProjectActions = ({
  servicesRef,
  userId,
  context,
  forms,
  setForms,
  loaders,
  setBusy,
  setError,
  navigate,
}: WorkspaceProjectActions) => {
  const createWorkspace = async () => {
    const services = servicesRef.current
    if (!services || userId === null) return

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'workspace',
      fallbackMessage: 'No se pudo crear workspace.',
      task: async () => {
        const created = await services.workspace.createWorkspace({
          ownerUserId: userId,
          name: forms.workspaceName,
        })
        setForms.setWorkspaceName('')
        loaders.loadWorkspaces(services, userId)
        navigate(`/app/workspaces/${created.id}`)
      },
    })
  }

  const updateWorkspace = async (workspaceId: string, name: string) => {
    const services = servicesRef.current
    if (!services || userId === null) return

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'workspace',
      fallbackMessage: 'No se pudo editar workspace.',
      task: async () => {
        await services.workspace.updateWorkspace({
          workspaceId,
          actorUserId: userId,
          name,
        })
        loaders.loadWorkspaces(services, userId)
      },
    })
  }

  const createProject = async () => {
    const services = servicesRef.current
    if (!services || userId === null || !context.workspaceId) return

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'project',
      fallbackMessage: 'No se pudo crear proyecto.',
      task: async () => {
        const project = await services.project.createProject({
          workspaceId: context.workspaceId!,
          actorUserId: userId,
          name: forms.projectName,
          description: forms.projectDescription,
        })
        setForms.setProjectName('')
        setForms.setProjectDescription('')
        loaders.loadWorkspaceContext(services, context.workspaceId!, userId)
        navigate(`/app/workspaces/${context.workspaceId}/projects/${project.id}/overview`)
      },
    })
  }

  const updateProject = async (projectId: string, name: string, description: string) => {
    const services = servicesRef.current
    if (!services || userId === null || !context.workspaceId) return

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'project',
      fallbackMessage: 'No se pudo editar proyecto.',
      task: async () => {
        await services.project.updateProject({
          workspaceId: context.workspaceId!,
          projectId,
          actorUserId: userId,
          name,
          description,
        })
        loaders.loadWorkspaceContext(services, context.workspaceId!, userId)
      },
    })
  }

  return {
    createWorkspace,
    updateWorkspace,
    createProject,
    updateProject,
  }
}

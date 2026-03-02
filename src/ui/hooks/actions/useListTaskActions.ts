import type { TaskStatus, TaskVm } from '../../types/AppUiModels'
import { runUiAction } from './runUiAction'
import type { BaseActionDeps } from './types'

type ListTaskActionDeps = Pick<
  BaseActionDeps,
  'servicesRef' | 'userId' | 'context' | 'forms' | 'setForms' | 'loaders' | 'setBusy' | 'setError' | 'data'
>

export const useListTaskActions = ({
  servicesRef,
  userId,
  context,
  forms,
  setForms,
  loaders,
  setBusy,
  setError,
  data,
}: ListTaskActionDeps) => {
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

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'list',
      fallbackMessage: 'No se pudo crear lista.',
      task: async () => {
        await services.todoList.create({
          workspaceId: context.workspaceId!,
          projectId: context.projectId!,
          disponibilidadId: forms.selectedDispId,
          actorUserId: userId,
          name: forms.listName,
          description: '',
        })
        setForms.setListName('')
        loaders.loadProjectContext(services, context.projectId!)
      },
    })
  }

  const updateList = async (
    todoListId: string,
    payload: { name: string; description: string },
  ) => {
    const services = servicesRef.current
    if (!services || userId === null || !context.workspaceId || !context.projectId) {
      return
    }

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'list',
      fallbackMessage: 'No se pudo editar lista.',
      task: async () => {
        await services.todoList.update({
          workspaceId: context.workspaceId!,
          projectId: context.projectId!,
          todoListId,
          actorUserId: userId,
          name: payload.name,
          description: payload.description,
        })
        loaders.loadProjectContext(services, context.projectId!)
      },
    })
  }

  const createTask = async () => {
    const services = servicesRef.current
    if (!services || userId === null || !context.workspaceId || !context.projectId || !context.listId) {
      return
    }

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'task',
      fallbackMessage: 'No se pudo crear tarea.',
      task: async () => {
        await services.taskPlanning.createTask({
          workspaceId: context.workspaceId!,
          projectId: context.projectId!,
          todoListId: context.listId!,
          actorUserId: userId,
          title: forms.taskTitle,
          description: forms.taskDescription,
          durationMinutes: Number(forms.taskDuration),
        })
        setForms.setTaskTitle('')
        setForms.setTaskDescription('')
        setForms.setTaskDuration('30')
        loaders.loadKanban(services, context.listId!)
      },
    })
  }

  const updateTask = async (
    taskId: string,
    payload: { title: string; description: string; durationMinutes: number },
  ) => {
    const services = servicesRef.current
    if (!services || userId === null || !context.workspaceId || !context.projectId || !context.listId) {
      return
    }

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'task',
      fallbackMessage: 'No se pudo editar tarea.',
      task: async () => {
        await services.taskPlanning.updateTask({
          workspaceId: context.workspaceId!,
          projectId: context.projectId!,
          actorUserId: userId,
          taskId,
          title: payload.title,
          description: payload.description,
          durationMinutes: payload.durationMinutes,
        })
        loaders.loadKanban(services, context.listId!)
      },
    })
  }

  const changeStatus = async (taskId: string, toStatus: TaskStatus) => {
    const services = servicesRef.current
    if (!services || userId === null || !context.workspaceId || !context.projectId || !context.listId) {
      return
    }

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'task',
      fallbackMessage: 'No se pudo cambiar estado.',
      task: async () => {
        await services.taskPlanning.changeTaskStatus({
          workspaceId: context.workspaceId!,
          projectId: context.projectId!,
          actorUserId: userId,
          taskId,
          toStatus,
        })
        loaders.loadKanban(services, context.listId!)
      },
    })
  }

  const moveTaskInStatus = async (taskId: string, direction: 'up' | 'down') => {
    const services = servicesRef.current
    if (!services || userId === null || !context.workspaceId || !context.projectId || !context.listId) {
      return
    }

    const allTasks = Object.values(data.kanban)
      .flat()
      .slice()
      .sort((a, b) => a.orderInList - b.orderInList)
    const sourceTask = allTasks.find((task) => task.id === taskId)
    if (!sourceTask) return

    const statusTasks = allTasks
      .filter((task) => task.status === sourceTask.status)
      .sort((a, b) => a.orderInList - b.orderInList)
    const statusIndex = statusTasks.findIndex((task) => task.id === taskId)
    if (statusIndex < 0) return

    const targetIndex = direction === 'up' ? statusIndex - 1 : statusIndex + 1
    if (targetIndex < 0 || targetIndex >= statusTasks.length) return

    const reorderedStatusTasks = statusTasks.slice()
    const current = reorderedStatusTasks[statusIndex]
    reorderedStatusTasks[statusIndex] = reorderedStatusTasks[targetIndex]
    reorderedStatusTasks[targetIndex] = current

    const reorderedQueue: TaskVm[] = []
    const reorderedStatusMap = new Map(
      reorderedStatusTasks.map((task, index) => [task.id, index]),
    )
    let statusCursor = 0
    for (const task of allTasks) {
      if (task.status !== sourceTask.status) {
        reorderedQueue.push(task)
        continue
      }
      const nextTask = reorderedStatusTasks[statusCursor]
      if (!nextTask || !reorderedStatusMap.has(task.id)) {
        reorderedQueue.push(task)
        continue
      }
      reorderedQueue.push(nextTask)
      statusCursor += 1
    }

    const orderedTaskIds = reorderedQueue.map((task) => task.id)

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'task',
      fallbackMessage: 'No se pudo reordenar tarea.',
      task: async () => {
        await services.taskPlanning.reorderTasksInTodoList({
          workspaceId: context.workspaceId!,
          projectId: context.projectId!,
          actorUserId: userId,
          todoListId: context.listId!,
          orderedTaskIds,
        })
        loaders.loadKanban(services, context.listId!)
      },
    })
  }

  return {
    createList,
    updateList,
    createTask,
    updateTask,
    changeStatus,
    moveTaskInStatus,
  }
}

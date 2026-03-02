import { DisponibilidadAggregate } from '../../../dominio/entidades/DisponibilidadAggregate.ts'
import { ProjectAggregate } from '../../../dominio/entidades/ProjectAggregate.ts'
import { TaskAggregate } from '../../../dominio/entidades/TaskAggregate.ts'
import { TodoListAggregate } from '../../../dominio/entidades/TodoListAggregate.ts'
import { WorkspaceAggregate } from '../../../dominio/entidades/WorkspaceAggregate.ts'
import type { DisponibilidadRepository } from '../../../dominio/puertos/DisponibilidadRepository.ts'
import type { ProjectRepository } from '../../../dominio/puertos/ProjectRepository.ts'
import type { TaskRepository } from '../../../dominio/puertos/TaskRepository.ts'
import type { TodoListRepository } from '../../../dominio/puertos/TodoListRepository.ts'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork.ts'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository.ts'
import { TaskPlanningAppService } from '../../TaskPlanningAppService.ts'

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message)
}

const assertRejects = async (
  work: () => Promise<unknown>,
  messageIncludes: string,
) => {
  try {
    await work()
    throw new Error('Expected promise to reject')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    assert(
      message.includes(messageIncludes),
      `Expected error message to include "${messageIncludes}" but got "${message}"`,
    )
  }
}

const isoFromNow = (daysOffset: number): string => {
  const now = new Date()
  const date = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
  )
  date.setUTCDate(date.getUTCDate() + daysOffset)
  return date.toISOString().slice(0, 10)
}

class InMemoryUnitOfWork implements UnitOfWork {
  async runInTransaction<T>(work: () => T | Promise<T>) {
    return work()
  }
}

class InMemoryWorkspaceRepository implements WorkspaceRepository {
  private readonly store = new Map<string, WorkspaceAggregate>()
  findById(id: string) {
    return this.store.get(id) ?? null
  }
  findByOwnerUserId(ownerUserId: number) {
    return [...this.store.values()].filter((item) => item.ownerUserId === ownerUserId)
  }
  save(workspace: WorkspaceAggregate) {
    this.store.set(workspace.id, workspace)
  }
}

class InMemoryProjectRepository implements ProjectRepository {
  private readonly store = new Map<string, ProjectAggregate>()
  findById(id: string) {
    return this.store.get(id) ?? null
  }
  findByWorkspaceId(workspaceId: string) {
    return [...this.store.values()].filter((item) => item.workspaceId === workspaceId)
  }
  save(project: ProjectAggregate) {
    this.store.set(project.id, project)
  }
}

class InMemoryDisponibilidadRepository implements DisponibilidadRepository {
  private readonly store = new Map<string, DisponibilidadAggregate>()
  findById(id: string) {
    return this.store.get(id) ?? null
  }
  findByProjectId(projectId: string) {
    return [...this.store.values()].filter((item) => item.projectId === projectId)
  }
  save(disponibilidad: DisponibilidadAggregate) {
    this.store.set(disponibilidad.id, disponibilidad)
  }
}

class InMemoryTodoListRepository implements TodoListRepository {
  private readonly store = new Map<string, TodoListAggregate>()
  findById(id: string) {
    return this.store.get(id) ?? null
  }
  findByProjectId(projectId: string) {
    return [...this.store.values()].filter((item) => item.projectId === projectId)
  }
  save(todoList: TodoListAggregate) {
    this.store.set(todoList.id, todoList)
  }
}

class InMemoryTaskRepository implements TaskRepository {
  private readonly store = new Map<string, TaskAggregate>()
  findById(id: string) {
    return this.store.get(id) ?? null
  }
  findByTodoListId(todoListId: string) {
    return [...this.store.values()].filter((item) => item.todoListId === todoListId)
  }
  findByProjectId(projectId: string) {
    return [...this.store.values()].filter((item) => item.projectId === projectId)
  }
  save(task: TaskAggregate) {
    this.store.set(task.id, task)
  }
}

export const taskPlanningUseCasesAppSpec = async () => {
  const unitOfWork = new InMemoryUnitOfWork()
  const workspaceRepo = new InMemoryWorkspaceRepository()
  const projectRepo = new InMemoryProjectRepository()
  const disponibilidadRepo = new InMemoryDisponibilidadRepository()
  const todoListRepo = new InMemoryTodoListRepository()
  const taskRepo = new InMemoryTaskRepository()

  const workspace = WorkspaceAggregate.create(1, 'Workspace QA')
  workspaceRepo.save(workspace)
  const project = ProjectAggregate.create(workspace.id, 1, 'Proyecto QA', 'Demo')
  projectRepo.save(project)
  const targetDate = isoFromNow(1)
  const disponibilidad = DisponibilidadAggregate.create({
    projectId: project.id,
    name: 'Disp',
    startDate: targetDate,
    endDate: targetDate,
    segments: [
      {
        name: 'Manana',
        startTime: '09:00',
        endTime: '12:00',
        specificDates: [targetDate],
      },
    ],
  })
  disponibilidadRepo.save(disponibilidad)

  const todoList = TodoListAggregate.create(
    project.id,
    disponibilidad.id,
    1,
    'Lista QA',
    '',
  )
  todoListRepo.save(todoList)

  const service = new TaskPlanningAppService(
    taskRepo,
    todoListRepo,
    disponibilidadRepo,
    projectRepo,
    workspaceRepo,
    unitOfWork,
  )

  const created = await service.createTask({
    workspaceId: workspace.id,
    projectId: project.id,
    todoListId: todoList.id,
    actorUserId: 1,
    title: 'T1',
    durationMinutes: 60,
  })
  assert(created.orderInList === 1, 'First task should have order 1')

  const created2 = await service.createTask({
    workspaceId: workspace.id,
    projectId: project.id,
    todoListId: todoList.id,
    actorUserId: 1,
    title: 'T2',
    durationMinutes: 60,
  })
  assert(created2.orderInList === 2, 'Second task should have order 2')

  await service.reorderTasksInTodoList({
    workspaceId: workspace.id,
    projectId: project.id,
    actorUserId: 1,
    todoListId: todoList.id,
    orderedTaskIds: [created2.id, created.id],
  })
  const reorderedKanban = service.getKanbanByTodoList(todoList.id)
  const reorderedIds = [...reorderedKanban.PENDING, ...reorderedKanban.IN_PROGRESS].map(
    (task) => task.id,
  )
  assert(
    reorderedIds[0] === created2.id && reorderedIds[1] === created.id,
    'Reorder should persist the provided order',
  )
  assert(
    reorderedKanban.PENDING.every((task) => task.status === 'PENDING'),
    'Reorder should not change task status',
  )

  await assertRejects(
    () =>
      service.reorderTasksInTodoList({
        workspaceId: workspace.id,
        projectId: project.id,
        actorUserId: 1,
        todoListId: todoList.id,
        orderedTaskIds: [created.id, created.id],
      }),
    'IDs de tareas duplicados',
  )

  await service.changeTaskStatus({
    workspaceId: workspace.id,
    projectId: project.id,
    actorUserId: 1,
    taskId: created.id,
    toStatus: 'IN_PROGRESS',
  })
  const kanban = service.getKanbanByTodoList(todoList.id)
  assert(kanban.IN_PROGRESS.length === 1, 'Kanban should reflect changed status')

  const calendar = service.buildDisponibilidadCalendar(disponibilidad.id)
  assert(calendar.plannedBlocks.length >= 1, 'Calendar should plan at least one task')

  const projectCalendar = service.buildProjectCalendarDetailed(project.id)
  assert(
    projectCalendar.plannedBlocks.length >= 1,
    'Project calendar should include planned blocks',
  )
  assert(
    projectCalendar.plannedBlocks[0].taskTitle.length >= 1,
    'Project planned block should include task title',
  )
  assert(
    projectCalendar.plannedBlocks[0].todoListName.length >= 1,
    'Project planned block should include todo list name',
  )

  const overflowDisponibilidad = DisponibilidadAggregate.create({
    projectId: project.id,
    name: 'Disp Overflow',
    startDate: targetDate,
    endDate: targetDate,
    segments: [
      {
        name: 'Corto',
        startTime: '09:00',
        endTime: '10:00',
        specificDates: [targetDate],
      },
    ],
  })
  disponibilidadRepo.save(overflowDisponibilidad)
  const overflowList = TodoListAggregate.create(
    project.id,
    overflowDisponibilidad.id,
    1,
    'Lista Overflow',
    '',
  )
  todoListRepo.save(overflowList)

  const overflowA = await service.createTask({
    workspaceId: workspace.id,
    projectId: project.id,
    todoListId: overflowList.id,
    actorUserId: 1,
    title: 'Overflow A',
    durationMinutes: 45,
  })
  const overflowB = await service.createTask({
    workspaceId: workspace.id,
    projectId: project.id,
    todoListId: overflowList.id,
    actorUserId: 1,
    title: 'Overflow B',
    durationMinutes: 30,
  })

  await assertRejects(
    () =>
      service.reorderTasksInTodoList({
        workspaceId: workspace.id,
        projectId: project.id,
        actorUserId: 1,
        todoListId: overflowList.id,
        orderedTaskIds: [overflowB.id, overflowA.id],
      }),
    'No se puede reordenar: la disponibilidad no alcanza para planificar todas las tareas.',
  )
}

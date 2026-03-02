import { DisponibilidadAggregate } from '../entidades/DisponibilidadAggregate.ts'
import { TaskAggregate } from '../entidades/TaskAggregate.ts'
import { KanbanTimelineService } from '../servicios/KanbanTimelineService.ts'

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message)
}

export const kanbanTimelineServiceSpec = () => {
  const targetDate = '2026-03-03'
  const disponibilidad = DisponibilidadAggregate.create({
    projectId: 'project-1',
    name: 'Disponibilidad test',
    startDate: targetDate,
    endDate: targetDate,
    segments: [
      {
        name: 'Manana',
        startTime: '09:00',
        endTime: '10:00',
        specificDates: [targetDate],
      },
    ],
  })

  const inProgress = TaskAggregate.create({
    projectId: 'project-1',
    todoListId: 'list-1',
    title: 'Tarea 1',
    createdByUserId: 1,
    durationMinutes: 30,
    orderInList: 1,
  }).changeStatus(1, 'IN_PROGRESS')

  const pending = TaskAggregate.create({
    projectId: 'project-1',
    todoListId: 'list-1',
    title: 'Tarea 2',
    createdByUserId: 1,
    durationMinutes: 30,
    orderInList: 2,
  })

  const done = TaskAggregate.create({
    projectId: 'project-1',
    todoListId: 'list-1',
    title: 'Tarea 3',
    createdByUserId: 1,
    durationMinutes: 15,
    orderInList: 3,
  }).changeStatus(1, 'IN_PROGRESS')
    .changeStatus(1, 'DONE')

  const service = new KanbanTimelineService()
  const timeline = service.buildByDisponibilidad(disponibilidad, [
    pending,
    inProgress,
    done,
  ])

  assert(timeline.rows.length === 12, 'Debe crear slots de 5 minutos para 1 hora')
  assert(timeline.progressItems.length === 1, 'Debe incluir tarea IN_PROGRESS')
  assert(timeline.pendingItems.length === 1, 'Debe incluir tarea PENDING')
  assert(timeline.doneItems.length === 1, 'Debe incluir tarea DONE')
  assert(timeline.pendingItems[0].rowStart > timeline.progressItems[0].rowStart, 'Debe respetar orden por lista')
}

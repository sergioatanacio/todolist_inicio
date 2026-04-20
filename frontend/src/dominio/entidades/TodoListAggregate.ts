import { domainError } from '../errores/DomainError'
import { ListOrder } from '../valores_objeto/ListOrder'
import { TodoListDescription } from '../valores_objeto/TodoListDescription'
import { TodoListName } from '../valores_objeto/TodoListName'

const normalizeDisponibilidadId = (raw: string) => {
  const normalized = raw.trim()
  if (normalized.length < 1) {
    throw domainError('VALIDATION_ERROR', 'El id de disponibilidad es obligatorio')
  }
  return normalized
}

const normalizeProjectId = (raw: string) => {
  const normalized = raw.trim()
  if (normalized.length < 1) {
    throw domainError('VALIDATION_ERROR', 'El id de proyecto es obligatorio')
  }
  return normalized
}

type TodoListPrimitives = {
  id: string
  projectId: string
  disponibilidadId: string
  orderInDisponibilidad?: number
  name: string
  description: string
  createdAt: number
}

export class TodoListAggregate {
  private readonly _id: string
  private readonly _projectId: string
  private readonly _disponibilidadId: string
  private readonly _orderInDisponibilidad: ListOrder
  private readonly _name: TodoListName
  private readonly _description: TodoListDescription
  private readonly _createdAt: number

  private constructor(data: {
    id: string
    projectId: string
    disponibilidadId: string
    orderInDisponibilidad: ListOrder
    name: TodoListName
    description: TodoListDescription
    createdAt: number
  }) {
    this._id = data.id
    this._projectId = data.projectId
    this._disponibilidadId = data.disponibilidadId
    this._orderInDisponibilidad = data.orderInDisponibilidad
    this._name = data.name
    this._description = data.description
    this._createdAt = data.createdAt
  }

  static create(
    projectId: string,
    disponibilidadId: string,
    orderInDisponibilidad: number,
    rawName: string,
    rawDescription: string,
  ) {
    return new TodoListAggregate({
      id: crypto.randomUUID(),
      projectId: normalizeProjectId(projectId),
      disponibilidadId: normalizeDisponibilidadId(disponibilidadId),
      orderInDisponibilidad: ListOrder.create(orderInDisponibilidad),
      name: TodoListName.create(rawName),
      description: TodoListDescription.create(rawDescription),
      createdAt: Date.now(),
    })
  }

  static rehydrate(data: TodoListPrimitives) {
    return new TodoListAggregate({
      id: data.id,
      projectId: normalizeProjectId(data.projectId),
      disponibilidadId: normalizeDisponibilidadId(data.disponibilidadId),
      orderInDisponibilidad: ListOrder.create(data.orderInDisponibilidad ?? 1),
      name: TodoListName.create(data.name),
      description: TodoListDescription.create(data.description),
      createdAt: data.createdAt,
    })
  }

  rename(rawName: string) {
    return new TodoListAggregate({
      id: this._id,
      projectId: this._projectId,
      disponibilidadId: this._disponibilidadId,
      orderInDisponibilidad: this._orderInDisponibilidad,
      name: TodoListName.create(rawName),
      description: this._description,
      createdAt: this._createdAt,
    })
  }

  updateDescription(rawDescription: string) {
    return new TodoListAggregate({
      id: this._id,
      projectId: this._projectId,
      disponibilidadId: this._disponibilidadId,
      orderInDisponibilidad: this._orderInDisponibilidad,
      name: this._name,
      description: TodoListDescription.create(rawDescription),
      createdAt: this._createdAt,
    })
  }

  reassignDisponibilidad(disponibilidadId: string) {
    const normalized = normalizeDisponibilidadId(disponibilidadId)
    return new TodoListAggregate({
      id: this._id,
      projectId: this._projectId,
      disponibilidadId: normalized,
      orderInDisponibilidad: this._orderInDisponibilidad,
      name: this._name,
      description: this._description,
      createdAt: this._createdAt,
    })
  }

  setOrderInDisponibilidad(orderInDisponibilidad: number) {
    return new TodoListAggregate({
      id: this._id,
      projectId: this._projectId,
      disponibilidadId: this._disponibilidadId,
      orderInDisponibilidad: ListOrder.create(orderInDisponibilidad),
      name: this._name,
      description: this._description,
      createdAt: this._createdAt,
    })
  }

  toPrimitives(): TodoListPrimitives {
    return {
      id: this._id,
      projectId: this._projectId,
      disponibilidadId: this._disponibilidadId,
      orderInDisponibilidad: this._orderInDisponibilidad.value,
      name: this._name.value,
      description: this._description.value,
      createdAt: this._createdAt,
    }
  }

  get id() {
    return this._id
  }

  get projectId() {
    return this._projectId
  }

  get disponibilidadId() {
    return this._disponibilidadId
  }

  get name() {
    return this._name.value
  }

  get orderInDisponibilidad() {
    return this._orderInDisponibilidad.value
  }

  get description() {
    return this._description.value
  }

  get createdAt() {
    return this._createdAt
  }
}

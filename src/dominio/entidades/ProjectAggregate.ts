import { ProjectDescription } from '../valores_objeto/ProjectDescription'
import { ProjectName } from '../valores_objeto/ProjectName'

type ProjectPrimitives = {
  id: string
  workspaceId: string
  name: string
  description: string
  createdAt: number
}

export class ProjectAggregate {
  private readonly _id: string
  private readonly _workspaceId: string
  private readonly _name: ProjectName
  private readonly _description: ProjectDescription
  private readonly _createdAt: number

  private constructor(data: {
    id: string
    workspaceId: string
    name: ProjectName
    description: ProjectDescription
    createdAt: number
  }) {
    this._id = data.id
    this._workspaceId = data.workspaceId
    this._name = data.name
    this._description = data.description
    this._createdAt = data.createdAt
  }

  static create(workspaceId: string, rawName: string, rawDescription: string) {
    return new ProjectAggregate({
      id: crypto.randomUUID(),
      workspaceId,
      name: ProjectName.create(rawName),
      description: ProjectDescription.create(rawDescription),
      createdAt: Date.now(),
    })
  }

  static rehydrate(data: ProjectPrimitives) {
    return new ProjectAggregate({
      id: data.id,
      workspaceId: data.workspaceId,
      name: ProjectName.create(data.name),
      description: ProjectDescription.create(data.description),
      createdAt: data.createdAt,
    })
  }

  rename(rawName: string) {
    return new ProjectAggregate({
      id: this._id,
      workspaceId: this._workspaceId,
      name: ProjectName.create(rawName),
      description: this._description,
      createdAt: this._createdAt,
    })
  }

  updateDescription(rawDescription: string) {
    return new ProjectAggregate({
      id: this._id,
      workspaceId: this._workspaceId,
      name: this._name,
      description: ProjectDescription.create(rawDescription),
      createdAt: this._createdAt,
    })
  }

  toPrimitives(): ProjectPrimitives {
    return {
      id: this._id,
      workspaceId: this._workspaceId,
      name: this._name.value,
      description: this._description.value,
      createdAt: this._createdAt,
    }
  }

  get id() {
    return this._id
  }

  get workspaceId() {
    return this._workspaceId
  }

  get name() {
    return this._name.value
  }

  get description() {
    return this._description.value
  }

  get createdAt() {
    return this._createdAt
  }
}

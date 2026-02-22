type WorkspacePrimitives = {
  id: string
  ownerUserId: number
  name: string
  createdAt: number
}

const normalizeWorkspaceName = (raw: string) => {
  const normalized = raw.trim()
  if (normalized.length < 1) {
    throw new Error('El nombre del workspace no puede estar vacio')
  }
  if (normalized.length > 100) {
    throw new Error('El nombre del workspace excede 100 caracteres')
  }
  return normalized
}

export class WorkspaceAggregate {
  private readonly _id: string
  private readonly _ownerUserId: number
  private readonly _name: string
  private readonly _createdAt: number

  private constructor(data: WorkspacePrimitives) {
    this._id = data.id
    this._ownerUserId = data.ownerUserId
    this._name = data.name
    this._createdAt = data.createdAt
  }

  static create(ownerUserId: number, rawName: string) {
    return new WorkspaceAggregate({
      id: crypto.randomUUID(),
      ownerUserId,
      name: normalizeWorkspaceName(rawName),
      createdAt: Date.now(),
    })
  }

  static rehydrate(data: WorkspacePrimitives) {
    return new WorkspaceAggregate({
      id: data.id,
      ownerUserId: data.ownerUserId,
      name: normalizeWorkspaceName(data.name),
      createdAt: data.createdAt,
    })
  }

  rename(rawName: string) {
    return new WorkspaceAggregate({
      id: this._id,
      ownerUserId: this._ownerUserId,
      name: normalizeWorkspaceName(rawName),
      createdAt: this._createdAt,
    })
  }

  toPrimitives(): WorkspacePrimitives {
    return {
      id: this._id,
      ownerUserId: this._ownerUserId,
      name: this._name,
      createdAt: this._createdAt,
    }
  }

  get id() {
    return this._id
  }

  get ownerUserId() {
    return this._ownerUserId
  }

  get name() {
    return this._name
  }

  get createdAt() {
    return this._createdAt
  }
}

import { TodoDuration } from '../valores_objeto/TodoDuration'
import { TodoText } from '../valores_objeto/TodoText'

type TodoPrimitives = {
  id: string
  userId: number
  text: string
  durationMinutes: number
  done: boolean
  createdAt: number
}

export class TodoAggregate {
  private readonly _id: string
  private readonly _userId: number
  private readonly _text: TodoText
  private readonly _duration: TodoDuration
  private readonly _done: boolean
  private readonly _createdAt: number

  private constructor(data: {
    id: string
    userId: number
    text: TodoText
    duration: TodoDuration
    done: boolean
    createdAt: number
  }) {
    this._id = data.id
    this._userId = data.userId
    this._text = data.text
    this._duration = data.duration
    this._done = data.done
    this._createdAt = data.createdAt
  }

  static create(userId: number, rawText: string, rawDurationMinutes: number) {
    return new TodoAggregate({
      id: crypto.randomUUID(),
      userId,
      text: TodoText.create(rawText),
      duration: TodoDuration.create(rawDurationMinutes),
      done: false,
      createdAt: Date.now(),
    })
  }

  static rehydrate(data: TodoPrimitives) {
    return new TodoAggregate({
      id: data.id,
      userId: data.userId,
      text: TodoText.create(data.text),
      duration: TodoDuration.create(data.durationMinutes),
      done: data.done,
      createdAt: data.createdAt,
    })
  }

  toggle() {
    return new TodoAggregate({
      id: this._id,
      userId: this._userId,
      text: this._text,
      duration: this._duration,
      done: !this._done,
      createdAt: this._createdAt,
    })
  }

  markDone() {
    if (this._done) return this
    return new TodoAggregate({
      id: this._id,
      userId: this._userId,
      text: this._text,
      duration: this._duration,
      done: true,
      createdAt: this._createdAt,
    })
  }

  markPending() {
    if (!this._done) return this
    return new TodoAggregate({
      id: this._id,
      userId: this._userId,
      text: this._text,
      duration: this._duration,
      done: false,
      createdAt: this._createdAt,
    })
  }

  updateDuration(rawDurationMinutes: number) {
    return new TodoAggregate({
      id: this._id,
      userId: this._userId,
      text: this._text,
      duration: TodoDuration.create(rawDurationMinutes),
      done: this._done,
      createdAt: this._createdAt,
    })
  }

  toPrimitives(): TodoPrimitives {
    return {
      id: this._id,
      userId: this._userId,
      text: this._text.value,
      durationMinutes: this._duration.value,
      done: this._done,
      createdAt: this._createdAt,
    }
  }

  get id() {
    return this._id
  }

  get userId() {
    return this._userId
  }

  get text() {
    return this._text.value
  }

  get durationMinutes() {
    return this._duration.value
  }

  get done() {
    return this._done
  }

  get createdAt() {
    return this._createdAt
  }
}

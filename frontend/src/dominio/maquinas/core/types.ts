export type StateValue = string

export type EventType = string

export type TransitionContext = {
  actorUserId?: number
  occurredAt?: number
  metadata?: Record<string, unknown>
}

export type TransitionMap<
  S extends StateValue,
  E extends EventType,
> = Record<S, Partial<Record<E, S>>>

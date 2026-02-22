export type DomainEvent<TPayload = Record<string, unknown>> = {
  id: string
  type: string
  occurredAt: number
  payload: TPayload
}

export const createDomainEvent = <TPayload>(
  type: string,
  payload: TPayload,
): DomainEvent<TPayload> => ({
  id: crypto.randomUUID(),
  type,
  occurredAt: Date.now(),
  payload,
})

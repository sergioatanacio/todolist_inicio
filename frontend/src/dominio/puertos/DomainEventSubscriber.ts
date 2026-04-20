import type { AnyDomainEvent } from '../eventos/AnyDomainEvent'

export type DomainEventHandler = (
  event: AnyDomainEvent,
) => Promise<void> | void

export interface DomainEventSubscriber {
  subscribe(type: AnyDomainEvent['type'], handler: DomainEventHandler): string
  unsubscribe(token: string): void
}

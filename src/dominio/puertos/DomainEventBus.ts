import type { AnyDomainEvent } from '../eventos/AnyDomainEvent'

export interface DomainEventBus {
  publish(event: AnyDomainEvent): Promise<void> | void
  publishMany(events: AnyDomainEvent[]): Promise<void> | void
}

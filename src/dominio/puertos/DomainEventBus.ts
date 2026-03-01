import type { AnyDomainEvent } from '../eventos/AnyDomainEvent'

export interface DomainEventBus {
  /**
   * Publish a single domain event.
   * Implementations should propagate failures to the caller.
   */
  publish(event: AnyDomainEvent): Promise<void> | void

  /**
   * Publish events in the same order they are received.
   * Implementations should fail fast and propagate the error.
   */
  publishMany(events: AnyDomainEvent[]): Promise<void> | void
}

import type { AnyDomainEvent } from '../eventos/AnyDomainEvent'
import type { DomainEventBus } from '../puertos/DomainEventBus'

type HasDomainEvents = {
  pullDomainEvents: () => AnyDomainEvent[]
}

export class DomainEventPublisher {
  constructor(private readonly eventBus: DomainEventBus) {}

  publishFrom(aggregate: HasDomainEvents) {
    const events = aggregate.pullDomainEvents()
    if (events.length === 0) return
    this.eventBus.publishMany(events)
  }

  publishOne(event: AnyDomainEvent) {
    this.eventBus.publish(event)
  }

  publishMany(events: AnyDomainEvent[]) {
    if (events.length === 0) return
    this.eventBus.publishMany(events)
  }
}

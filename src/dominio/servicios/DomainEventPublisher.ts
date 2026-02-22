import type { AnyDomainEvent } from '../eventos/AnyDomainEvent'
import type { DomainEventBus } from '../puertos/DomainEventBus'

type HasDomainEvents = {
  pullDomainEvents: () => AnyDomainEvent[]
}

export class DomainEventPublisher {
  constructor(private readonly eventBus: DomainEventBus) {}

  async publishFrom(aggregate: HasDomainEvents) {
    const events = aggregate.pullDomainEvents()
    if (events.length === 0) return
    await this.eventBus.publishMany(events)
  }

  async publishOne(event: AnyDomainEvent) {
    await this.eventBus.publish(event)
  }

  async publishMany(events: AnyDomainEvent[]) {
    if (events.length === 0) return
    await this.eventBus.publishMany(events)
  }
}

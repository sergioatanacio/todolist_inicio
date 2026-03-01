import type { AnyDomainEvent } from '../eventos/AnyDomainEvent'
import type { DomainEventBus } from '../puertos/DomainEventBus'

type HasDomainEvents = {
  pullDomainEvents: () => AnyDomainEvent[]
}

const assertValidEvent = (event: AnyDomainEvent | undefined) => {
  if (!event || typeof event.type !== 'string') {
    throw new Error('Invalid domain event')
  }
}

export class DomainEventPublisher {
  constructor(private readonly eventBus: DomainEventBus) {}

  async publishFrom(aggregate: HasDomainEvents) {
    const events = aggregate.pullDomainEvents()
    if (events.length === 0) return
    for (const event of events) assertValidEvent(event)
    await this.eventBus.publishMany(events)
  }

  async publishOne(event: AnyDomainEvent) {
    assertValidEvent(event)
    await this.eventBus.publish(event)
  }

  async publishMany(events: AnyDomainEvent[]) {
    if (events.length === 0) return
    for (const event of events) assertValidEvent(event)
    await this.eventBus.publishMany(events)
  }
}

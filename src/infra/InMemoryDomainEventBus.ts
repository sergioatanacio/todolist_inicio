import type { AnyDomainEvent } from '../dominio/eventos/AnyDomainEvent'
import type { DomainEventBus } from '../dominio/puertos/DomainEventBus'

export class InMemoryDomainEventBus implements DomainEventBus {
  private readonly _events: AnyDomainEvent[] = []

  publish(event: AnyDomainEvent) {
    this._events.push(event)
  }

  publishMany(events: AnyDomainEvent[]) {
    this._events.push(...events)
  }

  get events() {
    return [...this._events]
  }

  clear() {
    this._events.length = 0
  }
}

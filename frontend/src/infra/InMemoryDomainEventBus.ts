import type { AnyDomainEvent } from '../dominio/eventos/AnyDomainEvent'
import type { DomainEventBus } from '../dominio/puertos/DomainEventBus'
import type {
  DomainEventHandler,
  DomainEventSubscriber,
} from '../dominio/puertos/DomainEventSubscriber'

type Subscription = {
  type: AnyDomainEvent['type']
  handler: DomainEventHandler
}

export class InMemoryDomainEventBus implements DomainEventBus, DomainEventSubscriber {
  private readonly _events: AnyDomainEvent[] = []
  private readonly subscriptions = new Map<string, Subscription>()

  async publish(event: AnyDomainEvent) {
    this._events.push(event)
    await this.dispatch(event)
  }

  async publishMany(events: AnyDomainEvent[]) {
    for (const event of events) {
      await this.publish(event)
    }
  }

  subscribe(type: AnyDomainEvent['type'], handler: DomainEventHandler) {
    const token = crypto.randomUUID()
    this.subscriptions.set(token, { type, handler })
    return token
  }

  unsubscribe(token: string) {
    this.subscriptions.delete(token)
  }

  private async dispatch(event: AnyDomainEvent) {
    for (const subscription of this.subscriptions.values()) {
      if (subscription.type !== event.type) continue
      await subscription.handler(event)
    }
  }

  get events() {
    return [...this._events]
  }

  clear() {
    this._events.length = 0
  }
}

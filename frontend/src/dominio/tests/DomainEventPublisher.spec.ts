import type { AnyDomainEvent } from '../eventos/AnyDomainEvent.ts'
import { workspaceEvents } from '../eventos/WorkspaceEvents.ts'
import type { DomainEventBus } from '../puertos/DomainEventBus.ts'
import { DomainEventPublisher } from '../servicios/DomainEventPublisher.ts'

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message)
}

class RecordingEventBus implements DomainEventBus {
  readonly published: AnyDomainEvent[] = []

  async publish(event: AnyDomainEvent) {
    this.published.push(event)
  }

  async publishMany(events: AnyDomainEvent[]) {
    for (const event of events) this.published.push(event)
  }
}

class FailingEventBus implements DomainEventBus {
  async publish() {
    throw new Error('bus failure')
  }

  async publishMany() {
    throw new Error('bus failure')
  }
}

type AggregateWithEvents = {
  pullDomainEvents: () => AnyDomainEvent[]
}

export const domainEventPublisherSpec = async () => {
  const eventA = workspaceEvents.created({ ownerUserId: 1, name: 'W1' })
  const eventB = workspaceEvents.memberAdded({
    workspaceId: 'w-1',
    actorUserId: 1,
    targetUserId: 2,
  })

  const recordingBus = new RecordingEventBus()
  const publisher = new DomainEventPublisher(recordingBus)
  const aggregate: AggregateWithEvents = {
    pullDomainEvents: () => [eventA, eventB],
  }

  await publisher.publishFrom(aggregate)
  assert(recordingBus.published.length === 2, 'Expected two published events')
  assert(recordingBus.published[0].id === eventA.id, 'Expected first event order to be preserved')
  assert(recordingBus.published[1].id === eventB.id, 'Expected second event order to be preserved')

  const emptyAggregate: AggregateWithEvents = {
    pullDomainEvents: () => [],
  }
  await publisher.publishFrom(emptyAggregate)
  assert(recordingBus.published.length === 2, 'Expected no-op publish for empty aggregate events')

  const failingPublisher = new DomainEventPublisher(new FailingEventBus())
  let failed = false
  try {
    await failingPublisher.publishMany([eventA])
  } catch {
    failed = true
  }
  assert(failed, 'Expected bus error to be propagated')
}

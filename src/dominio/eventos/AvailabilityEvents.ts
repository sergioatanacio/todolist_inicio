import { type DomainEvent, createDomainEvent } from './DomainEvent'

export type AvailabilityCreatedEvent = DomainEvent<{
  disponibilidadId: string
  workspaceId: string
}> & { type: 'availability.created' }

export type AvailabilityDateRangeChangedEvent = DomainEvent<{
  disponibilidadId: string
  startDate: string
  endDate: string
}> & { type: 'availability.date_range_changed' }

export type AvailabilitySegmentAddedEvent = DomainEvent<{
  disponibilidadId: string
  segmentId: string
}> & { type: 'availability.segment_added' }

export type AvailabilitySegmentRemovedEvent = DomainEvent<{
  disponibilidadId: string
  segmentId: string
}> & { type: 'availability.segment_removed' }

export type AvailabilitySegmentReplacedEvent = DomainEvent<{
  disponibilidadId: string
  segmentId: string
}> & { type: 'availability.segment_replaced' }

export type AvailabilityDomainEvent =
  | AvailabilityCreatedEvent
  | AvailabilityDateRangeChangedEvent
  | AvailabilitySegmentAddedEvent
  | AvailabilitySegmentRemovedEvent
  | AvailabilitySegmentReplacedEvent

export const availabilityEvents = {
  created: (payload: AvailabilityCreatedEvent['payload']): AvailabilityCreatedEvent =>
    createDomainEvent('availability.created', payload) as AvailabilityCreatedEvent,
  dateRangeChanged: (
    payload: AvailabilityDateRangeChangedEvent['payload'],
  ): AvailabilityDateRangeChangedEvent =>
    createDomainEvent(
      'availability.date_range_changed',
      payload,
    ) as AvailabilityDateRangeChangedEvent,
  segmentAdded: (
    payload: AvailabilitySegmentAddedEvent['payload'],
  ): AvailabilitySegmentAddedEvent =>
    createDomainEvent(
      'availability.segment_added',
      payload,
    ) as AvailabilitySegmentAddedEvent,
  segmentRemoved: (
    payload: AvailabilitySegmentRemovedEvent['payload'],
  ): AvailabilitySegmentRemovedEvent =>
    createDomainEvent(
      'availability.segment_removed',
      payload,
    ) as AvailabilitySegmentRemovedEvent,
  segmentReplaced: (
    payload: AvailabilitySegmentReplacedEvent['payload'],
  ): AvailabilitySegmentReplacedEvent =>
    createDomainEvent(
      'availability.segment_replaced',
      payload,
    ) as AvailabilitySegmentReplacedEvent,
}

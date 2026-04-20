package events

import (
	"crypto/rand"
	"encoding/hex"
	"time"
)

type DomainEvent struct {
	ID         string `json:"id"`
	Type       string `json:"type"`
	OccurredAt int64  `json:"occurredAt"`
	Payload    any    `json:"payload"`
}

func New(eventType string, payload any) DomainEvent {
	return DomainEvent{
		ID:         newEventID(),
		Type:       eventType,
		OccurredAt: time.Now().UnixMilli(),
		Payload:    payload,
	}
}

func newEventID() string {
	buffer := make([]byte, 8)
	if _, err := rand.Read(buffer); err != nil {
		return "evt_fallback"
	}
	return "evt_" + hex.EncodeToString(buffer)
}

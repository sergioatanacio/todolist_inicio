package ids

import (
	"crypto/rand"
	"encoding/hex"
	"strings"
	"time"
)

type TimeIDGenerator struct{}

func (TimeIDGenerator) New(prefix string) (string, error) {
	buffer := make([]byte, 6)
	if _, err := rand.Read(buffer); err != nil {
		return "", err
	}
	cleanPrefix := strings.TrimSpace(prefix)
	if cleanPrefix == "" {
		cleanPrefix = "id"
	}
	return cleanPrefix + "_" + time.Now().Format("20060102150405") + "_" + hex.EncodeToString(buffer), nil
}

package clock

import "time"

type SystemClock struct{}

func (SystemClock) NowMillis() int64 {
	return time.Now().UnixMilli()
}

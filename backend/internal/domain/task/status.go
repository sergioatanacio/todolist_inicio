package task

type Status string

const (
	StatusPending    Status = "PENDING"
	StatusInProgress Status = "IN_PROGRESS"
	StatusDone       Status = "DONE"
	StatusAbandoned  Status = "ABANDONED"
)

func IsValidStatus(value string) bool {
	switch Status(value) {
	case StatusPending, StatusInProgress, StatusDone, StatusAbandoned:
		return true
	default:
		return false
	}
}

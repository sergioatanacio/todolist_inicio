package ports

type IDGenerator interface {
	New(prefix string) (string, error)
}

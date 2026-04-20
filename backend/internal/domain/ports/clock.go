package ports

type Clock interface {
	NowMillis() int64
}

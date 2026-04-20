package result

type Result[T any] struct {
	value T
	err   error
}

func Ok[T any](value T) Result[T] {
	return Result[T]{value: value}
}

func Fail[T any](err error) Result[T] {
	return Result[T]{err: err}
}

func (r Result[T]) IsOk() bool {
	return r.err == nil
}

func (r Result[T]) IsErr() bool {
	return r.err != nil
}

func (r Result[T]) Value() T {
	return r.value
}

func (r Result[T]) Error() error {
	return r.err
}

func (r Result[T]) Unwrap() (T, error) {
	return r.value, r.err
}

package transaction

import "context"

type NoopUnitOfWork struct{}

func (NoopUnitOfWork) RunInTransaction(ctx context.Context, fn func(context.Context) error) error {
	return fn(ctx)
}

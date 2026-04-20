package ports

import "context"

type UnitOfWork interface {
	RunInTransaction(ctx context.Context, fn func(context.Context) error) error
}

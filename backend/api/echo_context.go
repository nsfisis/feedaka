package api

import (
	"context"
	"errors"

	"github.com/labstack/echo/v4"
)

type echoContextKey struct{}

var errNoEchoContext = errors.New("echo context not found")

func getEchoContext(ctx context.Context) echo.Context {
	echoCtx, _ := ctx.Value(echoContextKey{}).(echo.Context)
	return echoCtx
}

func WithEchoContext(ctx context.Context, echoCtx echo.Context) context.Context {
	return context.WithValue(ctx, echoContextKey{}, echoCtx)
}

package api

import (
	"context"
	"database/sql"
	"strconv"

	"undef.ninja/x/feedaka/auth"
	appcontext "undef.ninja/x/feedaka/context"
)

func (h *Handler) AuthLogin(ctx context.Context, request AuthLoginRequestObject) (AuthLoginResponseObject, error) {
	user, err := h.Queries.GetUserByUsername(ctx, request.Body.Username)
	if err != nil {
		if err == sql.ErrNoRows {
			return AuthLogin401JSONResponse{Message: "invalid credentials"}, nil
		}
		return AuthLogin401JSONResponse{Message: "invalid credentials"}, nil
	}

	if !auth.VerifyPassword(user.PasswordHash, request.Body.Password) {
		return AuthLogin401JSONResponse{Message: "invalid credentials"}, nil
	}

	echoCtx := getEchoContext(ctx)
	if echoCtx == nil {
		return nil, errNoEchoContext
	}

	if err := h.SessionConfig.SetUserID(echoCtx, user.ID); err != nil {
		return nil, err
	}

	return AuthLogin200JSONResponse{
		User: User{
			Id:       strconv.FormatInt(user.ID, 10),
			Username: user.Username,
		},
	}, nil
}

func (h *Handler) AuthLogout(ctx context.Context, _ AuthLogoutRequestObject) (AuthLogoutResponseObject, error) {
	echoCtx := getEchoContext(ctx)
	if echoCtx == nil {
		return nil, errNoEchoContext
	}

	if err := h.SessionConfig.DestroySession(echoCtx); err != nil {
		return nil, err
	}

	return AuthLogout204Response{}, nil
}

func (h *Handler) AuthGetCurrentUser(ctx context.Context, _ AuthGetCurrentUserRequestObject) (AuthGetCurrentUserResponseObject, error) {
	userID, ok := appcontext.GetUserID(ctx)
	if !ok {
		return AuthGetCurrentUser401JSONResponse{Message: "authentication required"}, nil
	}

	user, err := h.Queries.GetUserByID(ctx, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return AuthGetCurrentUser401JSONResponse{Message: "authentication required"}, nil
		}
		return nil, err
	}

	return AuthGetCurrentUser200JSONResponse{
		Id:       strconv.FormatInt(user.ID, 10),
		Username: user.Username,
	}, nil
}

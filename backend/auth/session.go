package auth

import (
	"errors"
	"os"

	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
)

const (
	sessionName      = "feedaka_session"
	sessionUserIDKey = "user_id"
	// Session duration: 7 days
	sessionMaxAge = 7 * 24 * 60 * 60
)

var (
	ErrNoSession         = errors.New("no session found")
	ErrNoUserIDInSession = errors.New("no user_id in session")
)

type SessionConfig struct {
	store *sessions.CookieStore
}

// NewSessionConfig creates a new session configuration.
// Reads SESSION_SECRET from environment variable.
// If not set, uses a default value (NOT recommended for production).
func NewSessionConfig() *SessionConfig {
	secret := os.Getenv("SESSION_SECRET")
	if secret == "" {
		// Default secret for development - CHANGE THIS IN PRODUCTION
		secret = "feedaka-default-session-secret-change-me-in-production"
	}

	store := sessions.NewCookieStore([]byte(secret))
	store.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   sessionMaxAge,
		HttpOnly: true,
		Secure:   true, // Set to true in production with HTTPS
		SameSite: 3,    // SameSite=Strict
	}

	return &SessionConfig{
		store: store,
	}
}

// GetStore returns the session store.
func (c *SessionConfig) GetStore() *sessions.CookieStore {
	return c.store
}

// SetUserID stores the user ID in the session.
func (c *SessionConfig) SetUserID(ctx echo.Context, userID int64) error {
	sess, err := session.Get(sessionName, ctx)
	if err != nil {
		return err
	}

	sess.Values[sessionUserIDKey] = userID
	return sess.Save(ctx.Request(), ctx.Response())
}

// GetUserID retrieves the user ID from the session.
func (c *SessionConfig) GetUserID(ctx echo.Context) (int64, error) {
	sess, err := session.Get(sessionName, ctx)
	if err != nil {
		return 0, ErrNoSession
	}

	userIDVal, ok := sess.Values[sessionUserIDKey]
	if !ok {
		return 0, ErrNoUserIDInSession
	}

	userID, ok := userIDVal.(int64)
	if !ok {
		return 0, ErrNoUserIDInSession
	}

	return userID, nil
}

// DestroySession removes the session.
func (c *SessionConfig) DestroySession(ctx echo.Context) error {
	sess, err := session.Get(sessionName, ctx)
	if err != nil {
		// If there's no session, nothing to destroy
		return nil
	}

	// Set MaxAge to -1 to delete the session
	sess.Options.MaxAge = -1
	return sess.Save(ctx.Request(), ctx.Response())
}

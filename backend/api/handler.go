package api

import (
	"database/sql"

	"undef.ninja/x/feedaka/auth"
	"undef.ninja/x/feedaka/db"
)

type Handler struct {
	DB            *sql.DB
	Queries       *db.Queries
	SessionConfig *auth.SessionConfig
}

var _ StrictServerInterface = (*Handler)(nil)

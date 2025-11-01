package resolver

import (
	"database/sql"

	"undef.ninja/x/feedaka/auth"
	"undef.ninja/x/feedaka/db"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	DB            *sql.DB
	Queries       *db.Queries
	SessionConfig *auth.SessionConfig
}

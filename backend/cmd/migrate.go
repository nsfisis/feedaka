package cmd

import (
	"database/sql"
	"log"

	"undef.ninja/x/feedaka/db"
)

func RunMigrate(database *sql.DB) {
	log.Println("Running database migrations...")
	err := db.RunMigrations(database)
	if err != nil {
		log.Fatalf("Migration failed: %v", err)
	}
	log.Println("Migrations completed successfully")
}

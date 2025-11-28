package main

import (
	"database/sql"
	"flag"
	"log"

	_ "github.com/mattn/go-sqlite3"

	"undef.ninja/x/feedaka/config"
)

//go:generate go tool sqlc generate
//go:generate go tool gqlgen generate

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal(err)
	}

	// Parse command line flags
	var migrate = flag.Bool("migrate", false, "Run database migrations")
	var createUser = flag.Bool("create-user", false, "Create a new user")
	flag.Parse()
	database, err := sql.Open("sqlite3", "data/feedaka.db")
	if err != nil {
		log.Fatal(err)
	}
	defer database.Close()

	if *migrate {
		runMigrate(database)
	} else if *createUser {
		runCreateUser(database)
	} else {
		runServe(database, cfg)
	}
}

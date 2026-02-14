package main

import (
	"database/sql"
	"embed"
	"flag"
	"log"

	_ "github.com/mattn/go-sqlite3"

	"undef.ninja/x/feedaka/cmd"
	"undef.ninja/x/feedaka/config"
)

//go:generate go tool sqlc generate
//go:generate go tool oapi-codegen -package api -generate types,echo-server,strict-server -o api/generated.go ../openapi/openapi.yaml

var (
	//go:embed public/*
	publicFS embed.FS
)

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
		cmd.RunMigrate(database)
	} else if *createUser {
		cmd.RunCreateUser(database)
	} else {
		cmd.RunServe(database, cfg, publicFS)
	}
}

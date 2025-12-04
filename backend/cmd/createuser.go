package cmd

import (
	"bufio"
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"

	"golang.org/x/crypto/bcrypt"

	"undef.ninja/x/feedaka/db"
)

func RunCreateUser(database *sql.DB) {
	queries := db.New(database)
	reader := bufio.NewReader(os.Stdin)

	// Read username
	fmt.Print("Enter username: ")
	username, err := reader.ReadString('\n')
	if err != nil {
		log.Fatalf("Failed to read username: %v", err)
	}
	username = strings.TrimSpace(username)
	if username == "" {
		log.Fatal("Username cannot be empty")
	}

	// Read password
	fmt.Print("Enter password: ")
	password, err := reader.ReadString('\n')
	if err != nil {
		log.Fatalf("Failed to read password: %v", err)
	}
	password = strings.TrimSpace(password)

	// Validate password length
	if len(password) < 15 {
		log.Fatalf("Password must be at least 15 characters long (got %d characters)", len(password))
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	// Create user
	ctx := context.Background()
	user, err := queries.CreateUser(ctx, db.CreateUserParams{
		Username:     username,
		PasswordHash: string(hashedPassword),
	})
	if err != nil {
		log.Fatalf("Failed to create user: %v", err)
	}

	log.Printf("User created successfully: ID=%d, Username=%s", user.ID, user.Username)
}

package db

import (
	"database/sql"
	"embed"
	"fmt"
	"log"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

const EXPECTED_SCHEMA_VERSION = 2

type Migration struct {
	Version  int
	Filename string
	SQL      string
}

func initMigrationTable(db *sql.DB) error {
	query := `
	CREATE TABLE IF NOT EXISTS schema_migrations (
		version INTEGER PRIMARY KEY,
		applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
	);`

	_, err := db.Exec(query)
	return err
}

func getSchemaVersion(db *sql.DB) (int, error) {
	var version int
	err := db.QueryRow("SELECT COALESCE(MAX(version), 0) FROM schema_migrations").Scan(&version)
	if err != nil {
		return 0, err
	}
	return version, nil
}

func ValidateSchemaVersion(db *sql.DB) error {
	currentVersion, err := getSchemaVersion(db)
	if err != nil {
		return fmt.Errorf("failed to get schema version: %w", err)
	}

	if currentVersion != EXPECTED_SCHEMA_VERSION {
		return fmt.Errorf("schema version mismatch: expected %d, got %d. Run with --migrate to update schema",
			EXPECTED_SCHEMA_VERSION, currentVersion)
	}

	return nil
}

func LoadMigrations() ([]Migration, error) {
	entries, err := migrationsFS.ReadDir("migrations")
	if err != nil {
		return nil, fmt.Errorf("failed to read migrations directory: %w", err)
	}

	var migrations []Migration

	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".sql") {
			continue
		}

		// Parse version from filename (e.g., "001_initial_schema.sql" -> 1)
		parts := strings.SplitN(entry.Name(), "_", 2)
		if len(parts) < 2 {
			continue
		}

		version, err := strconv.Atoi(parts[0])
		if err != nil {
			log.Printf("Warning: invalid migration filename %s, skipping", entry.Name())
			continue
		}

		// Read migration SQL
		sqlBytes, err := migrationsFS.ReadFile(filepath.Join("migrations", entry.Name()))
		if err != nil {
			return nil, fmt.Errorf("failed to read migration %s: %w", entry.Name(), err)
		}

		migrations = append(migrations, Migration{
			Version:  version,
			Filename: entry.Name(),
			SQL:      string(sqlBytes),
		})
	}

	// Sort migrations by version
	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].Version < migrations[j].Version
	})

	return migrations, nil
}

func RunMigrations(db *sql.DB) error {
	// Initialize migration table
	if err := initMigrationTable(db); err != nil {
		return fmt.Errorf("failed to initialize migration table: %w", err)
	}

	// Get current version
	currentVersion, err := getSchemaVersion(db)
	if err != nil {
		return fmt.Errorf("failed to get current schema version: %w", err)
	}

	// Load all migrations
	migrations, err := LoadMigrations()
	if err != nil {
		return fmt.Errorf("failed to load migrations: %w", err)
	}

	// Find pending migrations
	var pendingMigrations []Migration
	for _, migration := range migrations {
		if migration.Version > currentVersion {
			pendingMigrations = append(pendingMigrations, migration)
		}
	}

	if len(pendingMigrations) == 0 {
		log.Printf("No pending migrations. Current schema version: %d", currentVersion)
		return nil
	}

	log.Printf("Running %d pending migrations...", len(pendingMigrations))

	// Execute each pending migration in a transaction
	for _, migration := range pendingMigrations {
		log.Printf("Applying migration %d: %s", migration.Version, migration.Filename)

		tx, err := db.Begin()
		if err != nil {
			return fmt.Errorf("failed to start transaction for migration %d: %w", migration.Version, err)
		}

		// Execute migration SQL
		_, err = tx.Exec(migration.SQL)
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to execute migration %d: %w", migration.Version, err)
		}

		// Record migration as applied
		_, err = tx.Exec(
			"INSERT INTO schema_migrations (version) VALUES (?)",
			migration.Version,
		)
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to record migration %d: %w", migration.Version, err)
		}

		// Commit transaction
		if err = tx.Commit(); err != nil {
			return fmt.Errorf("failed to commit migration %d: %w", migration.Version, err)
		}

		log.Printf("Successfully applied migration %d", migration.Version)
	}

	log.Printf("All migrations completed. Schema version: %d", EXPECTED_SCHEMA_VERSION)
	return nil
}

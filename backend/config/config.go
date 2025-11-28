package config

import (
	"errors"
	"os"
)

var (
	ErrNoSessionSecretEnvVar = errors.New("FEEDAKA_SESSION_SECRET environment variable is not set")
)

type Config struct {
	Port               string
	SessionSecret      string
	DevNonSecureCookie bool
}

func LoadConfig() (*Config, error) {
	port := os.Getenv("FEEDAKA_PORT")
	sessionSecret := os.Getenv("FEEDAKA_SESSION_SECRET")
	devNonSecureCookie := os.Getenv("FEEDAKA_DEV_NON_SECURE_COOKIE")

	if port == "" {
		port = "8080"
	}
	if sessionSecret == "" {
		return nil, ErrNoSessionSecretEnvVar
	}

	return &Config{
		Port:               port,
		SessionSecret:      sessionSecret,
		DevNonSecureCookie: devNonSecureCookie == "1",
	}, nil
}

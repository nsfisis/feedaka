package auth

import "golang.org/x/crypto/bcrypt"

// VerifyPassword checks if the provided password matches the hashed password
func VerifyPassword(hashedPassword, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}

package model

import (
	"github.com/google/uuid"
)

// NewID gera um UUID v7 (time-sortable) como string.
// UUIDs v7 incluem timestamp e são resistentes a ataques de enumeração.
func NewID() string {
	return uuid.Must(uuid.NewV7()).String()
}

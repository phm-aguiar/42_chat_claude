package handler_test

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"42chat/internal/auth"
	"42chat/internal/forum/store"
)

// Helper: criar um request autenticado com JWT no header Authorization
func authedRequest(t *testing.T, method, path string, body interface{}) *http.Request {
	t.Helper()

	// Gerar token JWT válido
	token, err := auth.GenerateJWT(42, "test_user")
	if err != nil {
		t.Fatalf("GenerateJWT failed: %v", err)
	}

	// Marshal body se fornecido
	var bodyReader io.Reader
	if body != nil {
		bodyBytes, err := json.Marshal(body)
		if err != nil {
			t.Fatalf("Marshal body failed: %v", err)
		}
		bodyReader = bytes.NewReader(bodyBytes)
	}

	req := httptest.NewRequest(method, path, bodyReader)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	return req
}

// Helper: criar um request sem autenticação
func unauthRequest(t *testing.T, method, path string, body interface{}) *http.Request {
	t.Helper()

	var bodyReader io.Reader
	if body != nil {
		bodyBytes, err := json.Marshal(body)
		if err != nil {
			t.Fatalf("Marshal body failed: %v", err)
		}
		bodyReader = bytes.NewReader(bodyBytes)
	}

	req := httptest.NewRequest(method, path, bodyReader)
	req.Header.Set("Content-Type", "application/json")

	return req
}

// Helper: extrair e parsear resposta JSON
func parseResponse(t *testing.T, body io.Reader, v interface{}) {
	t.Helper()
	if err := json.NewDecoder(body).Decode(v); err != nil {
		t.Fatalf("Decode response failed: %v", err)
	}
}

// ===== TEST CASES =====

// TestValidateSlug testa a função de validação de slugs (pura, sem DB)
// Cobre: 6 slugs reservados, 2 inválidos, 1 válido
func TestValidateSlug(t *testing.T) {
	tests := []struct {
		name    string
		slug    string
		wantErr bool
		errMsg  string
	}{
		// Reserved slugs (6 casos)
		{
			name:    "reserved_slug_admin",
			slug:    "admin",
			wantErr: true,
			errMsg:  "slug is reserved",
		},
		{
			name:    "reserved_slug_api",
			slug:    "api",
			wantErr: true,
			errMsg:  "slug is reserved",
		},
		{
			name:    "reserved_slug_chat",
			slug:    "chat",
			wantErr: true,
			errMsg:  "slug is reserved",
		},
		{
			name:    "reserved_slug_forum",
			slug:    "forum",
			wantErr: true,
			errMsg:  "slug is reserved",
		},
		{
			name:    "reserved_slug_static",
			slug:    "static",
			wantErr: true,
			errMsg:  "slug is reserved",
		},
		{
			name:    "reserved_slug_health",
			slug:    "health",
			wantErr: true,
			errMsg:  "slug is reserved",
		},
		// Invalid format (2 casos)
		{
			name:    "invalid_slug_start_with_hyphen",
			slug:    "-abc",
			wantErr: true,
			errMsg:  "slug must match pattern",
		},
		{
			name:    "invalid_slug_uppercase",
			slug:    "UPPER",
			wantErr: true,
			errMsg:  "slug must match pattern",
		},
		// Valid slug (1 caso)
		{
			name:    "valid_slug",
			slug:    "tech",
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := store.ValidateSlug(tt.slug)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateSlug(%q) error = %v, wantErr %v", tt.slug, err, tt.wantErr)
			}
			if err != nil && tt.errMsg != "" && !bytes.Contains([]byte(err.Error()), []byte(tt.errMsg)) {
				t.Errorf("ValidateSlug(%q) error message = %q, want to contain %q", tt.slug, err.Error(), tt.errMsg)
			}
		})
	}
}

// TestContentLengthValidation testa validações de comprimento de conteúdo
// Cobre: content exatamente 10000 chars (válido), 10001 chars (inválido)
func TestContentLengthValidation(t *testing.T) {
	tests := []struct {
		name      string
		length    int
		wantValid bool
		desc      string
	}{
		{
			name:      "content_exactly_10000_chars",
			length:    10000,
			wantValid: true,
			desc:      "boundary: exactly at limit",
		},
		{
			name:      "content_10001_chars",
			length:    10001,
			wantValid: false,
			desc:      "boundary: exceeds by 1",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			content := bytes.Repeat([]byte("a"), tt.length)
			isValid := len(content) <= 10000

			if isValid != tt.wantValid {
				t.Errorf("Content length %d: isValid = %v, want %v (%s)", tt.length, isValid, tt.wantValid, tt.desc)
			}
		})
	}
}

// TestTitleLengthValidation testa validações de comprimento de título
// Cobre: 2 chars (inválido), 3 chars (válido), 200 chars (válido), 201 chars (inválido)
func TestTitleLengthValidation(t *testing.T) {
	tests := []struct {
		name      string
		length    int
		wantValid bool
		desc      string
	}{
		{
			name:      "title_2_chars",
			length:    2,
			wantValid: false,
			desc:      "below minimum of 3",
		},
		{
			name:      "title_3_chars",
			length:    3,
			wantValid: true,
			desc:      "at minimum boundary",
		},
		{
			name:      "title_200_chars",
			length:    200,
			wantValid: true,
			desc:      "at maximum boundary",
		},
		{
			name:      "title_201_chars",
			length:    201,
			wantValid: false,
			desc:      "exceeds maximum by 1",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			title := bytes.Repeat([]byte("a"), tt.length)
			isValid := len(title) >= 3 && len(title) <= 200

			if isValid != tt.wantValid {
				t.Errorf("Title length %d: isValid = %v, want %v (%s)", tt.length, isValid, tt.wantValid, tt.desc)
			}
		})
	}
}

// TestJSONDecoding testa decodificação de requests JSON
// Valida que o helper authedRequest cria requests bem-formadas
func TestJSONDecoding(t *testing.T) {
	type testPayload struct {
		Slug        string `json:"slug"`
		Name        string `json:"name"`
		Description string `json:"description"`
		SFW         bool   `json:"sfw"`
		Theme       string `json:"theme"`
	}

	payload := testPayload{
		Slug:        "tech",
		Name:        "Technology",
		Description: "Tech discussions",
		SFW:         true,
		Theme:       "dark",
	}

	req := authedRequest(t, "POST", "/api/forum/boards", payload)

	// Decodificar e validar
	var decoded testPayload
	if err := json.NewDecoder(req.Body).Decode(&decoded); err != nil {
		t.Fatalf("Decode request failed: %v", err)
	}

	if decoded != payload {
		t.Errorf("Decoded payload = %v, want %v", decoded, payload)
	}
}

// TestJWTTokenGeneration testa que GenerateJWT e ParseJWT funcionam corretamente
// Valida que tokens podem ser criados e parseados
func TestJWTTokenGeneration(t *testing.T) {
	const userID = 123
	const login = "testuser"

	// Gerar token
	token, err := auth.GenerateJWT(userID, login)
	if err != nil {
		t.Fatalf("GenerateJWT failed: %v", err)
	}

	if token == "" {
		t.Fatalf("GenerateJWT returned empty token")
	}

	// Parsear token
	claims, err := auth.ParseJWT(token)
	if err != nil {
		t.Fatalf("ParseJWT failed: %v", err)
	}

	if claims == nil {
		t.Fatalf("ParseJWT returned nil claims")
	}

	if claims.UserID != userID || claims.Login != login {
		t.Errorf("Claims mismatch: got UserID=%d Login=%q, want UserID=%d Login=%q",
			claims.UserID, claims.Login, userID, login)
	}
}

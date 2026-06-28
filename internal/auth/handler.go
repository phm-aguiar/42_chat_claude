package auth

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"

	"42chat/internal/db/queries"
)

// Handler contém as dependências dos handlers de autenticação.
type Handler struct {
	DB *sql.DB
}

// authResponse é o payload JSON retornado ao frontend após auth bem-sucedida.
type authResponse struct {
	Token string        `json:"token"`
	User  queries.User  `json:"user"`
}

// Callback processa o OAuth2 callback da 42 Intra.
// GET /api/auth/42/callback?code=<code>
func (h *Handler) Callback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	if code == "" {
		http.Error(w, `{"error":"code ausente","code":"MISSING_CODE"}`, http.StatusBadRequest)
		return
	}

	accessToken, err := exchangeCode(code)
	if err != nil {
		http.Error(w, `{"error":"falha no OAuth2","code":"OAUTH2_ERROR"}`, http.StatusBadGateway)
		return
	}

	user, err := fetchMe(accessToken)
	if err != nil {
		http.Error(w, `{"error":"falha ao buscar perfil","code":"PROFILE_ERROR"}`, http.StatusBadGateway)
		return
	}

	if err := queries.UpsertUser(h.DB, user); err != nil {
		http.Error(w, `{"error":"erro interno","code":"DB_ERROR"}`, http.StatusInternalServerError)
		return
	}

	token, err := GenerateJWT(user.ID, user.Login)
	if err != nil {
		http.Error(w, `{"error":"erro interno","code":"JWT_ERROR"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(authResponse{Token: token, User: user})
}

// DevLogin emite JWT sem OAuth2 real. Só funciona com DEV_MODE=true.
// GET /api/auth/dev/login?login=<login>
func (h *Handler) DevLogin(w http.ResponseWriter, r *http.Request) {
	if os.Getenv("DEV_MODE") != "true" {
		http.Error(w, `{"error":"não disponível","code":"DEV_ONLY"}`, http.StatusForbidden)
		return
	}

	login := r.URL.Query().Get("login")
	if login == "" {
		login = os.Getenv("DEV_USER")
		if login == "" {
			login = "marvin"
		}
	}

	// Dev user com ID fictício baseado em hash do login (estável entre restarts)
	devID := devUserID(login)
	user := queries.User{
		ID:          devID,
		Login:       login,
		ImageURL:    "",
		CurrentHost: "e1r2s3",
		Level:       21.0,
	}

	if err := queries.UpsertUser(h.DB, user); err != nil {
		http.Error(w, `{"error":"erro interno","code":"DB_ERROR"}`, http.StatusInternalServerError)
		return
	}

	token, err := GenerateJWT(user.ID, user.Login)
	if err != nil {
		http.Error(w, `{"error":"erro interno","code":"JWT_ERROR"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(authResponse{Token: token, User: user})
}

// exchangeCode troca o authorization code por access_token na API 42.
func exchangeCode(code string) (string, error) {
	apiURL := os.Getenv("FORTYTWO_API_URL")
	if apiURL == "" {
		apiURL = "https://api.intra.42.fr"
	}

	resp, err := http.PostForm(apiURL+"/oauth/token", url.Values{
		"grant_type":    {"authorization_code"},
		"client_id":     {os.Getenv("FORTYTWO_CLIENT_ID")},
		"client_secret": {os.Getenv("FORTYTWO_CLIENT_SECRET")},
		"code":          {code},
		"redirect_uri":  {os.Getenv("FORTYTWO_REDIRECT_URI")},
	})
	if err != nil {
		return "", fmt.Errorf("token request: %w", err)
	}
	defer resp.Body.Close()

	var result struct {
		AccessToken string `json:"access_token"`
		Error       string `json:"error"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("decode token: %w", err)
	}
	if result.Error != "" {
		return "", fmt.Errorf("oauth2 error: %s", result.Error)
	}
	return result.AccessToken, nil
}

// fetchMe busca dados do aluno logado na API 42 usando o access_token.
func fetchMe(accessToken string) (queries.User, error) {
	apiURL := os.Getenv("FORTYTWO_API_URL")
	if apiURL == "" {
		apiURL = "https://api.intra.42.fr"
	}

	req, _ := http.NewRequest("GET", apiURL+"/v2/me", nil)
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return queries.User{}, fmt.Errorf("fetch me: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var me struct {
		ID          int     `json:"id"`
		Login       string  `json:"login"`
		ImageURL    struct {
			Link string `json:"link"`
		} `json:"image"`
		Location string  `json:"location"`
		Level    float64 `json:"-"`
	}
	if err := json.Unmarshal(body, &me); err != nil {
		return queries.User{}, fmt.Errorf("decode me: %w", err)
	}

	return queries.User{
		ID:          me.ID,
		Login:       me.Login,
		ImageURL:    me.ImageURL.Link,
		CurrentHost: me.Location,
		Level:       0, // level vem de /v2/me cursus_users — simplificado no MVP
	}, nil
}

// devUserID gera um ID inteiro estável e único para um login de dev.
// Range: 9000001–9999999 para não colidir com IDs reais da 42.
func devUserID(login string) int {
	h := 0
	for _, c := range login {
		h = h*31 + int(c)
	}
	if h < 0 {
		h = -h
	}
	return 9000001 + (h % 999999)
}

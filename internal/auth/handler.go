package auth

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

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
		msg, _ := json.Marshal(map[string]string{"error": err.Error(), "code": "OAUTH2_ERROR"})
		http.Error(w, string(msg), http.StatusBadGateway)
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

	// Enriquecimento best-effort: busca título e skills na API 42
	title := ""
	var skills []string
	title, _ = fetchTitle(accessToken, user.ID, user.Login)
	skills, _ = fetchTags(accessToken, user.ID)
	if title != "" || len(skills) > 0 {
		if err := queries.UpdateTitleSkills(h.DB, user.ID, title, skills); err != nil {
			log.Printf("erro ao atualizar título/skills para user %d: %v", user.ID, err)
			// Não aborta o login — é best-effort
		}
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
	defer resp.Body.Close() //nolint

	var result struct {
		AccessToken      string `json:"access_token"`
		Error            string `json:"error"`
		ErrorDescription string `json:"error_description"`
	}
	body, _ := io.ReadAll(resp.Body)
	if err := json.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("decode token response: %w — body: %s", err, body)
	}
	if result.Error != "" {
		return "", fmt.Errorf("42 oauth2: %s — %s", result.Error, result.ErrorDescription)
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

// fetchTitle busca e processa o título do usuário na API 42.
// Retorna o título formatado (substitui %login pelo login real) ou string vazia em caso de erro.
// Best-effort com timeout de 5 segundos.
func fetchTitle(accessToken string, userID int, login string) (string, error) {
	apiURL := os.Getenv("FORTYTWO_API_URL")
	if apiURL == "" {
		apiURL = "https://api.intra.42.fr"
	}

	client := &http.Client{Timeout: 5 * time.Second}
	req, _ := http.NewRequest("GET", fmt.Sprintf("%s/v2/users/%d/titles", apiURL, userID), nil)
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("fetch titles: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var titles []struct {
		Name string `json:"name"`
	}
	if err := json.Unmarshal(body, &titles); err != nil {
		return "", fmt.Errorf("decode titles: %w", err)
	}

	if len(titles) == 0 {
		return "", nil
	}

	title := titles[0].Name
	// Substitui %login pelo login real
	title = strings.ReplaceAll(title, "%login", login)
	return title, nil
}

// fetchTags busca e processa as tags (skills) do usuário na API 42.
// Retorna até 10 nomes de tags em minúsculas, ou slice vazio em caso de erro.
// Best-effort com timeout de 5 segundos.
func fetchTags(accessToken string, userID int) ([]string, error) {
	apiURL := os.Getenv("FORTYTWO_API_URL")
	if apiURL == "" {
		apiURL = "https://api.intra.42.fr"
	}

	client := &http.Client{Timeout: 5 * time.Second}
	req, _ := http.NewRequest("GET", fmt.Sprintf("%s/v2/users/%d/tags_users", apiURL, userID), nil)
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("fetch tags_users: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	// tags_users pode retornar array de objetos com um campo 'tag' contendo 'name'
	// ou um campo 'name' direto — trata ambos defensivamente
	var tagsResp []map[string]interface{}
	if err := json.Unmarshal(body, &tagsResp); err != nil {
		return nil, fmt.Errorf("decode tags_users: %w", err)
	}

	var skills []string
	for i, item := range tagsResp {
		if i >= 10 { // Limita a 10 tags
			break
		}

		// Tenta field 'name' direto
		if name, ok := item["name"].(string); ok {
			skills = append(skills, strings.ToLower(name))
			continue
		}

		// Tenta campo 'tag' com subcampo 'name'
		if tagObj, ok := item["tag"].(map[string]interface{}); ok {
			if name, ok := tagObj["name"].(string); ok {
				skills = append(skills, strings.ToLower(name))
				continue
			}
		}
	}

	return skills, nil
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

#!/bin/bash
set -u

# forum_smoke_test.sh — 12 cenários de integração para o fórum
# Executa curl contra servidor real com JWT dev login

BASE_URL="http://localhost:8080"
PASS=0
FAIL=0
THREAD_ID=""
THREAD_UUID=""
DEV_LOGIN="testuser"

# Cores (opcional)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper: exibe resultado do teste
test_result() {
	local name="$1"
	local status="$2"
	if [ "$status" = "PASS" ]; then
		echo -e "${GREEN}[PASS]${NC} $name"
		((PASS++))
	else
		echo -e "${RED}[FAIL]${NC} $name"
		((FAIL++))
	fi
}

# Helper: extrai valor JSON
extract_json() {
	echo "$1" | grep -o "\"$2\":\"[^\"]*\"" | cut -d'"' -f4
}

# Helper: extrai ID UUID do JSON (para thread)
extract_id() {
	echo "$1" | grep -o "\"id\":\"[^\"]*\"" | head -1 | cut -d'"' -f4
}

# Helper: extrai post_count do JSON
extract_post_count() {
	echo "$1" | grep -o "\"post_count\":[0-9]*" | head -1 | cut -d':' -f2
}

echo "=========================================="
echo "Forum Smoke Test — 12 Cenários"
echo "=========================================="
echo ""

# Obter token JWT dev
echo "Adquirindo JWT via DEV_MODE..."
JWT_RESPONSE=$(curl -s "$BASE_URL/api/auth/dev/login?login=$DEV_LOGIN")
TOKEN=$(extract_json "$JWT_RESPONSE" "token")
if [ -z "$TOKEN" ]; then
	echo -e "${RED}FAIL: Não conseguiu obter JWT${NC}"
	exit 1
fi
echo -e "${GREEN}Token adquirido${NC}"
echo ""

# ============================================================================
# Cenário 1: GET /api/forum/boards com auth → 200 e os 5 seed boards
# ============================================================================
echo "Cenário 1: GET /api/forum/boards com auth"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/forum/boards")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
	# Verifica se contém os 5 seed boards
	if echo "$BODY" | grep -q "tech" && echo "$BODY" | grep -q "projects" && \
	   echo "$BODY" | grep -q "career" && echo "$BODY" | grep -q "events" && \
	   echo "$BODY" | grep -q "random"; then
		test_result "GET /api/forum/boards — 200 com 5 boards" "PASS"
	else
		test_result "GET /api/forum/boards — 200 mas boards faltando" "FAIL"
	fi
else
	test_result "GET /api/forum/boards — HTTP $HTTP_CODE (esperado 200)" "FAIL"
fi
echo ""

# ============================================================================
# Cenário 2: GET /api/forum/boards/tech com auth → 200
# ============================================================================
echo "Cenário 2: GET /api/forum/boards/tech com auth"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/forum/boards/tech")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
	test_result "GET /api/forum/boards/tech — 200" "PASS"
else
	test_result "GET /api/forum/boards/tech — HTTP $HTTP_CODE (esperado 200)" "FAIL"
fi
echo ""

# ============================================================================
# Cenário 3: GET /api/forum/boards/naoexiste com auth → 404 BOARD_NOT_FOUND
# ============================================================================
echo "Cenário 3: GET /api/forum/boards/naoexiste com auth"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/forum/boards/naoexiste")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "404" ] && echo "$BODY" | grep -q "BOARD_NOT_FOUND"; then
	test_result "GET /api/forum/boards/naoexiste — 404 BOARD_NOT_FOUND" "PASS"
else
	test_result "GET /api/forum/boards/naoexiste — HTTP $HTTP_CODE (esperado 404)" "FAIL"
fi
echo ""

# ============================================================================
# Cenário 4: POST /api/forum/boards sem token → 401
# ============================================================================
echo "Cenário 4: POST /api/forum/boards sem token"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/forum/boards" \
	-H "Content-Type: application/json" \
	-d '{"slug":"test","title":"Test"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ]; then
	test_result "POST /api/forum/boards sem token — 401" "PASS"
else
	test_result "POST /api/forum/boards sem token — HTTP $HTTP_CODE (esperado 401)" "FAIL"
fi
echo ""

# ============================================================================
# Cenário 5: POST /api/forum/boards/tech/threads com token → 201 (guarde ID)
# ============================================================================
echo "Cenário 5: POST /api/forum/boards/tech/threads com token"
THREAD_BODY=$(jq -n \
	--arg title "Test Thread Title" \
	--arg content "This is test content for the thread" \
	'{title: $title, content: $content, tags: ["test"]}')

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/forum/boards/tech/threads" \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer $TOKEN" \
	-d "$THREAD_BODY")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "201" ]; then
	THREAD_UUID=$(extract_id "$BODY")
	if [ -n "$THREAD_UUID" ]; then
		test_result "POST /api/forum/boards/tech/threads — 201 com UUID" "PASS"
		THREAD_ID="$THREAD_UUID"
	else
		test_result "POST /api/forum/boards/tech/threads — 201 mas sem UUID no response" "FAIL"
	fi
else
	test_result "POST /api/forum/boards/tech/threads — HTTP $HTTP_CODE (esperado 201)" "FAIL"
fi
echo ""

# ============================================================================
# Cenário 6: Título curto (2 chars) → 400 INVALID_TITLE
# ============================================================================
echo "Cenário 6: POST thread com título curto (2 chars)"
THREAD_BODY=$(jq -n \
	--arg title "Ok" \
	--arg content "Content" \
	'{title: $title, content: $content, tags: []}')

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/forum/boards/tech/threads" \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer $TOKEN" \
	-d "$THREAD_BODY")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "400" ] && echo "$BODY" | grep -q "INVALID_TITLE"; then
	test_result "POST thread com título curto — 400 INVALID_TITLE" "PASS"
else
	test_result "POST thread com título curto — HTTP $HTTP_CODE (esperado 400 INVALID_TITLE)" "FAIL"
fi
echo ""

# ============================================================================
# Cenário 7: POST /api/forum/threads/{id}/posts com token → 201;
#            depois GET /api/forum/threads/{id} e confira post_count == 1
# ============================================================================
if [ -n "$THREAD_ID" ]; then
	echo "Cenário 7: POST /api/forum/threads/{id}/posts e verificar bump"
	POST_BODY=$(jq -n \
		--arg content "Test post content" \
		'{content: $content}')

	RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/forum/threads/$THREAD_ID/posts" \
		-H "Content-Type: application/json" \
		-H "Authorization: Bearer $TOKEN" \
		-d "$POST_BODY")
	HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

	if [ "$HTTP_CODE" = "201" ]; then
		# Agora GET o thread para verificar post_count
		THREAD_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/forum/threads/$THREAD_ID")
		POST_COUNT=$(extract_post_count "$THREAD_RESPONSE")

		if [ "$POST_COUNT" = "1" ]; then
			test_result "POST /api/forum/threads/{id}/posts — 201 e bump funcionou (post_count=1)" "PASS"
		else
			test_result "POST /api/forum/threads/{id}/posts — 201 mas post_count=$POST_COUNT (esperado 1)" "FAIL"
		fi
	else
		test_result "POST /api/forum/threads/{id}/posts — HTTP $HTTP_CODE (esperado 201)" "FAIL"
	fi
	echo ""
else
	test_result "Cenário 7 — SKIP (THREAD_ID vazio)" "FAIL"
	echo ""
fi

# ============================================================================
# Cenário 8: GET /api/forum/threads/{id}/posts com auth → 200 com 1 post
# ============================================================================
if [ -n "$THREAD_ID" ]; then
	echo "Cenário 8: GET /api/forum/threads/{id}/posts com auth"
	RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/forum/threads/$THREAD_ID/posts")
	HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
	BODY=$(echo "$RESPONSE" | head -n-1)

	if [ "$HTTP_CODE" = "200" ]; then
		# Verifica se tem pelo menos 1 post no array
		if echo "$BODY" | grep -q "content"; then
			test_result "GET /api/forum/threads/{id}/posts — 200 com posts" "PASS"
		else
			test_result "GET /api/forum/threads/{id}/posts — 200 mas sem posts" "FAIL"
		fi
	else
		test_result "GET /api/forum/threads/{id}/posts — HTTP $HTTP_CODE (esperado 200)" "FAIL"
	fi
	echo ""
else
	test_result "Cenário 8 — SKIP (THREAD_ID vazio)" "FAIL"
	echo ""
fi

# ============================================================================
# Cenário 9: DELETE /api/forum/threads/{id} com token de usuário comum → 403
# ============================================================================
if [ -n "$THREAD_ID" ]; then
	echo "Cenário 9: DELETE /api/forum/threads/{id} com usuário comum"
	RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/api/forum/threads/$THREAD_ID" \
		-H "Authorization: Bearer $TOKEN")
	HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
	BODY=$(echo "$RESPONSE" | head -n-1)

	if [ "$HTTP_CODE" = "403" ]; then
		test_result "DELETE /api/forum/threads/{id} com usuário comum — 403" "PASS"
	else
		test_result "DELETE /api/forum/threads/{id} com usuário comum — HTTP $HTTP_CODE (esperado 403)" "FAIL"
	fi
	echo ""
else
	test_result "Cenário 9 — SKIP (THREAD_ID vazio)" "FAIL"
	echo ""
fi

# ============================================================================
# Cenário 10: Content >10000 chars num post → 400 CONTENT_TOO_LONG
# ============================================================================
if [ -n "$THREAD_ID" ]; then
	echo "Cenário 10: POST com content >10000 chars"
	LONG_CONTENT=$(python3 -c "print('x' * 10001)")
	POST_BODY=$(jq -n \
		--arg content "$LONG_CONTENT" \
		'{content: $content}')

	RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/forum/threads/$THREAD_ID/posts" \
		-H "Content-Type: application/json" \
		-H "Authorization: Bearer $TOKEN" \
		-d "$POST_BODY")
	HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
	BODY=$(echo "$RESPONSE" | head -n-1)

	if [ "$HTTP_CODE" = "400" ] && echo "$BODY" | grep -q "CONTENT_TOO_LONG"; then
		test_result "POST com content >10000 chars — 400 CONTENT_TOO_LONG" "PASS"
	else
		test_result "POST com content >10000 chars — HTTP $HTTP_CODE (esperado 400)" "FAIL"
	fi
	echo ""
else
	test_result "Cenário 10 — SKIP (THREAD_ID vazio)" "FAIL"
	echo ""
fi

# ============================================================================
# Cenário 11: POST thread em board inexistente → 404
# ============================================================================
echo "Cenário 11: POST thread em board inexistente"
THREAD_BODY=$(jq -n \
	--arg title "Thread em board fake" \
	--arg content "Content" \
	'{title: $title, content: $content, tags: []}')

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/forum/boards/naoexiste/threads" \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer $TOKEN" \
	-d "$THREAD_BODY")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "404" ] && echo "$BODY" | grep -q "BOARD_NOT_FOUND"; then
	test_result "POST thread em board inexistente — 404 BOARD_NOT_FOUND" "PASS"
else
	test_result "POST thread em board inexistente — HTTP $HTTP_CODE (esperado 404)" "FAIL"
fi
echo ""

# ============================================================================
# Cenário 12: GET /api/forum/boards sem token → 401 UNAUTHORIZED
# ============================================================================
echo "Cenário 12: GET /api/forum/boards sem token"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/forum/boards")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "401" ] && echo "$BODY" | grep -q "UNAUTHORIZED"; then
	test_result "GET /api/forum/boards sem token — 401 UNAUTHORIZED" "PASS"
else
	test_result "GET /api/forum/boards sem token — HTTP $HTTP_CODE (esperado 401)" "FAIL"
fi
echo ""

# ============================================================================
# Resumo
# ============================================================================
echo "=========================================="
echo "Resumo: $PASS PASS, $FAIL FAIL"
echo "=========================================="

if [ $FAIL -eq 0 ]; then
	exit 0
else
	exit 1
fi

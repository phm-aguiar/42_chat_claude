package ws

import (
	"encoding/json"
	"testing"
	"time"
)

func TestEmitStatsChangedDebounce(t *testing.T) {
	// Cria um novo Hub
	hub := NewHub()

	// Chama EmitStatsChanged 10 vezes em rápida sucessão
	userID := 42
	for i := 0; i < 10; i++ {
		hub.EmitStatsChanged(userID)
	}

	// Aguarda 2.5 segundos (2s de debounce + 500ms de margem)
	// para que o timer dispare e a mensagem seja emitida
	time.Sleep(2500 * time.Millisecond)

	// Drena o canal h.broadcast com select/default e conta mensagens
	messageCount := 0
	var lastMsg []byte

	for {
		select {
		case msg := <-hub.broadcast:
			messageCount++
			lastMsg = msg
		default:
			// Nenhuma mensagem pendente
			goto done
		}
	}

done:
	// Verifica que exatamente 1 mensagem foi emitida (debounce funcionando)
	if messageCount != 1 {
		t.Errorf("EmitStatsChanged: expected 1 message, got %d", messageCount)
	}

	// Verifica que o payload contém "user_stats_changed" e "user_id":42
	var payload map[string]any
	err := json.Unmarshal(lastMsg, &payload)
	if err != nil {
		t.Fatalf("EmitStatsChanged: failed to unmarshal JSON: %v", err)
	}

	if msgType, ok := payload["type"].(string); !ok || msgType != "user_stats_changed" {
		t.Errorf("EmitStatsChanged: expected type=user_stats_changed, got type=%v", payload["type"])
	}

	if uid, ok := payload["user_id"].(float64); !ok || int(uid) != userID {
		t.Errorf("EmitStatsChanged: expected user_id=%d, got user_id=%v", userID, payload["user_id"])
	}
}

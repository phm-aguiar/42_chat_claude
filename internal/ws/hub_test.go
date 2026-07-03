package ws

import (
	"context"
	"encoding/json"
	"sync"
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

// TestBroadcastToRoomIsolation verifica que mensagens para room A não chegam em clients da room B.
func TestBroadcastToRoomIsolation(t *testing.T) {
	hub := NewHub()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Inicia o loop do hub em goroutine
	go hub.Run(ctx)

	// Cria 2 clients na room A
	roomA := "room-a"
	client1 := &Client{hub: hub, send: make(chan []byte, 256), roomID: roomA}
	client2 := &Client{hub: hub, send: make(chan []byte, 256), roomID: roomA}

	// Cria 2 clients na room B
	roomB := "room-b"
	client3 := &Client{hub: hub, send: make(chan []byte, 256), roomID: roomB}
	client4 := &Client{hub: hub, send: make(chan []byte, 256), roomID: roomB}

	// Registra todos
	hub.Register(client1)
	hub.Register(client2)
	hub.Register(client3)
	hub.Register(client4)

	// Aguarda um pouco para os registros serem processados
	time.Sleep(100 * time.Millisecond)

	// Envia mensagem para room A
	msgA := []byte(`{"type":"message","content":"only for A"}`)
	hub.BroadcastToRoom(roomA, msgA)

	// Coleta mensagens recebidas
	time.Sleep(100 * time.Millisecond)

	var receivedByA1, receivedByA2, receivedByB3, receivedByB4 bool
	select {
	case <-client1.send:
		receivedByA1 = true
	default:
	}
	select {
	case <-client2.send:
		receivedByA2 = true
	default:
	}
	select {
	case <-client3.send:
		receivedByB3 = true
	default:
	}
	select {
	case <-client4.send:
		receivedByB4 = true
	default:
	}

	// Verifica isolamento
	if !receivedByA1 || !receivedByA2 {
		t.Errorf("BroadcastToRoom: room A clients should receive message")
	}
	if receivedByB3 || receivedByB4 {
		t.Errorf("BroadcastToRoom: room B clients should NOT receive message for room A")
	}
}

// TestRegisterUnregisterRooms verifica que register/unregister gerenciam corretamente clients e rooms.
func TestRegisterUnregisterRooms(t *testing.T) {
	hub := NewHub()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go hub.Run(ctx)

	roomA := "room-test-a"
	client1 := &Client{hub: hub, send: make(chan []byte, 256), roomID: roomA}

	// Register: deve adicionar a clients e rooms
	hub.Register(client1)
	time.Sleep(50 * time.Millisecond)

	// Verifica que está em clients
	if hub.ClientCount() != 1 {
		t.Errorf("Register: expected 1 client, got %d", hub.ClientCount())
	}

	// Verifica que está em rooms[roomA]
	hub.mu.RLock()
	if len(hub.rooms[roomA]) != 1 {
		t.Errorf("Register: expected 1 client in room %s, got %d", roomA, len(hub.rooms[roomA]))
	}
	hub.mu.RUnlock()

	// Unregister: deve remover de clients e rooms
	hub.Unregister(client1)
	time.Sleep(50 * time.Millisecond)

	if hub.ClientCount() != 0 {
		t.Errorf("Unregister: expected 0 clients, got %d", hub.ClientCount())
	}

	// Verifica que room foi GC'd (não é GeneralChatID)
	hub.mu.RLock()
	_, exists := hub.rooms[roomA]
	hub.mu.RUnlock()

	if exists {
		t.Errorf("Unregister: room should be garbage collected when empty (not GeneralChatID)")
	}

	// Testa que GeneralChatID NÃO é GC'd mesmo vazio
	client2 := &Client{hub: hub, send: make(chan []byte, 256), roomID: GeneralChatID}
	hub.Register(client2)
	time.Sleep(50 * time.Millisecond)

	hub.Unregister(client2)
	time.Sleep(50 * time.Millisecond)

	hub.mu.RLock()
	_, generalExists := hub.rooms[GeneralChatID]
	hub.mu.RUnlock()

	if !generalExists {
		t.Errorf("Unregister: GeneralChatID room should NOT be garbage collected even when empty")
	}
}

// TestConcurrentRoomAccess testa múltiplas goroutines registrando/desregistrando/broadcastando.
func TestConcurrentRoomAccess(t *testing.T) {
	hub := NewHub()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go hub.Run(ctx)

	var wg sync.WaitGroup
	numGoroutines := 20
	numClients := 50

	// Registra clientes em goroutines paralelas
	for i := 0; i < numGoroutines; i++ {
		wg.Add(1)
		go func(gid int) {
			defer wg.Done()
			for j := 0; j < numClients; j++ {
				roomID := "concurrent-room"
				client := &Client{
					hub:    hub,
					send:   make(chan []byte, 256),
					roomID: roomID,
					userID: gid*numClients + j,
				}
				hub.Register(client)
				time.Sleep(time.Microsecond)
			}
		}(i)
	}

	wg.Wait()

	// Verifica que todos foram registrados
	if hub.ClientCount() != numGoroutines*numClients {
		t.Errorf("ConcurrentRoomAccess: expected %d clients, got %d",
			numGoroutines*numClients, hub.ClientCount())
	}

	// Broadcasts concorrentes
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			msg := []byte(`{"type":"test"}`)
			hub.BroadcastToRoom("concurrent-room", msg)
		}()
	}

	wg.Wait()

	// Aguarda 100ms para processamento
	time.Sleep(100 * time.Millisecond)

	t.Logf("ConcurrentRoomAccess: %d clients handled %d broadcasts without race", hub.ClientCount(), 10)
}

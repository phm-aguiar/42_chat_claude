package model

// ChatWithUnread estende Chat com contagem de mensagens não lidas.
// Embute Chat para preservar compatibilidade e permite adicionar UnreadCount sem alterar Chat original.
type ChatWithUnread struct {
	Chat
	UnreadCount int `json:"unread_count"`
}

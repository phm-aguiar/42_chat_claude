package chat

import (
	"testing"
)

func TestCalcTier(t *testing.T) {
	tests := []struct {
		name       string
		total      int
		wantTier   int
		wantLabel  string
	}{
		{
			name:      "zero messages (novato)",
			total:     0,
			wantTier:  0,
			wantLabel: "novato",
		},
		{
			name:      "one message (iniciante)",
			total:     1,
			wantTier:  1,
			wantLabel: "iniciante",
		},
		{
			name:      "fifty messages (iniciante)",
			total:     50,
			wantTier:  1,
			wantLabel: "iniciante",
		},
		{
			name:      "fifty-one messages (participante)",
			total:     51,
			wantTier:  2,
			wantLabel: "participante",
		},
		{
			name:      "two hundred messages (participante)",
			total:     200,
			wantTier:  2,
			wantLabel: "participante",
		},
		{
			name:      "two hundred one messages (veterano)",
			total:     201,
			wantTier:  3,
			wantLabel: "veterano",
		},
		{
			name:      "five thousand messages (veterano)",
			total:     5000,
			wantTier:  3,
			wantLabel: "veterano",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tier, label := calcTier(tt.total)

			if tier != tt.wantTier {
				t.Errorf("calcTier(%d) tier = %d, want %d", tt.total, tier, tt.wantTier)
			}

			if label != tt.wantLabel {
				t.Errorf("calcTier(%d) label = %q, want %q", tt.total, label, tt.wantLabel)
			}
		})
	}
}

// GetUserStats requer DB de integração — coberto por smoke/BDD tests.
// Veja tests/forum_smoke_test.sh para testes com conexão real.

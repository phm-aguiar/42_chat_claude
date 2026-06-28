import ws from 'k6/ws';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Métricas customizadas
const wsSessionDuration = new Trend('ws_session_duration', true);
const wsErrors = new Rate('ws_errors');

export const options = {
  scenarios: {
    websocket_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 300 }, // rampa: 0 → 300 VUs em 30s
        { duration: '60s', target: 300 }, // sustentado: 300 VUs por 60s
        { duration: '10s', target: 0 },   // ramp-down
      ],
    },
  },
  thresholds: {
    'ws_session_duration{p:95}': ['p(95)<500'],  // p95 < 500ms
    ws_errors: ['rate<0.01'],                      // < 1% de erro
  },
};

const BASE_URL = __ENV.BASE_URL || 'ws://localhost:8080';
const TOKEN = __ENV.WS_TOKEN || 'dev-token';

export default function () {
  const start = Date.now();

  const res = ws.connect(
    `${BASE_URL}/ws?token=${TOKEN}`,
    {},
    function (socket) {
      socket.on('open', () => {
        // Envia uma mensagem de teste após conectar
        socket.send(
          JSON.stringify({
            type: 'message',
            content: `load test message from VU ${__VU}`,
          })
        );
      });

      socket.on('message', (data) => {
        try {
          const msg = JSON.parse(data);
          check(msg, {
            'mensagem tem tipo ou id': (m) => m.type !== undefined || m.id !== undefined,
          });
        } catch {
          wsErrors.add(1);
        }
      });

      socket.on('error', (e) => {
        wsErrors.add(1);
        console.error(`WS error: ${e.error()}`);
      });

      socket.on('close', () => {
        wsSessionDuration.add(Date.now() - start);
      });

      // Mantém conexão por 5s simulando uso real
      socket.setTimeout(() => {
        socket.close();
      }, 5000);
    }
  );

  check(res, {
    'status 101 (upgrade)': (r) => r && r.status === 101,
  });
}

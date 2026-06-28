import "./index.css";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ChatPage } from "@/pages/Chat";

function App() {
  // Initialize WebSocket connection with exponential backoff
  useWebSocket();

  return <ChatPage />;
}

export default App;

import "./index.css";
import { getValidToken } from "@/lib/auth";
import { CallbackPage } from "@/pages/CallbackPage";
import { LoginPage } from "@/pages/LoginPage";
import { ChatPage } from "@/pages/Chat";

function App() {
  const path = window.location.pathname;

  if (path.startsWith("/callback")) {
    return <CallbackPage />;
  }

  const token = getValidToken();
  if (!token) {
    return <LoginPage />;
  }

  return <ChatPage />;
}

export default App;

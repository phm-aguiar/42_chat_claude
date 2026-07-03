import "./index.css";
import { getValidToken } from "@/lib/auth";
import { CallbackPage } from "@/pages/CallbackPage";
import { LoginPage } from "@/pages/LoginPage";
import { ChatPage } from "@/pages/Chat";
import { ForumListPage } from "@/pages/forum/ForumList";
import { BoardView } from "@/pages/forum/BoardView";
import { ThreadView } from "@/pages/forum/ThreadView";
import { NewThread } from "@/pages/forum/NewThread";

function App() {
  const path = window.location.pathname;

  const params = new URLSearchParams(window.location.search);
  if (path.startsWith("/callback") || params.has("code")) {
    return <CallbackPage />;
  }

  const token = getValidToken();
  if (!token) {
    return <LoginPage />;
  }

  if (path.startsWith("/forum")) {
    const threadMatch = path.match(/^\/forum\/[^/]+\/thread\/[^/]+$/);
    if (threadMatch) {
      return <ThreadView />;
    }
    const newMatch = path.match(/^\/forum\/([^/]+)\/new$/);
    if (newMatch) {
      return <NewThread slug={decodeURIComponent(newMatch[1])} />;
    }
    const boardMatch = path.match(/^\/forum\/([^/]+)$/);
    if (boardMatch) {
      return <BoardView slug={decodeURIComponent(boardMatch[1])} />;
    }
    return <ForumListPage />;
  }

  return <ChatPage />;
}

export default App;

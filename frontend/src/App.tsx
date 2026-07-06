import "./index.css";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { CallbackPage } from "@/pages/CallbackPage";
import { LoginPage } from "@/pages/LoginPage";
import { ChatPage } from "@/pages/Chat";
import { ForumListPage } from "@/pages/forum/ForumList";
import { BoardView } from "@/pages/forum/BoardView";
import { ThreadView } from "@/pages/forum/ThreadView";
import { NewThread } from "@/pages/forum/NewThread";
import { RequireAuth } from "@/components/RequireAuth";
import { AppShell } from "@/layouts/AppShell";

// Placeholder Hub — T012 criará a página real
function HubPage() {
  return (
    <div
      style={{
        padding: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100%",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            color: "var(--color-dark-gray)",
            fontSize: "14px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            margin: 0,
          }}
        >
          Hub em construção — T012
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/callback" element={<CallbackPage />} />

      {/* Rotas autenticadas */}
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<HubPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/forum" element={<ForumListPage />} />
          <Route path="/forum/:slug" element={<BoardViewWrapper />} />
          <Route path="/forum/:slug/thread/:threadId" element={<ThreadView />} />
          <Route path="/forum/:slug/new" element={<NewThreadWrapper />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * BoardViewWrapper extrai slug de useParams() e passa como prop.
 * Mantém compatibilidade com BoardView que espera prop slug.
 */
function BoardViewWrapper() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return <Navigate to="/forum" replace />;
  return <BoardView slug={decodeURIComponent(slug)} />;
}

/**
 * NewThreadWrapper extrai slug de useParams() e passa como prop.
 */
function NewThreadWrapper() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return <Navigate to="/forum" replace />;
  return <NewThread slug={decodeURIComponent(slug)} />;
}

export default App;

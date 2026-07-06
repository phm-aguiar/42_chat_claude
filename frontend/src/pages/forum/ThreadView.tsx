import { useState, useEffect, useMemo } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useForumStore } from '@/stores/forumStore';
import { Avatar } from '@/components/ui/Avatar';
import { PostCard } from '@/components/forum/PostCard';
import { MDXEditor } from '@/components/forum/MDXEditor';
import { MDXRenderer } from '@/components/forum/MDXRenderer';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import type { Post } from '@/lib/forumApi';

/**
 * ThreadView — Página de thread: OP + árvore de respostas + form de resposta.
 * Params: threadId (string UUID)
 * Route: /forum/{slug}/thread/{id}
 */
export function ThreadView() {
  const { setPageTitle } = useOutletContext<{ setPageTitle: (title: string) => void }>();

  // Extrair threadId da URL via react-router
  const { threadId } = useParams<{ threadId: string }>();
  const tid = threadId || '';

  const {
    currentThread,
    posts,
    loading,
    error,
    fetchThread,
    fetchPosts,
    createPost,
    clearError,
  } = useForumStore();

  // Estado local para form
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch thread + posts — deps APENAS tid
  useEffect(() => {
    if (!tid) return;
    fetchThread(tid);
    fetchPosts(tid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tid]);

  // Update page title when thread loads
  useEffect(() => {
    if (currentThread) {
      setPageTitle(currentThread.title);
    }
  }, [currentThread, setPageTitle]);

  /**
   * Constrói árvore de replies a partir de posts.
   * Retorna raízes (reply_to null) e mapa id -> filhos.
   */
  const buildTree = useMemo(() => {
    const childrenMap: Record<string, Post[]> = {};
    const rootPosts: Post[] = [];

    posts.forEach((post) => {
      if (!post.reply_to) {
        rootPosts.push(post);
      } else {
        if (!childrenMap[post.reply_to]) {
          childrenMap[post.reply_to] = [];
        }
        childrenMap[post.reply_to].push(post);
      }
    });

    // Ordenar posts dentro de cada nível por data
    Object.keys(childrenMap).forEach((key) => {
      childrenMap[key].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

    rootPosts.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return { rootPosts, childrenMap };
  }, [posts]);

  /**
   * Renderiza recursivamente árvore de posts com indentação.
   * Máx 4 níveis visuais; depois achata.
   */
  const renderPostTree = (
    post: Post,
    depth: number = 0,
    childrenMap: Record<string, Post[]>
  ): React.ReactNode => {
    const children = childrenMap[post.id] || [];
    const canNest = depth < 4;

    return (
      <div key={post.id}>
        <PostCard
          post={post}
          isOP={false}
          onReply={() => setReplyingTo(post.id)}
          children={
            canNest && children.length > 0 ? (
              <div className="mt-2 border-l border-accent-primary/20 pl-0">
                {children.map((child) =>
                  renderPostTree(child, depth + 1, childrenMap)
                )}
              </div>
            ) : null
          }
        />
      </div>
    );
  };

  /**
   * Submeter nova resposta.
   */
  const handleSubmitReply = async () => {
    if (!tid || !editorContent.trim()) return;

    setIsSubmitting(true);
    try {
      await createPost(tid, {
        content: editorContent,
        reply_to: replyingTo,
      });
      setEditorContent('');
      setReplyingTo(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state: thread não carregou ainda
  if (loading && !currentThread) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-base text-content-muted text-sm">
        Carregando thread...
      </div>
    );
  }

  // Not found state
  if (!currentThread) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-surface-base gap-4">
        <EmptyState
          icon="❌"
          title="Thread não encontrada"
          description="A thread que você está procurando não existe ou foi removida"
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.history.back()}
          >
            Voltar
          </Button>
        </EmptyState>
      </div>
    );
  }

  const { rootPosts, childrenMap } = buildTree;

  return (
    <div className="flex flex-col h-screen bg-surface-base">
      {/* Error banner */}
      {error && (
        <div className="bg-status-error text-content-primary px-5 py-3 text-xs flex items-center justify-between gap-4 flex-shrink-0">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="bg-transparent border-0 text-content-primary cursor-pointer text-sm p-0 ml-auto hover:opacity-80"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-3xl mx-auto">
          {/* Thread metadata */}
          <div className="mb-6 pb-4 border-b border-surface-raised">
            <h1 className="text-content-primary text-2xl font-bold m-0 mb-2">
              {currentThread.title}
            </h1>
            <div className="flex items-center gap-4 text-content-secondary text-xs">
              <span>{currentThread.post_count} respostas</span>
              <span>
                {new Date(currentThread.created_at).toLocaleDateString('pt-BR')}
              </span>
              {currentThread.is_pinned && (
                <span className="text-accent-primary uppercase font-bold tracking-wider">
                  Fixado
                </span>
              )}
              {currentThread.is_locked && (
                <span className="text-status-error uppercase font-bold tracking-wider">
                  Trancado
                </span>
              )}
            </div>
          </div>

          {/* OP (Original Post) */}
          <div className="mb-8 border border-accent-primary/20 bg-accent-primary/5">
            {/* OP Header */}
            <div className="flex items-center gap-3 p-5 border-b border-accent-primary/20 pb-4">
              <Avatar
                login={currentThread.author_login}
                imageUrl={currentThread.author_image_url}
                size="md"
              />
              <div>
                <div className="text-accent-primary text-sm font-bold uppercase tracking-widest">
                  {currentThread.author_login}
                </div>
                <div className="text-content-muted text-xs">
                  {new Date(currentThread.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>

            {/* OP Content */}
            <div className="p-5">
              <MDXRenderer content={currentThread.content} />
            </div>
          </div>

          {/* Respostas (tree view) */}
          {rootPosts.length > 0 ? (
            <div className="mb-8 flex flex-col gap-0">
              {rootPosts.map((post) =>
                renderPostTree(post, 0, childrenMap)
              )}
            </div>
          ) : (
            <EmptyState
              icon="💭"
              title="Nenhuma resposta ainda"
              description="Seja o primeiro a responder esta thread"
            />
          )}

          {/* Reply form */}
          {!currentThread.is_locked ? (
            <div className="mt-8 pt-4 border-t border-surface-raised">
              {/* Responder a indicator */}
              {replyingTo && (
                <div className="flex items-center gap-3 mb-3 p-3 bg-accent-primary/10 border border-accent-primary/30 text-accent-primary text-xs rounded-none">
                  <span>Respondendo a {replyingTo.substring(0, 8)}...</span>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="ml-auto bg-transparent border-0 text-accent-primary cursor-pointer text-xs p-0 uppercase font-bold tracking-wider hover:opacity-80 transition-opacity"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              {/* MDXEditor */}
              <MDXEditor
                value={editorContent}
                onChange={setEditorContent}
                placeholder="Sua resposta aqui..."
              />

              {/* Submit button */}
              <div className="mt-3 flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmitReply}
                  disabled={isSubmitting || !editorContent.trim()}
                  className="uppercase tracking-wider font-bold"
                >
                  {isSubmitting ? 'Enviando...' : 'Responder'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-8 pt-4 border-t border-surface-raised p-4 bg-status-error/10 border border-status-error/20 text-status-error text-xs text-center font-bold uppercase tracking-wider">
              Thread trancada. Sem novas respostas permitidas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

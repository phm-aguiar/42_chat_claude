import { useState, useEffect, useMemo } from 'react';
import { useForumStore } from '@/stores/forumStore';
import { PostCard } from '@/components/forum/PostCard';
import { MDXEditor } from '@/components/forum/MDXEditor';
import type { Post } from '@/lib/forumApi';

/**
 * ThreadView — Página de thread: OP + árvore de respostas + form de resposta.
 * Params: threadId (string UUID)
 * Route: /forum/{slug}/thread/{id}
 */
export function ThreadView() {
  // Extrair threadId da URL
  const threadId = useMemo(() => {
    const path = window.location.pathname;
    const match = path.match(/\/thread\/([a-f0-9-]+)/);
    return match?.[1] || '';
  }, []);

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

  // Fetch thread + posts — deps APENAS threadId
  useEffect(() => {
    if (!threadId) return;
    fetchThread(threadId);
    fetchPosts(threadId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

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
          author={undefined} // TODO: enriquecer com dados do usuário
          isOP={false}
          onReply={() => setReplyingTo(post.id)}
          children={
            canNest && children.length > 0 ? (
              <div
                style={{
                  marginTop: '8px',
                  borderLeft: '1px solid rgba(0, 186, 188, 0.2)',
                  paddingLeft: '0px',
                }}
              >
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
    if (!threadId || !editorContent.trim()) return;

    setIsSubmitting(true);
    try {
      await createPost(threadId, {
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
      <div
        style={{
          height: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1B1B1B',
          fontFamily: '"Futura PT", ui-sans-serif, system-ui',
          color: '#29292E',
          fontSize: '14px',
        }}
      >
        Carregando thread...
      </div>
    );
  }

  // Not found state
  if (!currentThread) {
    return (
      <div
        style={{
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1B1B1B',
          fontFamily: '"Futura PT", ui-sans-serif, system-ui',
          color: '#FFFFFF',
          gap: '16px',
        }}
      >
        <p style={{ color: '#29292E', fontSize: '14px' }}>
          Thread não encontrada.
        </p>
        <button
          onClick={() => window.history.back()}
          style={{
            background: 'transparent',
            border: '1px solid #29292E',
            color: '#29292E',
            fontSize: '10px',
            padding: '6px 12px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              '#FFFFFF';
            (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              '#29292E';
            (e.currentTarget as HTMLButtonElement).style.color = '#29292E';
          }}
        >
          Voltar
        </button>
      </div>
    );
  }

  const { rootPosts, childrenMap } = buildTree;

  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: '#1B1B1B',
        fontFamily: '"Futura PT", ui-sans-serif, system-ui',
        backgroundImage:
          'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          height: '48px',
          background: '#202026',
          borderBottom: '1px solid #29292E',
          flexShrink: 0,
          gap: '16px',
        }}
      >
        <span
          style={{
            color: '#00BABC',
            fontWeight: 700,
            fontSize: '13px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          42 Forum
        </span>
        <span style={{ color: '#29292E', fontSize: '11px' }}>—</span>
        <span
          style={{
            color: '#29292E',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {currentThread.title}
        </span>
        <button
          onClick={() => window.history.back()}
          style={{
            marginLeft: 'auto',
            background: 'transparent',
            border: '1px solid #29292E',
            color: '#29292E',
            fontSize: '10px',
            padding: '4px 10px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              '#FFFFFF';
            (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              '#29292E';
            (e.currentTarget as HTMLButtonElement).style.color = '#29292E';
          }}
        >
          Voltar
        </button>
      </header>

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '32px 20px',
        }}
      >
        {/* Error banner */}
        {error && (
          <div
            style={{
              backgroundColor: '#EC3391',
              color: '#FFFFFF',
              padding: '12px 16px',
              marginBottom: '16px',
              fontSize: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{error}</span>
            <button
              onClick={clearError}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '0',
                marginLeft: '16px',
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Thread metadata */}
        <div
          style={{
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid #29292E',
          }}
        >
          <h1
            style={{
              color: '#FFFFFF',
              fontSize: '24px',
              fontWeight: 700,
              margin: '0 0 8px 0',
            }}
          >
            {currentThread.title}
          </h1>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            <span>{currentThread.post_count} respostas</span>
            <span>
              {new Date(currentThread.created_at).toLocaleDateString('pt-BR')}
            </span>
            {currentThread.is_pinned && (
              <span
                style={{
                  color: '#00BABC',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Fixado
              </span>
            )}
            {currentThread.is_locked && (
              <span
                style={{
                  color: '#EC3391',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Trancado
              </span>
            )}
          </div>
        </div>

        {/* OP (Original Post) */}
        <div
          style={{
            marginBottom: '32px',
            background: 'rgba(0, 186, 188, 0.05)',
            border: '1px solid rgba(0, 186, 188, 0.1)',
          }}
        >
          <PostCard
            post={{
              id: currentThread.id,
              thread_id: currentThread.id,
              author_id: currentThread.author_id,
              content: currentThread.content,
              created_at: currentThread.created_at,
              reply_to: null,
            } as Post}
            author={undefined}
            isOP={true}
          />
        </div>

        {/* Respostas (tree view) */}
        {rootPosts.length > 0 ? (
          <div
            style={{
              marginBottom: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0px',
            }}
          >
            {rootPosts.map((post) =>
              renderPostTree(post, 0, childrenMap)
            )}
          </div>
        ) : (
          <div
            style={{
              color: '#29292E',
              fontSize: '12px',
              textAlign: 'center',
              padding: '40px 20px',
              marginBottom: '32px',
            }}
          >
            Nenhuma resposta ainda. Seja o primeiro!
          </div>
        )}

        {/* Reply form */}
        {!currentThread.is_locked ? (
          <div
            style={{
              marginTop: '32px',
              paddingTop: '16px',
              borderTop: '1px solid #29292E',
            }}
          >
            {/* Responder a indicator */}
            {replyingTo && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                  padding: '8px 12px',
                  background: 'rgba(0, 186, 188, 0.1)',
                  border: '1px solid rgba(0, 186, 188, 0.2)',
                  fontSize: '11px',
                  color: '#00BABC',
                }}
              >
                <span>
                  Respondendo a {replyingTo.substring(0, 8)}...
                </span>
                <button
                  onClick={() => setReplyingTo(null)}
                  style={{
                    marginLeft: 'auto',
                    background: 'transparent',
                    border: 'none',
                    color: '#00BABC',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: '0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontWeight: 700,
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = '#EC3391')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = '#00BABC')
                  }
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
            <div
              style={{
                marginTop: '12px',
                display: 'flex',
                gap: '8px',
              }}
            >
              <button
                onClick={handleSubmitReply}
                disabled={isSubmitting || !editorContent.trim()}
                style={{
                  padding: '8px 16px',
                  background:
                    isSubmitting || !editorContent.trim()
                      ? '#29292E'
                      : '#00BABC',
                  color:
                    isSubmitting || !editorContent.trim()
                      ? '#5B5B60'
                      : '#1B1B1B',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  cursor:
                    isSubmitting || !editorContent.trim()
                      ? 'not-allowed'
                      : 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting && editorContent.trim()) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      '#04809F';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting && editorContent.trim()) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      '#00BABC';
                  }
                }}
              >
                {isSubmitting ? 'Enviando...' : 'Responder'}
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              marginTop: '32px',
              paddingTop: '16px',
              borderTop: '1px solid #29292E',
              padding: '16px',
              background: 'rgba(236, 51, 145, 0.08)',
              border: '1px solid rgba(236, 51, 145, 0.2)',
              color: '#EC3391',
              fontSize: '12px',
              textAlign: 'center',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Thread trancada. Sem novas respostas permitidas.
          </div>
        )}
      </div>
    </div>
  );
}

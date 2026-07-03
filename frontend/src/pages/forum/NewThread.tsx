import { useEffect, useState } from 'react';
import { useForumStore } from '@/stores/forumStore';
import { MDXEditor } from '@/components/forum/MDXEditor';
import { TagInput } from '@/components/forum/TagInput';

interface NewThreadProps {
  slug: string;
}

export function NewThread({ slug }: NewThreadProps) {
  const { currentBoard, loading, error, fetchThreads, createThread, clearError } = useForumStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch board info on mount
  useEffect(() => {
    fetchThreads(slug, 1, 0);
  }, [slug, fetchThreads]);

  // Validation helpers
  const titleIsValid = title.trim().length >= 3 && title.trim().length <= 200;
  const contentIsValid = content.trim().length > 0;
  const tagsValid = tags.length >= 0; // tags são opcionais
  const canSubmit = titleIsValid && contentIsValid && tagsValid && !isSubmitting && !loading;

  async function handleSubmit() {
    if (!canSubmit) return;

    setIsSubmitting(true);
    clearError();

    try {
      await createThread(slug, {
        title: title.trim(),
        content: content,
        tags: tags,
      });

      // Check if there was an error in the store
      if (useForumStore.getState().error) {
        setIsSubmitting(false);
        return;
      }

      // Success — navigate to board (new thread will appear at the top)
      window.location.pathname = `/forum/${slug}`;
    } catch (err) {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    window.location.pathname = `/forum/${slug}`;
  }

  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: '#1B1B1B',
        fontFamily: '"Futura PT", ui-sans-serif, system-ui',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
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
        {/* Back button */}
        <button
          onClick={handleCancel}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#29292E',
            fontSize: '12px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.15s',
            padding: '0',
            fontFamily: '"Futura PT", ui-sans-serif, system-ui',
            fontWeight: 400,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = '#29292E';
          }}
        >
          ← Board
        </button>

        <span style={{ color: '#29292E', fontSize: '11px' }}>—</span>

        {/* Board name + New Thread label */}
        <span
          style={{
            color: '#FFFFFF',
            fontWeight: 400,
            fontSize: '13px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {currentBoard?.name || 'Carregando...'}
        </span>

        <span style={{ color: '#29292E', fontSize: '11px' }}>—</span>

        <span
          style={{
            color: '#29292E',
            fontWeight: 400,
            fontSize: '12px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          Nova Thread
        </span>
      </header>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Error message */}
        {error && (
          <div
            style={{
              backgroundColor: '#EC3391',
              color: '#FFFFFF',
              padding: '12px 16px',
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

        {/* Form container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxWidth: '800px',
          }}
        >
          {/* Title field */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <label
              style={{
                fontSize: '12px',
                color: '#29292E',
                fontWeight: 400,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da thread..."
              maxLength={200}
              style={{
                padding: '10px 12px',
                background: '#202026',
                border:
                  title.trim().length > 0 && !titleIsValid
                    ? '1px solid #EC3391'
                    : '1px solid #29292E',
                color: '#FFFFFF',
                fontSize: '13px',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.15s',
                borderRadius: 0,
              }}
              onFocus={(e) => {
                if (titleIsValid || title.trim().length === 0) {
                  (e.currentTarget as HTMLInputElement).style.borderColor =
                    '#00BABC';
                }
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLInputElement).style.borderColor =
                  title.trim().length > 0 && !titleIsValid
                    ? '#EC3391'
                    : '#29292E';
              }}
            />
            <div
              style={{
                fontSize: '11px',
                color:
                  title.trim().length > 0 && !titleIsValid
                    ? '#EC3391'
                    : '#5B5B60',
              }}
            >
              {title.length} / 200 ({title.trim().length < 3 ? 'mínimo 3' : 'OK'})
            </div>
          </div>

          {/* Content field */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <label
              style={{
                fontSize: '12px',
                color: '#29292E',
                fontWeight: 400,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Conteúdo
            </label>
            <MDXEditor
              value={content}
              onChange={setContent}
              placeholder="Escreva seu conteúdo aqui (markdown + MDX)..."
            />
          </div>

          {/* Tags field */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <label
              style={{
                fontSize: '12px',
                color: '#29292E',
                fontWeight: 400,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Tags
            </label>
            <TagInput tags={tags} onChange={setTags} max={5} />
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '12px',
            }}
          >
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                padding: '10px 20px',
                background: canSubmit ? '#00BABC' : '#29292E',
                color: canSubmit ? '#1B1B1B' : '#5B5B60',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
                borderRadius: 0,
              }}
              onMouseEnter={(e) => {
                if (canSubmit) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    '#04809F';
                }
              }}
              onMouseLeave={(e) => {
                if (canSubmit) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    '#00BABC';
                }
              }}
            >
              {isSubmitting ? 'Criando...' : 'Criar Thread'}
            </button>

            <button
              onClick={handleCancel}
              disabled={isSubmitting || loading}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: '1px solid #29292E',
                color: '#29292E',
                fontSize: '12px',
                fontWeight: 400,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor:
                  isSubmitting || loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                borderRadius: 0,
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && !loading) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    '#FFFFFF';
                  (e.currentTarget as HTMLButtonElement).style.color =
                    '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting && !loading) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    '#29292E';
                  (e.currentTarget as HTMLButtonElement).style.color =
                    '#29292E';
                }
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

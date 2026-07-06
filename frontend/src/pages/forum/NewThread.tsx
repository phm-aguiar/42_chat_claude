import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useForumStore } from '@/stores/forumStore';
import { MDXEditor } from '@/components/forum/MDXEditor';
import { TagInput } from '@/components/forum/TagInput';
import { Button } from '@/components/ui/Button';

interface NewThreadProps {
  slug: string;
}

export function NewThread({ slug }: NewThreadProps) {
  const navigate = useNavigate();
  const { setPageTitle } = useOutletContext<{ setPageTitle: (title: string) => void }>();
  const { currentBoard, loading, error, fetchThreads, createThread, clearError } = useForumStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch board info on mount
  useEffect(() => {
    fetchThreads(slug, 1, 0);
    setPageTitle('Nova Thread');
  }, [slug, fetchThreads, setPageTitle]);

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
      navigate(`/forum/${slug}`);
    } catch (err) {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    navigate(`/forum/${slug}`);
  }

  return (
    <div className="flex flex-col h-screen bg-surface-base">
      {/* Toolbar */}
      <div className="bg-surface-panel border-b border-surface-raised px-5 py-3 flex items-center gap-3 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="text-content-muted hover:text-content-primary"
        >
          ← Board
        </Button>
        <span className="text-content-muted text-xs">—</span>
        <span className="text-content-primary text-sm font-normal uppercase tracking-tight">
          {currentBoard?.name || 'Carregando...'}
        </span>
        <span className="text-content-muted text-xs">—</span>
        <span className="text-content-muted text-sm font-normal uppercase tracking-tight">
          Nova Thread
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-5">
        {/* Error message */}
        {error && (
          <div className="bg-status-error text-content-primary px-4 py-3 mb-4 text-xs flex items-center justify-between gap-4 flex-shrink-0">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="bg-transparent border-0 text-content-primary cursor-pointer text-sm p-0 ml-auto hover:opacity-80"
            >
              ✕
            </button>
          </div>
        )}

        {/* Form container */}
        <div className="max-w-2xl mx-auto">
          {/* Title field */}
          <div className="mb-6">
            <label className="block text-content-muted text-xs font-normal uppercase tracking-wide mb-1.5">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da thread..."
              maxLength={200}
              className={`
                w-full px-3 py-2 bg-surface-panel border text-content-primary text-sm font-normal
                outline-none transition-colors
                ${
                  title.trim().length > 0 && !titleIsValid
                    ? 'border-status-error'
                    : 'border-surface-raised focus:border-accent-primary'
                }
              `}
            />
            <div
              className={`
                text-xs mt-1.5
                ${
                  title.trim().length > 0 && !titleIsValid
                    ? 'text-status-error'
                    : 'text-content-muted'
                }
              `}
            >
              {title.length} / 200 ({title.trim().length < 3 ? 'mínimo 3' : 'OK'})
            </div>
          </div>

          {/* Content field */}
          <div className="mb-6">
            <label className="block text-content-muted text-xs font-normal uppercase tracking-wide mb-1.5">
              Conteúdo
            </label>
            <MDXEditor
              value={content}
              onChange={setContent}
              placeholder="Escreva seu conteúdo aqui (markdown + MDX)..."
            />
          </div>

          {/* Tags field */}
          <div className="mb-8">
            <label className="block text-content-muted text-xs font-normal uppercase tracking-wide mb-1.5">
              Tags
            </label>
            <TagInput tags={tags} onChange={setTags} max={5} />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="uppercase tracking-wider font-bold"
            >
              {isSubmitting ? 'Criando...' : 'Criar Thread'}
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={handleCancel}
              disabled={isSubmitting || loading}
              className="uppercase tracking-wider font-bold"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

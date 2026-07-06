import { useState } from 'react';
import type { Thread, Post } from '@/lib/forumApi';
import { useForumStore } from '@/stores/forumStore';

type ModRole = 'owner' | 'mod' | 'admin';

type Target =
  | { kind: 'thread'; thread: Thread }
  | { kind: 'post'; post: Post };

interface ModControlsProps {
  target: Target;
  role: ModRole | null;
  onDone?: () => void;
}

/**
 * ModControls — Inline moderation toolbar para threads e posts.
 *
 * Renderiza apenas se role ∈ {owner, mod, admin}.
 *
 * Threads: Pin/Unpin, Lock/Unlock, Delete (2-click confirm)
 * Posts: Delete (2-click confirm)
 *
 * Erros ficam no forumStore.error (não trata além de não travar UI).
 * onDone() é chamado após ação bem-sucedida.
 */
export function ModControls({ target, role, onDone }: ModControlsProps) {
  // Se role é null ou não é um dos permitidos, não renderiza nada
  if (!role) {
    return null;
  }

  const patchThread = useForumStore((s) => s.patchThread);
  const deleteThread = useForumStore((s) => s.deleteThread);
  const deletePost = useForumStore((s) => s.deletePost);

  // Estado local: qual botão está em "confirm?" mode
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  /**
   * Trata clique em botão delete: primeiro clique vira "Confirmar?",
   * segundo clique (com mesmo ID) executa a ação.
   */
  async function handleDelete() {
    const targetId = target.kind === 'thread' ? target.thread.id : target.post.id;

    if (confirmingId !== targetId) {
      // Primeiro clique: muda para confirm mode por 3s
      setConfirmingId(targetId);
      setTimeout(() => {
        setConfirmingId(null);
      }, 3000);
      return;
    }

    // Segundo clique: executa delete
    try {
      if (target.kind === 'thread') {
        await deleteThread(targetId);
      } else {
        await deletePost(targetId);
      }
      setConfirmingId(null);
      onDone?.();
    } catch {
      // Erro fica no store, UI não trava
    }
  }

  /**
   * Pin/Unpin thread
   */
  async function handlePin() {
    if (target.kind !== 'thread') return;
    try {
      const newPinnedState = !target.thread.is_pinned;
      await patchThread(target.thread.id, { is_pinned: newPinnedState });
      onDone?.();
    } catch {
      // Erro fica no store
    }
  }

  /**
   * Lock/Unlock thread
   */
  async function handleLock() {
    if (target.kind !== 'thread') return;
    try {
      const newLockedState = !target.thread.is_locked;
      await patchThread(target.thread.id, { is_locked: newLockedState });
      onDone?.();
    } catch {
      // Erro fica no store
    }
  }

  const isConfirming = confirmingId !== null;

  // Classes base para botão: small, flat, icon-only com hover de cor
  const buttonBaseClass = 'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-normal font-sans border-none transition-colors duration-150 cursor-pointer whitespace-nowrap';
  const normalButtonClass = 'bg-surface-raised text-surface-raised hover:text-accent-primary';
  const deleteButtonBaseClass = 'bg-surface-raised border-none transition-colors duration-150 cursor-pointer whitespace-nowrap';

  return (
    <div className="flex gap-2 items-center">
      {target.kind === 'thread' && (
        <>
          {/* Pin/Unpin Button */}
          <button
            onClick={handlePin}
            title={target.thread.is_pinned ? 'Desafixar' : 'Afixar'}
            className={`${buttonBaseClass} ${normalButtonClass}`}
          >
            {target.thread.is_pinned ? '📌' : '📍'}
          </button>

          {/* Lock/Unlock Button */}
          <button
            onClick={handleLock}
            title={target.thread.is_locked ? 'Desbloquear' : 'Bloquear'}
            className={`${buttonBaseClass} ${normalButtonClass}`}
          >
            {target.thread.is_locked ? '🔓' : '🔒'}
          </button>
        </>
      )}

      {/* Delete Button — pink on confirm */}
      <button
        onClick={handleDelete}
        title={isConfirming ? 'Clique novamente para confirmar' : 'Deletar'}
        className={`${buttonBaseClass} ${deleteButtonBaseClass} ${
          isConfirming
            ? 'text-status-error'
            : 'text-surface-raised hover:text-status-error'
        }`}
      >
        {isConfirming ? 'Confirmar?' : '🗑️'}
      </button>
    </div>
  );
}

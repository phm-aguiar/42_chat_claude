import { useState, useRef, type KeyboardEvent } from 'react';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  onInputChange?: (value: string) => void;
}

export function MessageInput({ onSend, disabled = false, onInputChange }: MessageInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="border-t border-surface-raised px-5 py-3 flex gap-2.5 bg-surface-panel shrink-0">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onInputChange?.(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        maxLength={5000}
        rows={1}
        placeholder={disabled ? 'Conectando...' : 'Mensagem para #general  (Enter para enviar)'}
        className="flex-1 bg-surface-base border border-surface-raised text-content-primary text-sm py-2 px-3 resize-none focus:outline-none focus:border-accent-primary transition-colors disabled:opacity-60"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className={`px-5 py-2 text-xs font-bold tracking-widest uppercase transition-colors shrink-0 ${
          disabled || !value.trim()
            ? 'bg-surface-raised text-content-muted cursor-not-allowed'
            : 'bg-accent-primary text-surface-base hover:bg-accent-secondary cursor-pointer'
        }`}
      >
        Enviar
      </button>
    </div>
  );
}

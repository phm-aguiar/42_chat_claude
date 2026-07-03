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
    <div
      style={{
        borderTop: '1px solid #29292E',
        padding: '12px 20px',
        display: 'flex',
        gap: '10px',
        background: '#202026',
        flexShrink: 0,
      }}
    >
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
        style={{
          flex: 1,
          background: '#1B1B1B',
          border: '1px solid #29292E',
          color: '#FFFFFF',
          fontSize: '13px',
          padding: '9px 12px',
          resize: 'none',
          outline: 'none',
          fontFamily: 'inherit',
          lineHeight: '1.4',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => (e.currentTarget.style.borderColor = '#00BABC')}
        onBlur={e => (e.currentTarget.style.borderColor = '#29292E')}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        style={{
          background: disabled || !value.trim() ? '#29292E' : '#00BABC',
          color: disabled || !value.trim() ? '#1B1B1B' : '#1B1B1B',
          border: 'none',
          padding: '0 20px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          cursor: disabled || !value.trim() ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s',
          fontFamily: 'inherit',
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          const btn = e.currentTarget as HTMLButtonElement;
          if (!btn.disabled) btn.style.background = '#04809F';
        }}
        onMouseLeave={e => {
          const btn = e.currentTarget as HTMLButtonElement;
          if (!btn.disabled) btn.style.background = '#00BABC';
        }}
      >
        Enviar
      </button>
    </div>
  );
}

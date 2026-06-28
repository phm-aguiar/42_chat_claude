import { useState, type KeyboardEvent } from 'react';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled = false }: MessageInputProps) {
  const [value, setValue] = useState('');

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="border-t border-[#29292E] p-3 flex gap-2">
      <textarea
        className="flex-1 bg-[#202026] text-[#FFFFFF] placeholder-[#29292E] text-sm p-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#00BABC]"
        placeholder="Digite uma mensagem... (Enter para enviar)"
        rows={2}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        maxLength={5000}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="bg-[#00BABC] text-[#1B1B1B] font-bold text-sm px-4 uppercase disabled:opacity-40 hover:bg-[#04809F] transition-colors"
      >
        Enviar
      </button>
    </div>
  );
}

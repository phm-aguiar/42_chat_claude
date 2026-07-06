import { useState, useRef, useEffect } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  max?: number;
}

export function TagInput({
  tags,
  onChange,
  suggestions = [],
  max = 5,
}: TagInputProps) {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (input.trim() === '') {
      setFilteredSuggestions([]);
      setIsOpen(false);
      return;
    }

    const lowerInput = input.toLowerCase();
    const filtered = suggestions
      .filter(
        (s) =>
          s.toLowerCase().startsWith(lowerInput) && !tags.includes(s)
      )
      .slice(0, 5);

    setFilteredSuggestions(filtered);
    setIsOpen(filtered.length > 0);
  }, [input, suggestions, tags]);

  // Close dropdown on blur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function addTag(tag: string) {
    const normalizedTag = tag.trim().toLowerCase();

    if (
      normalizedTag === '' ||
      tags.includes(normalizedTag) ||
      tags.length >= max
    ) {
      return;
    }

    onChange([...tags, normalizedTag]);
    setInput('');
    setIsOpen(false);
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  function handleSuggestionClick(suggestion: string) {
    addTag(suggestion);
    inputRef.current?.focus();
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-2 relative"
    >
      {/* Tag chips */}
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1.5 px-2 py-1 bg-accent-primary text-surface-base text-xs font-normal"
          >
            <span>{tag}</span>
            <button
              onClick={() => removeTag(idx)}
              className="bg-transparent border-none text-surface-base cursor-pointer text-sm p-0 flex items-center"
              title="Remover tag"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Input container */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (input.trim() !== '') {
              setIsOpen(true);
            }
          }}
          placeholder={
            tags.length >= max
              ? `Máximo ${max} tags`
              : 'Adicione tags (Enter ou vírgula)...'
          }
          disabled={tags.length >= max && input.trim() === ''}
          className={`w-full px-3 py-2.5 bg-surface-panel border border-surface-raised text-content-primary text-sm font-inherit outline-none transition-colors duration-150 focus:border-accent-primary ${
            tags.length >= max && input.trim() === '' ? 'cursor-not-allowed opacity-60' : 'cursor-text'
          }`}
        />

        {/* Autocomplete dropdown */}
        {isOpen && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-surface-panel border border-accent-primary z-10 max-h-36 overflow-y-auto">
            {filteredSuggestions.map((suggestion, idx) => (
              <div
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`px-3 py-2 text-xs cursor-pointer transition-colors duration-150 ${
                  idx === 0
                    ? 'bg-accent-primary text-surface-base'
                    : 'bg-surface-panel text-content-primary hover:bg-accent-primary hover:text-surface-base'
                }`}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Counter */}
      <div
        className={`text-xs ${
          tags.length >= max ? 'text-status-error' : 'text-content-muted'
        }`}
      >
        {tags.length} / {max} tags
      </div>
    </div>
  );
}

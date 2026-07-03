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
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        position: 'relative',
      }}
    >
      {/* Tag chips */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
        }}
      >
        {tags.map((tag, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              background: '#00BABC',
              color: '#1B1B1B',
              fontSize: '12px',
              fontWeight: 400,
              borderRadius: 0,
            }}
          >
            <span>{tag}</span>
            <button
              onClick={() => removeTag(idx)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1B1B1B',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Remover tag"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Input container */}
      <div
        style={{
          position: 'relative',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={(e) => {
            if (input.trim() !== '') {
              setIsOpen(true);
            }
            (e.currentTarget as HTMLInputElement).style.borderColor = '#00BABC';
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLInputElement).style.borderColor = '#29292E';
          }}
          placeholder={
            tags.length >= max
              ? `Máximo ${max} tags`
              : 'Adicione tags (Enter ou vírgula)...'
          }
          disabled={tags.length >= max && input.trim() === ''}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: '#202026',
            border: '1px solid #29292E',
            color: '#FFFFFF',
            fontSize: '13px',
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'border-color 0.15s',
            borderRadius: 0,
            cursor: tags.length >= max && input.trim() === '' ? 'not-allowed' : 'text',
            opacity: tags.length >= max && input.trim() === '' ? 0.6 : 1,
          }}
        />

        {/* Autocomplete dropdown */}
        {isOpen && filteredSuggestions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              background: '#202026',
              border: '1px solid #00BABC',
              borderRadius: 0,
              zIndex: 10,
              maxHeight: '150px',
              overflowY: 'auto',
            }}
          >
            {filteredSuggestions.map((suggestion, idx) => (
              <div
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                style={{
                  padding: '8px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  background: idx === 0 ? '#00BABC' : '#202026',
                  color: idx === 0 ? '#1B1B1B' : '#FFFFFF',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background =
                    '#00BABC';
                  (e.currentTarget as HTMLDivElement).style.color = '#1B1B1B';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background =
                    '#202026';
                  (e.currentTarget as HTMLDivElement).style.color = '#FFFFFF';
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Counter */}
      <div
        style={{
          fontSize: '11px',
          color: tags.length >= max ? '#EC3391' : '#5B5B60',
        }}
      >
        {tags.length} / {max} tags
      </div>
    </div>
  );
}

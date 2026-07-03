import { useState, useRef } from 'react';
import { MDXRenderer } from './MDXRenderer';

interface MDXEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MDXEditor({ value, onChange, placeholder = 'Digite seu conteúdo aqui...' }: MDXEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const charCount = value.length;
  const isOverLimit = charCount > 10000;

  function insertSyntax(before: string, after: string = '', defaultText: string = 'texto') {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultText;
    const newValue =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    onChange(newValue);

    // Move cursor to after the inserted syntax
    setTimeout(() => {
      const newPosition = start + before.length + selectedText.length;
      textarea.selectionStart = textarea.selectionEnd = newPosition;
      textarea.focus();
    }, 0);
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        background: '#202026',
        border: '1px solid #29292E',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          padding: '8px 12px',
          borderBottom: '1px solid #29292E',
          background: '#1B1B1B',
        }}
      >
        <button
          onClick={() => insertSyntax('**', '**', 'bold')}
          title="Bold (Ctrl+B)"
          style={{
            padding: '6px 10px',
            background: '#29292E',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#00BABC')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#29292E')}
        >
          B
        </button>

        <button
          onClick={() => insertSyntax('*', '*', 'italic')}
          title="Italic (Ctrl+I)"
          style={{
            padding: '6px 10px',
            background: '#29292E',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '12px',
            fontWeight: 700,
            fontStyle: 'italic',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#00BABC')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#29292E')}
        >
          I
        </button>

        <button
          onClick={() => insertSyntax('## ', '', 'heading')}
          title="Heading 2 (H2)"
          style={{
            padding: '6px 10px',
            background: '#29292E',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#00BABC')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#29292E')}
        >
          H2
        </button>

        <button
          onClick={() => insertSyntax('[', '](https://)', 'link text')}
          title="Link"
          style={{
            padding: '6px 10px',
            background: '#29292E',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#00BABC')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#29292E')}
        >
          Link
        </button>

        <button
          onClick={() => insertSyntax('`', '`', 'code')}
          title="Inline Code"
          style={{
            padding: '6px 10px',
            background: '#29292E',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '12px',
            fontWeight: 700,
            fontFamily: '"Courier New", monospace',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#00BABC')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#29292E')}
        >
          `
        </button>

        <button
          onClick={() => insertSyntax('```\n', '\n```', 'code block')}
          title="Code Block"
          style={{
            padding: '6px 10px',
            background: '#29292E',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '12px',
            fontWeight: 700,
            fontFamily: '"Courier New", monospace',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#00BABC')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#29292E')}
        >
          {'{'}'{'}'}
        </button>

        <button
          onClick={() => insertSyntax('![', '](https://)', 'alt text')}
          title="Image"
          style={{
            padding: '6px 10px',
            background: '#29292E',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#00BABC')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#29292E')}
        >
          Img
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Character counter */}
          <span
            style={{
              fontSize: '11px',
              color: isOverLimit ? '#EC3391' : '#5B5B60',
              fontWeight: isOverLimit ? 700 : 400,
            }}
          >
            {charCount} / 10000
          </span>

          {/* Preview toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            style={{
              padding: '6px 10px',
              background: showPreview ? '#00BABC' : '#29292E',
              color: showPreview ? '#1B1B1B' : '#FFFFFF',
              border: 'none',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) =>
              !showPreview && (e.currentTarget.style.background = '#04809F')
            }
            onMouseLeave={(e) =>
              !showPreview && (e.currentTarget.style.background = '#29292E')
            }
          >
            Preview
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div
        style={{
          display: showPreview ? 'grid' : 'block',
          gridTemplateColumns: showPreview ? '1fr 1fr' : undefined,
          gap: showPreview ? '12px' : undefined,
          padding: '12px',
        }}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={10000}
          style={{
            background: '#1B1B1B',
            border: '1px solid #29292E',
            color: '#FFFFFF',
            fontSize: '13px',
            padding: '12px',
            fontFamily: 'inherit',
            lineHeight: '1.5',
            resize: isOverLimit ? 'none' : 'vertical',
            outline: 'none',
            minHeight: '200px',
            transition: 'border-color 0.15s',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#00BABC')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#29292E')}
        />

        {/* Preview */}
        {showPreview && (
          <div
            style={{
              background: '#1B1B1B',
              border: '1px solid #29292E',
              padding: '12px',
              overflowY: 'auto',
              maxHeight: '300px',
            }}
          >
            <MDXRenderer content={value} />
          </div>
        )}
      </div>
    </div>
  );
}

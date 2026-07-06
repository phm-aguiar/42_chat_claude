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
    <div className="flex flex-col gap-2 bg-surface-panel border border-surface-raised">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1.5 p-3 border-b border-surface-raised bg-surface-base">
        <button
          onClick={() => insertSyntax('**', '**', 'bold')}
          title="Bold (Ctrl+B)"
          className="px-2.5 py-1.5 bg-surface-raised text-content-primary border-none text-xs font-bold cursor-pointer transition-all duration-150 hover:bg-accent-primary hover:text-surface-base"
        >
          B
        </button>

        <button
          onClick={() => insertSyntax('*', '*', 'italic')}
          title="Italic (Ctrl+I)"
          className="px-2.5 py-1.5 bg-surface-raised text-content-primary border-none text-xs font-bold italic cursor-pointer transition-all duration-150 hover:bg-accent-primary hover:text-surface-base"
        >
          I
        </button>

        <button
          onClick={() => insertSyntax('## ', '', 'heading')}
          title="Heading 2 (H2)"
          className="px-2.5 py-1.5 bg-surface-raised text-content-primary border-none text-xs font-bold cursor-pointer transition-all duration-150 hover:bg-accent-primary hover:text-surface-base"
        >
          H2
        </button>

        <button
          onClick={() => insertSyntax('[', '](https://)', 'link text')}
          title="Link"
          className="px-2.5 py-1.5 bg-surface-raised text-content-primary border-none text-xs font-bold cursor-pointer transition-all duration-150 hover:bg-accent-primary hover:text-surface-base"
        >
          Link
        </button>

        <button
          onClick={() => insertSyntax('`', '`', 'code')}
          title="Inline Code"
          className="px-2.5 py-1.5 bg-surface-raised text-content-primary border-none text-xs font-bold font-mono cursor-pointer transition-all duration-150 hover:bg-accent-primary hover:text-surface-base"
        >
          `
        </button>

        <button
          onClick={() => insertSyntax('```\n', '\n```', 'code block')}
          title="Code Block"
          className="px-2.5 py-1.5 bg-surface-raised text-content-primary border-none text-xs font-bold font-mono cursor-pointer transition-all duration-150 hover:bg-accent-primary hover:text-surface-base"
        >
          {'{'}'{'}'}
        </button>

        <button
          onClick={() => insertSyntax('![', '](https://)', 'alt text')}
          title="Image"
          className="px-2.5 py-1.5 bg-surface-raised text-content-primary border-none text-xs font-bold cursor-pointer transition-all duration-150 hover:bg-accent-primary hover:text-surface-base"
        >
          Img
        </button>

        <div className="ml-auto flex items-center gap-3">
          {/* Character counter */}
          <span
            className={`text-xs font-${isOverLimit ? 'bold' : 'normal'} ${
              isOverLimit ? 'text-status-error' : 'text-content-muted'
            }`}
          >
            {charCount} / 10000
          </span>

          {/* Preview toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-2.5 py-1.5 border-none text-xs font-bold cursor-pointer transition-all duration-150 ${
              showPreview
                ? 'bg-accent-primary text-surface-base'
                : 'bg-surface-raised text-content-primary hover:bg-accent-cg-blue'
            }`}
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
          className="bg-surface-base border border-surface-raised text-content-primary text-sm p-3 font-inherit leading-relaxed outline-none min-h-52 transition-colors duration-150 focus:border-accent-primary"
          style={{
            resize: isOverLimit ? 'none' : 'vertical',
          }}
        />

        {/* Preview */}
        {showPreview && (
          <div className="bg-surface-base border border-surface-raised p-3 overflow-y-auto max-h-80">
            <MDXRenderer content={value} />
          </div>
        )}
      </div>
    </div>
  );
}

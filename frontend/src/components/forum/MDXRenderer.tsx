import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface MDXRendererProps {
  content: string;
}

export function MDXRenderer({ content }: MDXRendererProps) {
  return (
    <div
      className="text-content-primary text-sm leading-relaxed break-words"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mt-4 mb-3 text-content-primary">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold mt-3.5 mb-2.5 text-content-primary">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-bold mt-3 mb-2 text-content-primary">
              {children}
            </h3>
          ),
          // Paragraphs
          p: ({ children }) => (
            <p className="mb-3">
              {children}
            </p>
          ),
          // Lists
          ul: ({ children }) => (
            <ul className="ml-5 mb-3 list-disc">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="ml-5 mb-3 list-decimal">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="mb-1.5">
              {children}
            </li>
          ),
          // Inline code
          code: ({ children, className }) => {
            const isBlock = className?.startsWith('language-');
            return isBlock ? (
              <pre className="bg-surface-base border border-surface-raised p-3 mb-3 overflow-x-auto text-content-primary text-xs font-mono">
                <code className={className}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-surface-panel border border-surface-raised px-1.5 py-0.5 text-status-success font-mono text-xs">
                {children}
              </code>
            );
          },
          // Blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-accent-primary mb-3 pl-3 text-content-secondary italic">
              {children}
            </blockquote>
          ),
          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-primary underline cursor-pointer hover:text-accent-primary/80 transition-colors duration-150"
            >
              {children}
            </a>
          ),
          // Images
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt || 'Image'}
              className="max-w-full h-auto mb-3 block"
              onError={(e) => {
                const img = e.currentTarget;
                img.style.display = 'none';
              }}
            />
          ),
          // Horizontal rule
          hr: () => (
            <hr className="border-none border-t border-surface-raised my-4" />
          ),
          // Tables
          table: ({ children }) => (
            <table className="w-full border-collapse mb-3">
              {children}
            </table>
          ),
          thead: ({ children }) => (
            <thead className="border-b-2 border-surface-raised">
              {children}
            </thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-surface-raised">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="text-left px-3 py-2 font-bold text-content-primary">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-content-primary">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

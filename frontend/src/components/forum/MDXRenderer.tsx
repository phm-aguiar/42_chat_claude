import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface MDXRendererProps {
  content: string;
}

export function MDXRenderer({ content }: MDXRendererProps) {
  return (
    <div
      style={{
        color: '#FFFFFF',
        fontSize: '13px',
        lineHeight: '1.6',
        wordBreak: 'break-word',
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1
              style={{
                fontSize: '20px',
                fontWeight: 700,
                marginTop: '16px',
                marginBottom: '12px',
                color: '#FFFFFF',
              }}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 700,
                marginTop: '14px',
                marginBottom: '10px',
                color: '#FFFFFF',
              }}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              style={{
                fontSize: '14px',
                fontWeight: 700,
                marginTop: '12px',
                marginBottom: '8px',
                color: '#FFFFFF',
              }}
            >
              {children}
            </h3>
          ),
          // Paragraphs
          p: ({ children }) => (
            <p
              style={{
                marginBottom: '12px',
              }}
            >
              {children}
            </p>
          ),
          // Lists
          ul: ({ children }) => (
            <ul
              style={{
                marginLeft: '20px',
                marginBottom: '12px',
                listStyleType: 'disc',
              }}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              style={{
                marginLeft: '20px',
                marginBottom: '12px',
                listStyleType: 'decimal',
              }}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li
              style={{
                marginBottom: '6px',
              }}
            >
              {children}
            </li>
          ),
          // Inline code
          code: ({ children, className }) => {
            const isBlock = className?.startsWith('language-');
            return isBlock ? (
              <pre
                style={{
                  background: '#1B1B1B',
                  border: '1px solid #29292E',
                  padding: '12px',
                  marginBottom: '12px',
                  overflowX: 'auto',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontFamily: '"Courier New", monospace',
                }}
              >
                <code className={className} style={{ color: 'inherit' }}>
                  {children}
                </code>
              </pre>
            ) : (
              <code
                style={{
                  background: '#202026',
                  border: '1px solid #29292E',
                  padding: '3px 6px',
                  borderRadius: 0,
                  color: '#2DD57A',
                  fontFamily: '"Courier New", monospace',
                  fontSize: '12px',
                }}
              >
                {children}
              </code>
            );
          },
          // Blockquote
          blockquote: ({ children }) => (
            <blockquote
              style={{
                borderLeft: '3px solid #00BABC',
                marginLeft: 0,
                marginBottom: '12px',
                paddingLeft: '12px',
                color: '#E3E3E3',
                fontStyle: 'italic',
              }}
            >
              {children}
            </blockquote>
          ),
          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#00BABC',
                textDecoration: 'underline',
                cursor: 'pointer',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#04809F')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#00BABC')}
            >
              {children}
            </a>
          ),
          // Images
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt || 'Image'}
              style={{
                maxWidth: '100%',
                height: 'auto',
                marginBottom: '12px',
                display: 'block',
              }}
              onError={(e) => {
                const img = e.currentTarget;
                img.style.display = 'none';
              }}
            />
          ),
          // Horizontal rule
          hr: () => (
            <hr
              style={{
                border: 'none',
                borderTop: '1px solid #29292E',
                marginTop: '16px',
                marginBottom: '16px',
              }}
            />
          ),
          // Tables
          table: ({ children }) => (
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '12px',
                borderSpacing: 0,
              }}
            >
              {children}
            </table>
          ),
          thead: ({ children }) => (
            <thead
              style={{
                borderBottom: '2px solid #29292E',
              }}
            >
              {children}
            </thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr
              style={{
                borderBottom: '1px solid #29292E',
              }}
            >
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                fontWeight: 700,
                color: '#FFFFFF',
              }}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              style={{
                padding: '8px 12px',
                color: '#FFFFFF',
              }}
            >
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

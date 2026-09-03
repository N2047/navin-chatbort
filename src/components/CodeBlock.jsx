import React, { useState } from 'react';
import { Check, Copy, Code2 } from 'lucide-react';

export const CodeBlock = ({ language, children }) => {
  const [copied, setCopied] = useState(false);

  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };

  const cleanLang = language ? language.replace(/language-/, '') : 'code';

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <div className="code-block-lang">
          <Code2 size={14} className="code-icon" />
          <span>{cleanLang}</span>
        </div>
        <button
          onClick={handleCopy}
          className="code-copy-btn"
          title="Copy code to clipboard"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={13} className="text-success" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="code-block-content">
        <pre>
          <code className={`hljs ${language || ''}`}>{codeString}</code>
        </pre>
      </div>
    </div>
  );
};

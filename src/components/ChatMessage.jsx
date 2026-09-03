import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import confetti from 'canvas-confetti';
import {
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  Edit2,
  CheckCheck,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { CodeBlock } from './CodeBlock';

export const ChatMessage = ({
  message,
  onRegenerate,
  onEditAndResend,
  isLastBotMessage,
  isLoading,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState(message.feedback || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  const isBot = message.role === 'assistant';
  const isError = message.isError;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content.replace(/```[\s\S]*?```/g, 'Code block omitted.'));
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleThumbsUp = (e) => {
    if (feedback === 'up') {
      setFeedback(null);
      return;
    }
    setFeedback('up');
    
    // Trigger confetti celebration
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 25,
      spread: 50,
      origin: { x, y },
      colors: ['#8b5cf6', '#ec4899', '#38bdf8', '#10b981'],
      disableForReducedMotion: true,
    });
  };

  const handleThumbsDown = () => {
    setFeedback(feedback === 'down' ? null : 'down');
  };

  const handleSaveEdit = () => {
    if (editedContent.trim() && onEditAndResend) {
      onEditAndResend(message.id, editedContent.trim());
      setIsEditing(false);
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts) return '';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className={`message-row ${isBot ? 'bot-row' : 'user-row'}`}>
      <div className="message-container">
        {/* Avatar */}
        <div className={`message-avatar ${isBot ? 'bot-avatar' : 'user-avatar'}`}>
          {isBot ? (
            <div className="avatar-bot-inner">
              <Bot size={18} className="bot-icon-svg" />
            </div>
          ) : (
            <div className="avatar-user-inner">
              <User size={18} />
            </div>
          )}
        </div>

        {/* Bubble & Meta */}
        <div className="message-content-wrapper">
          <div className="message-header">
            <span className="message-sender-name">
              {isBot ? 'ChatBord AI' : 'You'}
            </span>
            {isBot && message.isDemo && (
              <span className="badge-demo-mode">Demo Mode</span>
            )}
            {message.latencyMs !== undefined && (
              <span className="message-meta-tag" title="Response latency">
                <Clock size={11} />
                {message.latencyMs}ms
              </span>
            )}
            <span className="message-time">{formatTimestamp(message.timestamp)}</span>
          </div>

          <div className={`message-bubble ${isBot ? 'bot-bubble' : 'user-bubble'} ${isError ? 'error-bubble' : ''}`}>
            {isEditing ? (
              <div className="message-edit-box">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="edit-textarea"
                  rows={3}
                  autoFocus
                />
                <div className="edit-actions">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn-cancel-edit"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="btn-save-edit"
                  >
                    <CheckCheck size={14} />
                    Save & Resend
                  </button>
                </div>
              </div>
            ) : (
              <>
                {isError && (
                  <div className="error-indicator">
                    <AlertTriangle size={16} className="error-icon" />
                    <strong>Webhook Communication Issue</strong>
                  </div>
                )}

                {/* Attachments preview if any */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="message-attachments-preview">
                    {message.attachments.map((att, idx) => (
                      <div key={idx} className="attachment-chip">
                        <span>📎 {att.name}</span>
                        <span className="att-size">({Math.round(att.size / 1024)} KB)</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Markdown body */}
                <div className="markdown-body">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        if (!inline && match) {
                          return (
                            <CodeBlock language={match[1]}>
                              {children}
                            </CodeBlock>
                          );
                        }
                        if (!inline && String(children).includes('\n')) {
                          return (
                            <CodeBlock language="text">
                              {children}
                            </CodeBlock>
                          );
                        }
                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </>
            )}
          </div>

          {/* Action Toolbar */}
          {!isEditing && (
            <div className="message-actions-bar">
              <button
                onClick={handleCopy}
                className="action-icon-btn"
                title="Copy message"
                aria-label="Copy"
              >
                {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              </button>

              {isBot && 'speechSynthesis' in window && (
                <button
                  onClick={handleSpeak}
                  className={`action-icon-btn ${isSpeaking ? 'active-speaking' : ''}`}
                  title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                  aria-label="Text to speech"
                >
                  {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
              )}

              {isBot && (
                <>
                  <button
                    onClick={handleThumbsUp}
                    className={`action-icon-btn ${feedback === 'up' ? 'text-success feedback-active' : ''}`}
                    title="Good response"
                    aria-label="Thumbs up"
                  >
                    <ThumbsUp size={14} />
                  </button>
                  <button
                    onClick={handleThumbsDown}
                    className={`action-icon-btn ${feedback === 'down' ? 'text-danger feedback-active' : ''}`}
                    title="Bad response"
                    aria-label="Thumbs down"
                  >
                    <ThumbsDown size={14} />
                  </button>
                </>
              )}

              {isBot && isLastBotMessage && !isLoading && (
                <button
                  onClick={onRegenerate}
                  className="action-icon-btn regenerate-btn"
                  title="Regenerate response"
                  aria-label="Regenerate"
                >
                  <RotateCcw size={14} />
                  <span>Retry</span>
                </button>
              )}

              {!isBot && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="action-icon-btn"
                  title="Edit message and resend"
                  aria-label="Edit"
                >
                  <Edit2 size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

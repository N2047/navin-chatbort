import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Mic,
  MicOff,
  Paperclip,
  X,
  Sparkles,
  CornerDownLeft,
} from 'lucide-react';

export const ChatInput = ({
  onSendMessage,
  isLoading,
  onStopGeneration,
  placeholder = 'Ask anything or paste instructions for n8n...',
}) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize SpeechRecognition if available
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setText((prev) => (prev ? prev + ' ' + transcript : transcript));
      };

      recognition.onerror = (err) => {
        console.error('Speech recognition error:', err);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [text]);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || isLoading) return;

    onSendMessage({
      text: text.trim(),
      attachments,
    });

    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            size: file.size,
            data: event.target.result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
    // Reset input
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="chat-input-wrapper">
      {/* File Attachments Previews */}
      {attachments.length > 0 && (
        <div className="input-attachments-list">
          {attachments.map((file, idx) => (
            <div key={idx} className="input-attachment-chip">
              <span className="file-name" title={file.name}>
                📎 {file.name}
              </span>
              <button
                type="button"
                onClick={() => removeAttachment(idx)}
                className="chip-remove-btn"
                aria-label="Remove attachment"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Input Box */}
      <div className={`chat-input-box ${isRecording ? 'recording-active' : ''}`}>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="input-tool-btn"
          title="Attach file or context"
          aria-label="Attach file"
        >
          <Paperclip size={18} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          multiple
          style={{ display: 'none' }}
        />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isRecording ? 'Listening... Speak now.' : placeholder}
          rows={1}
          className="chat-textarea"
        />

        {/* Voice Input */}
        <button
          type="button"
          onClick={toggleVoice}
          className={`input-tool-btn voice-btn ${isRecording ? 'recording-btn-active' : ''}`}
          title={isRecording ? 'Stop voice recording' : 'Voice dictation'}
          aria-label="Voice input"
        >
          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {/* Send / Stop Button */}
        {isLoading ? (
          <button
            type="button"
            onClick={onStopGeneration}
            className="send-button stop-btn"
            title="Stop generation"
            aria-label="Stop"
          >
            <Square size={16} fill="currentColor" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() && attachments.length === 0}
            className="send-button"
            title="Send message (Enter)"
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        )}
      </div>

      {/* Input Sub-footer */}
      <div className="input-subfooter">
        <span className="input-hint">
          Press <kbd>Enter</kbd> to send, <kbd>Shift + Enter</kbd> for new line
        </span>
        <span className="input-char-count">
          {text.length} characters
        </span>
      </div>
    </div>
  );
};

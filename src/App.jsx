import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { StarterPrompts } from './components/StarterPrompts';
import { SettingsModal } from './components/SettingsModal';
import { N8nGuideModal } from './components/N8nGuideModal';
import { DEFAULT_N8N_CONFIG } from './constants';
import { sendN8nMessage, getDemoResponse } from './services/n8nService';
import './App.css';

const LOCAL_STORAGE_SESSIONS_KEY = 'chatbord_ai_sessions_v1';
const LOCAL_STORAGE_CONFIG_KEY = 'chatbord_ai_config_v1';
const LOCAL_STORAGE_THEME_KEY = 'chatbord_ai_theme_v1';

const createNewSessionObject = () => {
  const id = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  return {
    id,
    title: 'New Conversation',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
  };
};

export function App() {
  // Config state
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY);
      return saved ? { ...DEFAULT_N8N_CONFIG, ...JSON.parse(saved) } : DEFAULT_N8N_CONFIG;
    } catch {
      return DEFAULT_N8N_CONFIG;
    }
  });

  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(LOCAL_STORAGE_THEME_KEY) || 'nebula';
  });

  // Sessions state
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse sessions from localStorage', e);
    }
    return [createNewSessionObject()];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    return sessions[0]?.id || '';
  });

  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const activeRequestRef = useRef(null);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, theme);
  }, [theme]);

  // Persist config
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(config));
  }, [config]);

  // Persist sessions
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
  }, [sessions]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, isLoading, activeSessionId]);

  // Active session helper
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Auto-generate title from first message
  const generateTitle = (text) => {
    if (!text) return 'New Conversation';
    const clean = text.replace(/[\r\n]+/g, ' ').trim();
    return clean.length > 32 ? clean.slice(0, 32) + '...' : clean;
  };

  const handleNewSession = () => {
    const newSess = createNewSessionObject();
    setSessions((prev) => [newSess, ...prev]);
    setActiveSessionId(newSess.id);
  };

  const handleDeleteSession = (sessionId) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (filtered.length === 0) {
        const fresh = createNewSessionObject();
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === sessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleRenameSession = (sessionId, newTitle) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle, updatedAt: new Date().toISOString() } : s))
    );
  };

  const handleClearAllSessions = () => {
    const fresh = createNewSessionObject();
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
  };

  const handleSendMessage = async ({ text, attachments = [] }) => {
    if (!text && attachments.length === 0) return;

    let targetSessionId = activeSessionId;
    let currentSession = sessions.find((s) => s.id === targetSessionId);

    if (!currentSession) {
      const fresh = createNewSessionObject();
      targetSessionId = fresh.id;
      currentSession = fresh;
      setSessions((prev) => [fresh, ...prev]);
      setActiveSessionId(fresh.id);
    }

    const userMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text,
      attachments,
      timestamp: new Date().toISOString(),
    };

    const isFirstMessage = (currentSession.messages || []).length === 0;
    const newTitle = isFirstMessage ? generateTitle(text) : currentSession.title;

    // Append user message immediately
    const updatedMessages = [...(currentSession.messages || []), userMessage];

    setSessions((prev) =>
      prev.map((s) =>
        s.id === targetSessionId
          ? {
              ...s,
              title: newTitle,
              updatedAt: new Date().toISOString(),
              messages: updatedMessages,
            }
          : s
      )
    );

    setIsLoading(true);

    try {
      let botResponseText = '';
      let latencyMs = 0;
      let isDemo = false;

      const hasUrl = Boolean(config.webhookUrl && config.webhookUrl.trim());

      if (config.isDemoMode || !hasUrl) {
        isDemo = true;
        const startTime = performance.now();
        botResponseText = await getDemoResponse(text, targetSessionId, updatedMessages, config);
        latencyMs = Math.round(performance.now() - startTime);
      } else {
        const res = await sendN8nMessage({
          config,
          message: text,
          sessionId: targetSessionId,
          history: updatedMessages,
          attachments,
        });
        botResponseText = res.text;
        latencyMs = res.latencyMs;
      }

      const botMessage = {
        id: 'msg_bot_' + Date.now(),
        role: 'assistant',
        content: botResponseText,
        timestamp: new Date().toISOString(),
        latencyMs,
        isDemo,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? {
                ...s,
                updatedAt: new Date().toISOString(),
                messages: [...updatedMessages, botMessage],
              }
            : s
        )
      );
    } catch (error) {
      console.error('Error in chat exchange:', error);
      const errorMessage = {
        id: 'msg_err_' + Date.now(),
        role: 'assistant',
        content: `**Error communicating with n8n Webhook:**\n\n${error.message}\n\n*Tip: Check your Webhook URL in Settings (⚙️) or switch to Demo Mode.*`,
        timestamp: new Date().toISOString(),
        isError: true,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? {
                ...s,
                updatedAt: new Date().toISOString(),
                messages: [...updatedMessages, errorMessage],
              }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!activeSession || activeSession.messages.length === 0 || isLoading) return;

    // Find the last user message
    const msgs = [...activeSession.messages];
    const lastUserIdx = msgs.map((m) => m.role).lastIndexOf('user');
    if (lastUserIdx === -1) return;

    const lastUserMsg = msgs[lastUserIdx];
    // Remove all messages after the last user message
    const truncated = msgs.slice(0, lastUserIdx + 1);

    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, messages: truncated } : s))
    );

    setIsLoading(true);

    try {
      let botResponseText = '';
      let latencyMs = 0;
      let isDemo = false;
      const hasUrl = Boolean(config.webhookUrl && config.webhookUrl.trim());

      if (config.isDemoMode || !hasUrl) {
        isDemo = true;
        const startTime = performance.now();
        botResponseText = await getDemoResponse(lastUserMsg.content, activeSessionId, truncated, config);
        latencyMs = Math.round(performance.now() - startTime);
      } else {
        const res = await sendN8nMessage({
          config,
          message: lastUserMsg.content,
          sessionId: activeSessionId,
          history: truncated,
          attachments: lastUserMsg.attachments || [],
        });
        botResponseText = res.text;
        latencyMs = res.latencyMs;
      }

      const botMessage = {
        id: 'msg_bot_' + Date.now(),
        role: 'assistant',
        content: botResponseText,
        timestamp: new Date().toISOString(),
        latencyMs,
        isDemo,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...truncated, botMessage], updatedAt: new Date().toISOString() }
            : s
        )
      );
    } catch (error) {
      const errorMessage = {
        id: 'msg_err_' + Date.now(),
        role: 'assistant',
        content: `**Retry failed:** ${error.message}`,
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId ? { ...s, messages: [...truncated, errorMessage] } : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAndResend = (messageId, newContent) => {
    if (!activeSession) return;
    const msgIdx = activeSession.messages.findIndex((m) => m.id === messageId);
    if (msgIdx === -1) return;

    // Truncate to this message
    const kept = activeSession.messages.slice(0, msgIdx);
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, messages: kept } : s))
    );

    handleSendMessage({ text: newContent, attachments: [] });
  };

  const handleExportSession = (format) => {
    if (!activeSession || !activeSession.messages.length) return;

    let blob;
    let filename;

    if (format === 'json') {
      const exportData = {
        exportedAt: new Date().toISOString(),
        sessionId: activeSession.id,
        title: activeSession.title,
        messages: activeSession.messages,
      };
      blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      filename = `${activeSession.title.replace(/[^a-z0-9_-]/gi, '_')}.json`;
    } else {
      // Markdown
      let md = `# ${activeSession.title}\n\n`;
      md += `*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`;
      activeSession.messages.forEach((m) => {
        const sender = m.role === 'user' ? '👤 **User**' : '🤖 **ChatBord AI**';
        md += `### ${sender} (${new Date(m.timestamp).toLocaleTimeString()})\n\n`;
        md += `${m.content}\n\n---\n\n`;
      });
      blob = new Blob([md], { type: 'text/markdown' });
      filename = `${activeSession.title.replace(/[^a-z0-9_-]/gi, '_')}.md`;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentMessages = activeSession?.messages || [];

  return (
    <div className="app-layout">
      {/* Sidebar navigation */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onClearAllSessions={handleClearAllSessions}
        isOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenGuide={() => setGuideOpen(true)}
      />

      {/* Main Content Area */}
      <main className="main-content-area">
        <Header
          activeSession={activeSession}
          config={config}
          currentTheme={theme}
          onSelectTheme={setTheme}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenGuide={() => setGuideOpen(true)}
          onExportSession={handleExportSession}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

        {/* Chat Scroll Container */}
        <div className="chat-messages-viewport">
          <div className="chat-messages-container">
            {currentMessages.length === 0 ? (
              <StarterPrompts
                onSelectPrompt={(prompt) => handleSendMessage({ text: prompt })}
                config={config}
                onOpenSettings={() => setSettingsOpen(true)}
                onOpenGuide={() => setGuideOpen(true)}
              />
            ) : (
              currentMessages.map((msg, index) => {
                const isLastBot =
                  msg.role === 'assistant' &&
                  index === currentMessages.length - 1;

                return (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    isLastBotMessage={isLastBot}
                    isLoading={isLoading}
                    onRegenerate={handleRegenerate}
                    onEditAndResend={handleEditAndResend}
                  />
                );
              })
            )}

            {/* Loading / Typing indicator */}
            {isLoading && (
              <div className="message-row bot-row loading-row">
                <div className="message-container">
                  <div className="message-avatar bot-avatar">
                    <div className="avatar-bot-inner">
                      <div className="pulsing-spinner" />
                    </div>
                  </div>
                  <div className="message-content-wrapper">
                    <div className="message-header">
                      <span className="message-sender-name">ChatBord AI</span>
                      <span className="typing-status-text">
                        {config.isDemoMode ? 'Simulating agent response...' : 'Awaiting n8n webhook response...'}
                      </span>
                    </div>
                    <div className="message-bubble bot-bubble loading-bubble">
                      <div className="typing-dots">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} style={{ height: 1 }} />
          </div>
        </div>

        {/* Chat Input Floating Box */}
        <div className="chat-input-container">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onStopGeneration={() => setIsLoading(false)}
          />
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        config={config}
        onSaveConfig={setConfig}
      />

      {/* n8n Setup Guide Blueprint Modal */}
      <N8nGuideModal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
      />
    </div>
  );
}

export default App;

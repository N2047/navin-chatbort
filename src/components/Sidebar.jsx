import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  Workflow,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
  Settings,
  Database,
  Info,
} from 'lucide-react';

export const Sidebar = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  onClearAllSessions,
  isOpen,
  onToggleSidebar,
  onOpenSettings,
  onOpenGuide,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredSessions = sessions.filter((s) => {
    const titleMatch = (s.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const messageMatch = (s.messages || []).some((m) =>
      (m.content || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    return titleMatch || messageMatch;
  });

  const startEditing = (e, session) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title || 'Untitled Chat');
  };

  const saveEditing = (e, id) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEditing = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const formatSessionDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div className="sidebar-backdrop" onClick={onToggleSidebar} />
      )}

      <aside className={`sidebar-container ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand" onClick={onNewSession} title="ChatBord AI">
            <div className="sidebar-logo">
              <Sparkles size={18} className="logo-spark" />
            </div>
            <span className="sidebar-app-name">ChatBord AI</span>
          </div>

          <button
            onClick={onToggleSidebar}
            className="sidebar-toggle-btn"
            title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-label="Toggle sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="sidebar-new-chat-wrapper">
          <button
            onClick={onNewSession}
            className="btn-new-chat"
            title="Start new conversation"
          >
            <Plus size={18} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search filter */}
        <div className="sidebar-search">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search conversations..."
            className="search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="search-clear-btn"
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Conversation List */}
        <div className="sidebar-history-list">
          {filteredSessions.length === 0 ? (
            <div className="sidebar-empty">
              <MessageSquare size={24} className="empty-icon" />
              <p>{searchTerm ? 'No chats match your search.' : 'No conversations yet.'}</p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const isEdit = editingId === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`session-item ${isActive ? 'active-session' : ''}`}
                >
                  <MessageSquare size={16} className="session-icon" />

                  {isEdit ? (
                    <div className="session-edit-input-wrapper">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditing(e, session.id);
                          if (e.key === 'Escape') cancelEditing(e);
                        }}
                        autoFocus
                        className="session-rename-input"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={(e) => saveEditing(e, session.id)}
                        className="session-action-btn check-btn"
                        title="Save title"
                      >
                        <Check size={13} />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="session-action-btn cancel-btn"
                        title="Cancel"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="session-title-wrapper">
                        <span className="session-title" title={session.title}>
                          {session.title || 'Untitled Conversation'}
                        </span>
                        <span className="session-date">
                          {formatSessionDate(session.updatedAt || session.createdAt)}
                        </span>
                      </div>

                      <div className="session-actions">
                        <button
                          onClick={(e) => startEditing(e, session)}
                          className="session-action-btn"
                          title="Rename chat"
                          aria-label="Rename"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete this conversation?')) {
                              onDeleteSession(session.id);
                            }
                          }}
                          className="session-action-btn delete-btn"
                          title="Delete chat"
                          aria-label="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button onClick={onOpenGuide} className="sidebar-footer-btn">
            <Workflow size={16} className="btn-icon" />
            <span>n8n Workflow Guide</span>
          </button>

          <button onClick={onOpenSettings} className="sidebar-footer-btn">
            <Settings size={16} className="btn-icon" />
            <span>Webhook Settings</span>
          </button>

          {sessions.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all chat history?')) {
                  onClearAllSessions();
                }
              }}
              className="sidebar-footer-btn danger-btn"
            >
              <Trash2 size={16} className="btn-icon" />
              <span>Clear All History</span>
            </button>
          )}

          <div className="sidebar-storage-info">
            <span>{sessions.length} Saved {sessions.length === 1 ? 'Session' : 'Sessions'}</span>
            <span className="storage-dot">•</span>
            <span>localStorage Synced</span>
          </div>
        </div>
      </aside>
    </>
  );
};

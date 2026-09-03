import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Settings,
  Workflow,
  Download,
  Palette,
  Check,
  FileText,
  FileCode,
  Sparkles,
  Bot,
} from 'lucide-react';
import { THEMES } from '../constants';

export const Header = ({
  activeSession,
  config,
  currentTheme,
  onSelectTheme,
  onOpenSettings,
  onOpenGuide,
  onExportSession,
  onToggleSidebar,
  sidebarOpen,
}) => {
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const themeDropdownRef = useRef(null);
  const exportDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target)) {
        setThemeMenuOpen(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isConfigured = Boolean(config.webhookUrl && config.webhookUrl.trim());

  return (
    <header className="app-header glass-panel">
      <div className="header-left">
        {!sidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="header-icon-btn sidebar-trigger-btn"
            title="Open sidebar"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="header-chat-info">
          <h2 className="header-chat-title" title={activeSession?.title || 'Google Gemini Agent'}>
            {activeSession?.title || 'Google Gemini Agent'}
          </h2>
          <div className="header-badges">
            <div
              className="status-pill status-pill-live"
              onClick={onOpenSettings}
              style={{ cursor: 'pointer' }}
              title="Powered by Google Gemini n8n Agent"
            >
              <span className="pill-dot pill-dot-green" />
              <span>✨ Google Gemini Agent (/67c06fb2...)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="header-right">
        {/* n8n Workflow Guide Trigger */}
        <button
          onClick={onOpenGuide}
          className="header-action-btn guide-btn"
          title="Open Gemini n8n Blueprint"
        >
          <Workflow size={16} className="btn-icon" />
          <span className="btn-label">Gemini Blueprint</span>
        </button>

        {/* Export Chat Dropdown */}
        <div className="dropdown-wrapper" ref={exportDropdownRef}>
          <button
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            className="header-icon-btn"
            title="Export conversation logs"
            aria-label="Export chat"
            disabled={!activeSession?.messages?.length}
          >
            <Download size={18} />
          </button>

          {exportMenuOpen && (
            <div className="dropdown-menu export-menu glass-panel">
              <div className="dropdown-title">Export Log</div>
              <button
                onClick={() => {
                  onExportSession('markdown');
                  setExportMenuOpen(false);
                }}
                className="dropdown-item"
              >
                <FileText size={15} />
                <span>Export as Markdown (.md)</span>
              </button>
              <button
                onClick={() => {
                  onExportSession('json');
                  setExportMenuOpen(false);
                }}
                className="dropdown-item"
              >
                <FileCode size={15} />
                <span>Export as JSON (.json)</span>
              </button>
            </div>
          )}
        </div>

        {/* Theme Picker Dropdown */}
        <div className="dropdown-wrapper" ref={themeDropdownRef}>
          <button
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            className="header-icon-btn theme-picker-btn"
            title="Switch theme"
            aria-label="Themes"
          >
            <Palette size={18} />
          </button>

          {themeMenuOpen && (
            <div className="dropdown-menu theme-menu glass-panel">
              <div className="dropdown-title">Select Color Theme</div>
              {THEMES.map((theme) => {
                const isSelected = currentTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      onSelectTheme(theme.id);
                      setThemeMenuOpen(false);
                    }}
                    className={`dropdown-item theme-item ${isSelected ? 'theme-active' : ''}`}
                  >
                    <span
                      className="theme-color-dot"
                      style={{ backgroundColor: theme.color }}
                    />
                    <span className="theme-name">{theme.name}</span>
                    {isSelected && <Check size={14} className="theme-check text-success" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Settings Modal Button */}
        <button
          onClick={onOpenSettings}
          className={`header-icon-btn settings-btn ${!isConfigured ? 'settings-highlight' : ''}`}
          title="Gemini Agent & Webhook Settings"
          aria-label="Settings"
        >
          <Settings size={18} />
          {!isConfigured && <span className="settings-alert-dot" />}
        </button>
      </div>
    </header>
  );
};

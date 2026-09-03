import React from 'react';
import {
  Sparkles,
  Bot,
  Workflow,
  Code2,
  ArrowRight,
} from 'lucide-react';
import { STARTER_PROMPTS } from '../constants';

const ICON_MAP = {
  Sparkles: Sparkles,
  Workflow: Workflow,
  Bot: Bot,
  Code2: Code2,
};

export const StarterPrompts = ({ onSelectPrompt, config, onOpenSettings, onOpenGuide }) => {
  return (
    <div className="starter-container">
      {/* Hero Header */}
      <div className="starter-hero">
        <div className="starter-badge">
          <Sparkles size={14} className="sparkle-icon" />
          <span>Google Gemini n8n Agent Workflow</span>
        </div>

        <h1 className="starter-title">
          Chat with your <span className="gradient-text">Google Gemini</span> Agent
        </h1>

        <p className="starter-subtitle">
          Connected to your n8n LangChain Agent with <strong>Google Gemini Chat Model</strong> and <strong>Simple Memory Window Buffer</strong>.
        </p>

        {/* Quick status bar */}
        <div className="starter-status-pill">
          <div className="status-connected">
            <span className="dot dot-live" />
            <span>Target Webhook: <strong>/webhook/67c06fb2...</strong></span>
          </div>
          <button onClick={onOpenSettings} className="pill-link-btn">
            Configure URL
          </button>
          <button onClick={onOpenGuide} className="pill-guide-btn">
            <Workflow size={13} />
            <span>View Gemini Blueprint</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="starter-grid">
        {STARTER_PROMPTS.map((card) => {
          const IconComponent = ICON_MAP[card.icon] || Sparkles;
          return (
            <button
              key={card.id}
              onClick={() => onSelectPrompt(card.prompt)}
              className="starter-card"
            >
              <div className="card-top">
                <div className="card-icon-wrapper">
                  <IconComponent size={20} className="card-icon" />
                </div>
                <span className="card-badge">{card.badge}</span>
              </div>
              <h3 className="card-title">{card.title}</h3>
              <p className="card-desc">{card.description}</p>
              <div className="card-action">
                <span>Start prompt</span>
                <ArrowRight size={14} className="action-arrow" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

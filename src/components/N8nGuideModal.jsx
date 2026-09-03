import React, { useState } from 'react';
import {
  X,
  Workflow,
  Copy,
  Check,
  Bot,
  Layers,
  Sparkles,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { USER_GEMINI_WORKFLOW_TEMPLATE } from '../constants';
import { CodeBlock } from './CodeBlock';

export const N8nGuideModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('gemini');
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(USER_GEMINI_WORKFLOW_TEMPLATE, null, 2);

  const handleCopyWorkflow = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopiedWorkflow(true);
      setTimeout(() => setCopiedWorkflow(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card glass-panel n8n-guide-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge badge-guide">
              <Sparkles size={22} className="text-accent" />
            </div>
            <div>
              <h2 className="modal-title">Google Gemini Agent Workflow Hub</h2>
              <p className="modal-subtitle">n8n LangChain Agent with Google Gemini & Simple Memory</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close guide">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="modal-tabs">
          <button
            type="button"
            onClick={() => setActiveTab('gemini')}
            className={`tab-btn ${activeTab === 'gemini' ? 'tab-active' : ''}`}
          >
            <Bot size={15} />
            <span>Gemini Agent Blueprint</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tip')}
            className={`tab-btn ${activeTab === 'tip' ? 'tab-active' : ''}`}
          >
            <Zap size={15} />
            <span>Return Gemini Output Tip</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`tab-btn ${activeTab === 'manual' ? 'tab-active' : ''}`}
          >
            <Layers size={15} />
            <span>Architecture & CORS</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="modal-body guide-body">
          {activeTab === 'gemini' && (
            <>
              {/* Quick Copy Banner */}
              <div className="guide-banner glass-panel">
                <div className="banner-text">
                  <div className="banner-title-row">
                    <Sparkles size={16} className="text-accent" />
                    <h4>Your Google Gemini n8n Blueprint</h4>
                  </div>
                  <p>Webhook (Path: <code>67c06fb2-...</code>) → AI Agent (Google Gemini Chat Model + Simple Memory) → Respond - Ack.</p>
                </div>
                <button onClick={handleCopyWorkflow} className="btn-copy-template">
                  {copiedWorkflow ? (
                    <>
                      <Check size={16} className="text-success" />
                      <span>Copied Blueprint!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>Copy Workflow JSON</span>
                    </>
                  )}
                </button>
              </div>

              {/* Architecture Flow */}
              <div className="guide-section">
                <h3 className="section-title">
                  <Layers size={18} className="text-accent" />
                  <span>Workflow Architecture Flow</span>
                </h3>
                <div className="guide-steps-grid">
                  <div className="guide-step-card">
                    <div className="step-number">1</div>
                    <h4>Webhook Node</h4>
                    <p>Receives chat prompts from ChatBord at path <code>67c06fb2-3674-4f6f-b829-fb52d5ad30ff</code>.</p>
                    <div className="step-tag">POST /webhook</div>
                  </div>

                  <div className="guide-step-card">
                    <div className="step-number">2</div>
                    <h4>LangChain AI Agent</h4>
                    <p>Powered by <strong>Google Gemini Chat Model</strong> with <strong>Simple Memory</strong> for multi-turn chat history.</p>
                    <div className="step-tag">Google Gemini (PaLM)</div>
                  </div>

                  <div className="guide-step-card">
                    <div className="step-number">3</div>
                    <h4>Respond to Webhook</h4>
                    <p>Returns Gemini's response (or <code>EVENT_RECEIVED</code> acknowledgment) back to ChatBord.</p>
                    <div className="step-tag">Respond - Ack</div>
                  </div>
                </div>
              </div>

              {/* Blueprint Preview */}
              <div className="guide-section">
                <h3 className="section-title">Workflow JSON Preview</h3>
                <CodeBlock language="json">{jsonString}</CodeBlock>
              </div>
            </>
          )}

          {activeTab === 'tip' && (
            <div className="guide-section">
              <h3 className="section-title">How to Stream Live Gemini AI Answers</h3>
              <p className="card-desc">
                In your current n8n workflow, the <strong>Respond - Ack</strong> node returns the static text <code>"EVENT_RECEIVED"</code>.
              </p>

              <div className="guide-banner glass-panel">
                <div>
                  <h4>✨ Stream the actual Google Gemini response:</h4>
                  <p>In the n8n editor, click your <strong>Respond - Ack</strong> node and set <strong>Response Body</strong> to:</p>
                </div>
              </div>

              <CodeBlock language="javascript">{`={{ $json.output }}`}</CodeBlock>

              <p className="form-help">
                Once configured, ChatBord AI will render Gemini's full markdown output, code snippets, and reasoning instantly in real-time!
              </p>
            </div>
          )}

          {activeTab === 'manual' && (
            <>
              <div className="guide-section">
                <h3 className="section-title">Webhook Execution Details</h3>
                <ol className="manual-steps-list">
                  <li>
                    <strong>Path:</strong> <code>67c06fb2-3674-4f6f-b829-fb52d5ad30ff</code>
                  </li>
                  <li>
                    <strong>AI Model:</strong> Google Gemini Chat Model (PaLM Account)
                  </li>
                  <li>
                    <strong>Memory:</strong> Simple Memory Window Buffer
                  </li>
                </ol>
              </div>

              <div className="guide-alert-box">
                <ShieldAlert size={20} className="alert-icon" />
                <div className="alert-content">
                  <strong>Activation & CORS:</strong>
                  <p>
                    Make sure to toggle your workflow to <strong>Active (ON)</strong> in n8n and allow cross-origin requests (<code>Access-Control-Allow-Origin: *</code>) on your n8n domain or reverse proxy.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn-modal-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

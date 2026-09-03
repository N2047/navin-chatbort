import React, { useState } from 'react';
import {
  X,
  Settings,
  Globe,
  Key,
  Sliders,
  Sparkles,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Save,
  MessageSquare,
  Zap,
  Phone,
} from 'lucide-react';
import { testN8nPing } from '../services/n8nService';
import { DEFAULT_N8N_CONFIG } from '../constants';

export const SettingsModal = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [activeTab, setActiveTab] = useState('whatsapp');
  const [formData, setFormData] = useState({ ...config });
  const [pingState, setPingState] = useState({ loading: false, result: null });

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTestPing = async () => {
    setPingState({ loading: true, result: null });
    const res = await testN8nPing(formData);
    setPingState({ loading: false, result: res });
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveConfig(formData);
    onClose();
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all webhook configurations to defaults?')) {
      setFormData({ ...DEFAULT_N8N_CONFIG });
      setPingState({ loading: false, result: null });
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card glass-panel settings-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Settings size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="modal-title">n8n Webhook Configuration</h2>
              <p className="modal-subtitle">Configure WhatsApp Cloud Node & AI Webhook Pipelines</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close settings"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="modal-tabs">
          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`tab-btn ${activeTab === 'whatsapp' ? 'tab-active' : ''}`}
          >
            <MessageSquare size={15} />
            <span>WhatsApp Pipeline</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('webhook')}
            className={`tab-btn ${activeTab === 'webhook' ? 'tab-active' : ''}`}
          >
            <Globe size={15} />
            <span>Webhook Endpoints</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('auth')}
            className={`tab-btn ${activeTab === 'auth' ? 'tab-active' : ''}`}
          >
            <Key size={15} />
            <span>Authentication</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payload')}
            className={`tab-btn ${activeTab === 'payload' ? 'tab-active' : ''}`}
          >
            <Sliders size={15} />
            <span>Payload & Schema</span>
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSave} className="modal-body">
          {/* TAB: WHATSAPP CONFIGURATION */}
          {activeTab === 'whatsapp' && (
            <div className="tab-content">
              {/* WhatsApp Active Card */}
              <div className="setting-toggle-box">
                <div className="toggle-info">
                  <div className="toggle-label-row">
                    <MessageSquare size={16} className="text-success" />
                    <strong>WhatsApp Automation Mode Active</strong>
                  </div>
                  <p className="toggle-desc">
                    Directly triggers n8n WhatsApp node (Recipient: {formData.recipientPhoneNumber || '+9779827384434'}) and parses <code>EVENT_RECEIVED</code>.
                  </p>
                </div>
                <label className="switch-toggle">
                  <input
                    type="checkbox"
                    checked={formData.enableWhatsAppMode}
                    onChange={(e) => handleChange('enableWhatsAppMode', e.target.checked)}
                  />
                  <span className="slider round" />
                </label>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">
                    <span>Recipient Phone Number</span>
                    <span className="label-badge badge-primary">WhatsApp</span>
                  </label>
                  <input
                    type="text"
                    value={formData.recipientPhoneNumber}
                    onChange={(e) => handleChange('recipientPhoneNumber', e.target.value)}
                    placeholder="+9779827384434"
                    className="form-input font-mono"
                  />
                  <span className="form-help">Destination phone number with country code.</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Recipient Name</label>
                  <input
                    type="text"
                    value={formData.recipientName}
                    onChange={(e) => handleChange('recipientName', e.target.value)}
                    placeholder="Navin"
                    className="form-input"
                  />
                  <span className="form-help">Display name in chat UI.</span>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">WhatsApp Phone Number ID</label>
                  <input
                    type="text"
                    value={formData.phoneNumberId}
                    onChange={(e) => handleChange('phoneNumberId', e.target.value)}
                    placeholder="1334410283091340"
                    className="form-input font-mono"
                  />
                  <span className="form-help">Meta / WhatsApp Cloud API Sender ID.</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Webhook Path ID</label>
                  <input
                    type="text"
                    value={formData.webhookPath}
                    onChange={(e) => handleChange('webhookPath', e.target.value)}
                    placeholder="67c06fb2-3674-4f6f-b829-fb52d5ad30ff"
                    className="form-input font-mono"
                  />
                  <span className="form-help">n8n Webhook Node Path.</span>
                </div>
              </div>

              {/* Ping Test Box */}
              <div className="ping-test-card">
                <div className="ping-test-header">
                  <div>
                    <h4 className="ping-title">Test WhatsApp Webhook Dispatch</h4>
                    <p className="ping-desc">Sends a test payload to trigger the WhatsApp workflow.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestPing}
                    disabled={pingState.loading}
                    className="btn-ping"
                  >
                    {pingState.loading ? (
                      <span className="spinner-dots">Testing...</span>
                    ) : (
                      <>
                        <Play size={13} fill="currentColor" />
                        <span>Test Ping</span>
                      </>
                    )}
                  </button>
                </div>

                {pingState.result && (
                  <div className={`ping-result ${pingState.result.success ? 'ping-success' : 'ping-failure'}`}>
                    {pingState.result.success ? (
                      <div>
                        <div className="ping-status-row">
                          <CheckCircle2 size={16} className="text-success" />
                          <strong>Ack Received (HTTP {pingState.result.status})</strong>
                          <span className="ping-latency">
                            <Clock size={12} /> {pingState.result.latencyMs}ms
                          </span>
                        </div>
                        {pingState.result.preview && (
                          <div className="ping-preview">
                            <span className="preview-label">Response:</span> {pingState.result.preview}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="ping-status-row">
                        <AlertCircle size={16} className="text-danger" />
                        <div>
                          <strong>Connection Notice</strong>
                          <p className="ping-error-msg">{pingState.result.error}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: WEBHOOK URLS */}
          {activeTab === 'webhook' && (
            <div className="tab-content">
              <div className="setting-toggle-box">
                <div className="toggle-info">
                  <div className="toggle-label-row">
                    <Zap size={16} className="text-warning" />
                    <strong>Offline / Demo Simulation Mode</strong>
                  </div>
                  <p className="toggle-desc">
                    Simulate WhatsApp delivery & bot responses offline without live server.
                  </p>
                </div>
                <label className="switch-toggle">
                  <input
                    type="checkbox"
                    checked={formData.isDemoMode}
                    onChange={(e) => handleChange('isDemoMode', e.target.checked)}
                  />
                  <span className="slider round" />
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Full Webhook URL</span>
                  <span className="label-badge badge-primary">POST</span>
                </label>
                <input
                  type="url"
                  value={formData.webhookUrl}
                  onChange={(e) => handleChange('webhookUrl', e.target.value)}
                  placeholder="https://n8n.yourdomain.com/webhook/67c06fb2-3674-4f6f-b829-fb52d5ad30ff"
                  className="form-input"
                />
                <span className="form-help">
                  Paste your full production webhook URL from n8n.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Test Webhook URL (Editor Listen Mode)</span>
                  <span className="label-badge badge-secondary">Test</span>
                </label>
                <input
                  type="url"
                  value={formData.testWebhookUrl}
                  onChange={(e) => handleChange('testWebhookUrl', e.target.value)}
                  placeholder="https://n8n.yourdomain.com/webhook-test/67c06fb2-3674-4f6f-b829-fb52d5ad30ff"
                  className="form-input"
                />
              </div>

              <div className="form-checkbox-row">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={formData.useTestWebhook}
                    onChange={(e) => handleChange('useTestWebhook', e.target.checked)}
                  />
                  <span className="checkmark" />
                  <span>Route traffic to Test Webhook URL</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB: AUTHENTICATION */}
          {activeTab === 'auth' && (
            <div className="tab-content">
              <div className="form-group">
                <label className="form-label">Authentication Method</label>
                <div className="auth-options-grid">
                  {[
                    { id: 'none', label: 'None / Public' },
                    { id: 'bearer', label: 'Bearer Token' },
                    { id: 'header', label: 'API Key (Header)' },
                    { id: 'basic', label: 'Basic Auth' },
                  ].map((auth) => (
                    <label
                      key={auth.id}
                      className={`auth-card ${formData.authType === auth.id ? 'auth-card-selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="authType"
                        value={auth.id}
                        checked={formData.authType === auth.id}
                        onChange={() => handleChange('authType', auth.id)}
                      />
                      <span>{auth.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formData.authType === 'bearer' && (
                <div className="form-group">
                  <label className="form-label">Bearer Token</label>
                  <input
                    type="password"
                    value={formData.bearerToken}
                    onChange={(e) => handleChange('bearerToken', e.target.value)}
                    placeholder="Bearer token..."
                    className="form-input font-mono"
                  />
                </div>
              )}

              {formData.authType === 'header' && (
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Header Name</label>
                    <input
                      type="text"
                      value={formData.apiKeyHeader}
                      onChange={(e) => handleChange('apiKeyHeader', e.target.value)}
                      placeholder="X-API-KEY"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Header Value</label>
                    <input
                      type="password"
                      value={formData.apiKeyValue}
                      onChange={(e) => handleChange('apiKeyValue', e.target.value)}
                      placeholder="key_value"
                      className="form-input font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: PAYLOAD & SCHEMA */}
          {activeTab === 'payload' && (
            <div className="tab-content">
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">User Input Key</label>
                  <input
                    type="text"
                    value={formData.inputField}
                    onChange={(e) => handleChange('inputField', e.target.value)}
                    placeholder="chatInput"
                    className="form-input font-mono"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Session ID Key</label>
                  <input
                    type="text"
                    value={formData.sessionIdField}
                    onChange={(e) => handleChange('sessionIdField', e.target.value)}
                    placeholder="sessionId"
                    className="form-input font-mono"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Response Text Key Extraction</label>
                <select
                  value={formData.responsePath}
                  onChange={(e) => handleChange('responsePath', e.target.value)}
                  className="form-select"
                >
                  <option value="auto">Auto-detect (output, text, EVENT_RECEIVED)</option>
                  <option value="output">output</option>
                  <option value="text">text</option>
                  <option value="response">response</option>
                </select>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="btn-modal-secondary btn-reset"
              title="Reset all settings to default"
            >
              <RotateCcw size={14} />
              <span>Defaults</span>
            </button>

            <div className="modal-footer-right">
              <button
                type="button"
                onClick={onClose}
                className="btn-modal-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-modal-primary"
              >
                <Save size={15} />
                <span>Save Configuration</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

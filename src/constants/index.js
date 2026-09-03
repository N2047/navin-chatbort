export const THEMES = [
  { id: 'nebula', name: 'Midnight Nebula', icon: 'Sparkles', color: '#8b5cf6' },
  { id: 'obsidian', name: 'Deep Obsidian', icon: 'Moon', color: '#38bdf8' },
  { id: 'cyberpunk', name: 'Cyber Neon', icon: 'Zap', color: '#ec4899' },
  { id: 'aurora', name: 'Emerald Aurora', icon: 'Flame', color: '#10b981' },
  { id: 'light', name: 'Frost Daylight', icon: 'Sun', color: '#6366f1' },
];

export const DEFAULT_N8N_CONFIG = {
  // Pre-configured to local n8n instance and your webhook path
  webhookUrl: 'http://localhost:5678/webhook/67c06fb2-3674-4f6f-b829-fb52d5ad30ff',
  testWebhookUrl: 'http://localhost:5678/webhook-test/67c06fb2-3674-4f6f-b829-fb52d5ad30ff',
  webhookPath: '67c06fb2-3674-4f6f-b829-fb52d5ad30ff',
  useTestWebhook: false,
  method: 'POST',
  authType: 'none', // 'none' | 'bearer' | 'header' | 'basic'
  bearerToken: '',
  apiKeyHeader: 'X-API-KEY',
  apiKeyValue: '',
  basicUser: '',
  basicPassword: '',

  // AI Model info
  aiModelName: 'Google Gemini',
  engineType: 'gemini-agent',

  // Mapping
  inputField: 'chatInput', // field name sent in payload
  sessionIdField: 'sessionId',
  includeHistory: true,
  historyField: 'history',
  maxHistoryMessages: 10,
  systemPrompt: 'You are ChatBord AI powered by Google Gemini and n8n LangChain agent.',
  customHeaders: [],

  // Response extraction
  responsePath: 'auto',
  timeoutMs: 45000,
  isDemoMode: false,
};

export const STARTER_PROMPTS = [
  {
    id: 'gemini-nepali',
    category: 'Nepali Chat',
    icon: 'Sparkles',
    title: 'नेपालीमा कुराकानी',
    description: 'नेपाली भाषामा प्रश्न सोध्नुहोस् र जवाफ पाउनुहोस्।',
    prompt: 'नमस्ते! मलाई नेपालको बारेमा केही रोचक जानकारी देऊ।',
    badge: 'नेपाली',
  },
  {
    id: 'gemini-reasoning',
    category: 'Gemini AI',
    icon: 'Sparkles',
    title: 'Google Gemini Deep Analysis',
    description: 'Ask complex reasoning, coding, or science questions.',
    prompt: 'Can you explain how Google Gemini multimodal reasoning works and give an example in Python?',
    badge: 'Gemini',
  },
  {
    id: 'workflow-output-tip',
    category: 'n8n Guide',
    icon: 'Workflow',
    title: 'n8n Live Response Setup',
    description: 'How to stream Gemini output directly to ChatBord.',
    prompt: 'How do I set the n8n Respond to Webhook node to return dynamic Gemini output ($json.output)?',
    badge: 'n8n',
  },
  {
    id: 'code-gen',
    category: 'Development',
    icon: 'Code2',
    title: 'Code Generation & Review',
    description: 'Write JavaScript, React, or Python scripts.',
    prompt: 'Create a JavaScript async function to call an n8n webhook and handle response status.',
    badge: 'Coding',
  },
];

export const USER_GEMINI_WORKFLOW_TEMPLATE = {
  name: "ChatBord AI - Google Gemini Agent Workflow",
  nodes: [
    {
      parameters: {
        path: "67c06fb2-3674-4f6f-b829-fb52d5ad30ff",
        responseMode: "responseNode",
        options: {}
      },
      type: "n8n-nodes-base.webhook",
      typeVersion: 2.1,
      position: [
        -192,
        0
      ],
      id: "afd4eb58-4f9d-46b1-bdd7-f7244f242921",
      name: "Webhook",
      webhookId: "67c06fb2-3674-4f6f-b829-fb52d5ad30ff"
    },
    {
      parameters: {
        respondWith: "text",
        responseBody: "={{ $json.output || 'EVENT_RECEIVED' }}",
        options: {
          responseCode: 200
        }
      },
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1.1,
      position: [
        336,
        0
      ],
      id: "982c3058-53d0-40a4-93da-ebdc12ee6da6",
      name: "Respond - Ack"
    },
    {
      parameters: {
        promptType: "define",
        text: "={{ $json.body.chatInput || $json.body.message || $json.body.text || $json.query.chatInput || $json.query.message }}",
        options: {
          systemMessage: "You are ChatBord AI, powered by Google Gemini. Answer every question uniquely, clearly, and concisely in markdown format with code blocks where appropriate."
        }
      },
      type: "@n8n/n8n-nodes-langchain.agent",
      typeVersion: 3.1,
      position: [
        32,
        0
      ],
      id: "bfddeaaa-3a27-4673-a6de-0091038cb7cb",
      name: "AI Agent"
    },
    {
      parameters: {
        options: {}
      },
      type: "@n8n/n8n-nodes-langchain.lmChatGoogleGemini",
      typeVersion: 1.1,
      position: [
        -112,
        121
      ],
      id: "a25fbbe6-45ab-40c5-ae7a-17d91c3b5b04",
      name: "Google Gemini Chat Model",
      credentials: {
        googlePalmApi: {
          id: "TUtGlQoFEWKtLhZk",
          name: "Google Gemini(PaLM) Api account"
        }
      }
    },
    {
      parameters: {
        sessionKey: "={{ $json.body.sessionId || 'default-session' }}"
      },
      type: "@n8n/n8n-nodes-langchain.memoryBufferWindow",
      typeVersion: 1.4,
      position: [
        48,
        121
      ],
      id: "6a8776ba-f77b-45d2-bf48-71042651bf17",
      name: "Simple Memory"
    }
  ],
  connections: {
    "Webhook": {
      main: [
        [
          {
            node: "AI Agent",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "AI Agent": {
      main: [
        [
          {
            node: "Respond - Ack",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Google Gemini Chat Model": {
      ai_languageModel: [
        [
          {
            node: "AI Agent",
            type: "ai_languageModel",
            index: 0
          }
        ]
      ]
    },
    "Simple Memory": {
      ai_memory: [
        [
          {
            "node": "AI Agent",
            "type": "ai_memory",
            "index": 0
          }
        ]
      ]
    }
  },
  pinData: {},
  meta: {
    templateCredsSetupCompleted: true,
    instanceId: "2b0c50703d07849639aecb600861f8608f9b4f59f108789bb351acf9b971603a"
  }
};

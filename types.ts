/**
 * Myanmar AI Business Advisor - Type Definitions
 * Production-ready types for the financial AI platform
 */

// ============ ENUMS ============

export enum Sender {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system'
}

export enum ModelProvider {
  GROQ = 'Groq (Llama 3.3)',
  GEMINI = 'Gemini 2.5 Flash',
  LOGIC = 'Logic Engine',
  SYSTEM = 'System'
}

export enum MessageType {
  TEXT = 'text',
  ANALYSIS = 'analysis',
  ERROR = 'error',
  INFO = 'info'
}

export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CHECKING = 'checking',
  ERROR = 'error'
}

export enum NavSection {
  CHAT = 'chat',
  ANALYTICS = 'analytics',
  KNOWLEDGE = 'knowledge',
  DATA = 'data',
  SETTINGS = 'settings'
}

// ============ INTERFACES ============

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  provider?: ModelProvider;
  type?: MessageType;
  isThinking?: boolean;
  image?: string;
  analysisResult?: AnalysisMessageData;
  citations?: Citation[];
  language?: 'my' | 'en' | 'mixed';
}

export interface AnalysisMessageData {
  type: string;
  calculations: CalculationDisplay[];
  summary: string;
  assumptions?: string[];
  trend?: 'up' | 'down' | 'stable';
}

export interface CalculationDisplay {
  label: string;
  value: string | number;
  format?: 'currency' | 'percentage' | 'number';
  trend?: 'up' | 'down' | 'stable';
  breakdown?: Record<string, string | number>;
}

export interface Citation {
  title: string;
  source: string;
  relevance: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  deepThinkMode: boolean;
  currentSection: NavSection;
}

export interface RagDocument {
  id?: string;
  title: string;
  content: string;
  relevance: number;
  metadata?: Record<string, any>;
}

// ============ REQUEST/RESPONSE ============

export interface RouterRequest {
  message: string;
  history: Message[];
  useComplexModel: boolean;
  image?: string;
  language?: 'my' | 'en';
}

export interface RouterResponse {
  text: string;
  provider: ModelProvider;
  analysisResult?: AnalysisMessageData;
  citations?: Citation[];
  processingTime?: number;
}

// ============ SYSTEM STATUS ============

export interface SystemStatus {
  groq: ConnectionStatus;
  gemini: ConnectionStatus;
  vectorDb: ConnectionStatus;
  lastChecked: Date;
}

// ============ ADMIN PORTAL ============

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  status: 'pending' | 'processing' | 'indexed' | 'failed';
  chunkCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatasetSchema {
  id: string;
  name: string;
  fields: SchemaField[];
  tags: string[];
  createdAt: Date;
}

export interface SchemaField {
  name: string;
  type: 'number' | 'string' | 'date' | 'boolean';
  required: boolean;
  description?: string;
}

export interface FinancialDataset {
  id: string;
  name: string;
  schemaId: string;
  data: Record<string, any>[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============ CONVERSATION HISTORY ============

export interface Conversation {
  id: string;
  title: string;
  preview: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// ============ USER PREFERENCES ============

export interface UserPreferences {
  language: 'my' | 'en';
  deepThinkDefault: boolean;
  theme: 'dark'; // Only dark theme supported
  notifications: boolean;
}

// ============ ANALYTICS ============

export interface AnalyticsData {
  totalQueries: number;
  analysisQueries: number;
  knowledgeQueries: number;
  avgResponseTime: number;
  topCategories: { name: string; count: number }[];
}

// ============ COMPONENT PROPS ============

export interface SidebarProps {
  currentSection: NavSection;
  onNavigate: (section: NavSection) => void;
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  systemStatus: SystemStatus;
}

export interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string, image?: string) => void;
  deepThinkMode: boolean;
  onToggleDeepThink: () => void;
}

export interface StatusBarProps {
  status: SystemStatus;
  deepThinkMode: boolean;
  onToggleDeepThink: () => void;
}

export interface MessageProps {
  message: Message;
}

export interface AnalysisCardProps {
  data: AnalysisMessageData;
}

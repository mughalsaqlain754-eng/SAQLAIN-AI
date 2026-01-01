export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  attachments?: Attachment[];
  isError?: boolean;
  sources?: { uri: string; title: string }[];
}

export interface Attachment {
  mimeType: string;
  data: string; // Base64
  name?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  messages: Message[];
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isSidebarOpen: boolean;
}

export interface SystemConfig {
  voiceMode: boolean; // Silent mode default
}
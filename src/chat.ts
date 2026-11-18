export type PresetRoleId = 'general' | 'student' | 'teacher' | 'businessman' | 'data-analyst';
export type RoleId = PresetRoleId | 'custom';

export type DepthLevel = 'simple' | 'intermediate' | 'deep-expert';

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  sources?: GroundingSource[];
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  roleId: RoleId;
  customRoleName?: string;
  depthLevel: DepthLevel;
  hinglishMode: boolean;
  adaptiveFormat: boolean;
  activeFormatId?: string | null;
  activeFormatLabel?: string;
  activeFormatInstruction?: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface OutputFormatOption {
  id: string;
  label: string;
  description: string;
  instruction: string;
}

export interface CustomFormat {
  id: string;
  roleId: RoleId;
  label: string;
  instruction: string;
  createdAt: number;
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  instruction: string;
  starterTemplate: string;
}

export interface CustomShortcut {
  id: string;
  roleId: RoleId;
  label: string;
  instruction: string;
  createdAt: number;
}

export interface CustomRoleEntry {
  id: string;
  name: string;
  createdAt: number;
}

export type ModelOptionId =
  | 'gemini-2.5-flash'
  | 'gemini-2.5-flash-lite'
  | 'gemini-pro'
  | 'gemini-4-hydrogen';

export interface ModelOption {
  id: ModelOptionId;
  label: string;
  shortLabel: string;
  tier: 'free' | 'pro';
  emoji: string;
  subtitle: string;
}

export interface RoleDefinition {
  id: RoleId;
  label: string;
  emoji: string;
  shortDesc: string;
  adaptiveToggleLabel: string;
  adaptiveToggleDesc: string;
  outputFormats: OutputFormatOption[];
  quickActions: QuickAction[];
}

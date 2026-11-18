import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowUp,
  ChevronDown,
  KeyRound,
  Menu,
  Moon,
  ShieldCheck,
  Sparkles,
  Square,
  Sun,
} from 'lucide-react';
import {
  DEPTH_LEVELS,
  ROLE_DEFINITIONS,
  getRoleDisplayName,
  getRoleEmoji,
} from './config/roles';
import { DEFAULT_MODEL_ID, getModelOption } from './config/models';
import type {
  ChatMessage as ChatMessageType,
  ChatSession,
  CustomFormat,
  CustomRoleEntry,
  CustomShortcut,
  DepthLevel,
  GroundingSource,
  ModelOptionId,
  OutputFormatOption,
  PresetRoleId,
  QuickAction,
  RoleId,
} from './types/chat';
import { LeftSidebar } from './components/LeftSidebar';
import { QuickActionsDrawer } from './components/QuickActionsDrawer';
import { DepthDropdown } from './components/DepthDropdown';
import { RoleDropdown } from './components/RoleDropdown';
import { ChatMessage } from './components/ChatMessage';
import { ApiKeyModal } from './components/ApiKeyModal';
import { CustomRoleModal } from './components/CustomRoleModal';
import { ModelSelector } from './components/ModelSelector';
import { UpgradeProModal } from './components/UpgradeProModal';

const STORAGE_KEYS = {
  SESSIONS: 'veritas_ai_sessions_v1',
  ACTIVE_ID: 'veritas_ai_active_session_v1',
  THEME: 'veritas_ai_theme_v1',
  CUSTOM_API_KEY: 'veritas_ai_custom_key_v1',
  WEB_SEARCH: 'veritas_ai_web_search_v1',
  ANTI_HALLUCINATION: 'veritas_ai_anti_hallucination_v1',
  IS_PRO: 'veritas_ai_pro_unlocked_v1',
  SELECTED_MODEL: 'veritas_ai_selected_model_v1',
  CUSTOM_SHORTCUTS: 'veritas_ai_custom_shortcuts_v1',
  CUSTOM_FORMATS: 'veritas_ai_custom_formats_v1',
  CUSTOM_ROLES: 'veritas_ai_custom_roles_v1',
};

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createSession(
  roleId: RoleId = 'general',
  customRoleName?: string,
  depthLevel: DepthLevel = 'intermediate',
  hinglishMode = false
): ChatSession {
  const now = Date.now();
  const displayName = getRoleDisplayName(roleId, customRoleName);
  return {
    id: generateId(),
    title: `New ${displayName} Chat`,
    roleId,
    customRoleName: roleId === 'custom' ? customRoleName : undefined,
    depthLevel,
    hinglishMode,
    adaptiveFormat: false,
    activeFormatId: null,
    activeFormatLabel: undefined,
    activeFormatInstruction: undefined,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

function cleanMarkdownForSpeech(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' Code block omitted. ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~>-]/g, ' ')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function deriveChatTitle(prompt: string): string {
  const cleaned = prompt.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= 44) return cleaned;
  return `${cleaned.slice(0, 44)}...`;
}

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // Ignore storage read failure
    }
    return 'dark';
  });

  // Sessions state (defaults to General (Default) role)
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatSession[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback to fresh General session
    }
    return [createSession('general')];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
      if (savedId) return savedId;
    } catch {
      // Ignore
    }
    return '';
  });

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) ?? sessions[0];
  }, [sessions, activeSessionId]);

  useEffect(() => {
    if (activeSession && activeSession.id !== activeSessionId) {
      setActiveSessionId(activeSession.id);
    }
  }, [activeSession, activeSessionId]);

  // Web search OFF by default
  const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WEB_SEARCH);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // Anti-Hallucination ON by default
  const [antiHallucinationEnabled, setAntiHallucinationEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ANTI_HALLUCINATION);
      if (saved === 'false') return false;
    } catch {
      // Ignore
    }
    return true;
  });

  // Custom API key in localStorage
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CUSTOM_API_KEY) || '';
    } catch {
      return '';
    }
  });

  // Freemium Subscription & Model Selection
  const [isPro, setIsPro] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.IS_PRO) === 'true';
    } catch {
      return false;
    }
  });

  const [selectedModel, setSelectedModel] = useState<ModelOptionId>(() => {
    try {
      const savedModel = localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL) as ModelOptionId | null;
      const savedPro = localStorage.getItem(STORAGE_KEYS.IS_PRO) === 'true';
      if (savedModel) {
        const opt = getModelOption(savedModel);
        if (opt.tier === 'free' || savedPro) {
          return opt.id;
        }
      }
    } catch {
      // Ignore
    }
    return DEFAULT_MODEL_ID;
  });

  // User-created Custom Roles, Custom Formats, and Custom Prompts in localStorage
  const [customRoles, setCustomRoles] = useState<CustomRoleEntry[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_ROLES);
      if (raw) {
        const parsed = JSON.parse(raw) as CustomRoleEntry[];
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore
    }
    return [];
  });

  const [customFormats, setCustomFormats] = useState<CustomFormat[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_FORMATS);
      if (raw) {
        const parsed = JSON.parse(raw) as CustomFormat[];
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore
    }
    return [];
  });

  const [customShortcuts, setCustomShortcuts] = useState<CustomShortcut[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_SHORTCUTS);
      if (raw) {
        const parsed = JSON.parse(raw) as CustomShortcut[];
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore
    }
    return [];
  });

  // UI & Interaction states
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeModelName, setActiveModelName] = useState<string>(DEFAULT_MODEL_ID);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isCustomRoleModalOpen, setIsCustomRoleModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [pendingProModel, setPendingProModel] = useState<ModelOptionId | null>(null);
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_ROLES, JSON.stringify(customRoles));
    } catch {
      // Ignore
    }
  }, [customRoles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_FORMATS, JSON.stringify(customFormats));
    } catch {
      // Ignore
    }
  }, [customFormats]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_SHORTCUTS, JSON.stringify(customShortcuts));
    } catch {
      // Ignore
    }
  }, [customShortcuts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.IS_PRO, String(isPro));
    } catch {
      // Ignore
    }
  }, [isPro]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, selectedModel);
    } catch {
      // Ignore
    }
    setActiveModelName(selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch {
      // Ignore
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch {
      // Ignore
    }
  }, [sessions]);

  useEffect(() => {
    if (activeSession?.id) {
      try {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, activeSession.id);
      } catch {
        // Ignore
      }
    }
  }, [activeSession?.id]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WEB_SEARCH, String(webSearchEnabled));
    } catch {
      // Ignore
    }
  }, [webSearchEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ANTI_HALLUCINATION, String(antiHallucinationEnabled));
    } catch {
      // Ignore
    }
  }, [antiHallucinationEnabled]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: isStreaming ? 'auto' : 'smooth' });
  }, [activeSession?.messages, isStreaming]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [inputValue]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
  }, []);

  const handleToggleSpeak = useCallback(
    (messageId: string, text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }
      if (speakingMessageId === messageId) {
        stopSpeech();
        return;
      }
      window.speechSynthesis.cancel();
      const spokenText = cleanMarkdownForSpeech(text);
      if (!spokenText) return;

      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.rate = 1.02;
      utterance.onend = () => setSpeakingMessageId(null);
      utterance.onerror = () => setSpeakingMessageId(null);
      setSpeakingMessageId(messageId);
      window.speechSynthesis.speak(utterance);
    },
    [speakingMessageId, stopSpeech]
  );

  const updateActiveSession = useCallback(
    (updater: (session: ChatSession) => ChatSession) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSession.id ? updater(s) : s))
      );
    },
    [activeSession?.id]
  );

  // New Chat with current role
  const handleNewChat = useCallback(() => {
    if (isStreaming) return;
    stopSpeech();
    const fresh = createSession(
      activeSession.roleId,
      activeSession.customRoleName,
      activeSession.depthLevel,
      activeSession.hinglishMode
    );
    setSessions((prev) => [fresh, ...prev]);
    setActiveSessionId(fresh.id);
    setInputValue('');
  }, [activeSession, isStreaming, stopSpeech]);

  // Preset Role selection
  const handleSelectPresetRole = useCallback(
    (roleId: PresetRoleId) => {
      if (isStreaming) return;
      stopSpeech();

      if (activeSession.messages.length > 0) {
        const fresh = createSession(
          roleId,
          undefined,
          activeSession.depthLevel,
          activeSession.hinglishMode
        );
        setSessions((prev) => [fresh, ...prev]);
        setActiveSessionId(fresh.id);
      } else {
        const displayName = getRoleDisplayName(roleId);
        updateActiveSession((s) => ({
          ...s,
          roleId,
          customRoleName: undefined,
          adaptiveFormat: false,
          activeFormatId: null,
          activeFormatLabel: undefined,
          activeFormatInstruction: undefined,
          title: `New ${displayName} Chat`,
          updatedAt: Date.now(),
        }));
      }
    },
    [activeSession, isStreaming, stopSpeech, updateActiveSession]
  );

  // Select or create Custom Role (persisted in localStorage)
  const handleApplyCustomRole = useCallback(
    (roleName: string) => {
      if (isStreaming) return;
      const trimmed = roleName.trim();
      if (!trimmed) return;
      stopSpeech();

      setCustomRoles((prev) => {
        const exists = prev.some(
          (r) => r.name.toLowerCase() === trimmed.toLowerCase()
        );
        if (exists) return prev;
        return [
          ...prev,
          { id: generateId(), name: trimmed, createdAt: Date.now() },
        ];
      });

      if (activeSession.messages.length > 0) {
        const fresh = createSession(
          'custom',
          trimmed,
          activeSession.depthLevel,
          activeSession.hinglishMode
        );
        setSessions((prev) => [fresh, ...prev]);
        setActiveSessionId(fresh.id);
      } else {
        updateActiveSession((s) => ({
          ...s,
          roleId: 'custom',
          customRoleName: trimmed,
          adaptiveFormat: false,
          activeFormatId: null,
          activeFormatLabel: undefined,
          activeFormatInstruction: undefined,
          title: `New ${trimmed} Chat`,
          updatedAt: Date.now(),
        }));
      }
    },
    [activeSession, isStreaming, stopSpeech, updateActiveSession]
  );

  const handleDeleteCustomRole = useCallback((id: string) => {
    setCustomRoles((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleToggleOutputFormat = useCallback(
    (format: OutputFormatOption) => {
      updateActiveSession((s) => {
        const isAlreadyActive = s.activeFormatId === format.id;
        if (isAlreadyActive) {
          return {
            ...s,
            adaptiveFormat: false,
            activeFormatId: null,
            activeFormatLabel: undefined,
            activeFormatInstruction: undefined,
          };
        }
        return {
          ...s,
          adaptiveFormat: true,
          activeFormatId: format.id,
          activeFormatLabel: format.label,
          activeFormatInstruction: format.instruction,
        };
      });
    },
    [updateActiveSession]
  );

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      if (isStreaming) return;
      stopSpeech();
      setActiveSessionId(sessionId);
    },
    [isStreaming, stopSpeech]
  );

  const handleDeleteSession = useCallback(
    (sessionId: string) => {
      if (isStreaming && sessionId === activeSession.id) return;
      stopSpeech();
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== sessionId);
        if (filtered.length === 0) {
          const fresh = createSession(
            'general',
            undefined,
            activeSession.depthLevel,
            activeSession.hinglishMode
          );
          setActiveSessionId(fresh.id);
          return [fresh];
        }
        if (sessionId === activeSession.id) {
          setActiveSessionId(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeSession, isStreaming, stopSpeech]
  );

  const handleClearHistory = useCallback(() => {
    if (isStreaming) return;
    stopSpeech();
    const fresh = createSession(
      'general',
      undefined,
      activeSession.depthLevel,
      activeSession.hinglishMode
    );
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
  }, [activeSession, isStreaming, stopSpeech]);

  const handleSaveApiKey = useCallback((newKey: string) => {
    setCustomApiKey(newKey);
    try {
      if (newKey) {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_API_KEY, newKey);
      } else {
        localStorage.removeItem(STORAGE_KEYS.CUSTOM_API_KEY);
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleClearApiKey = useCallback(() => {
    setCustomApiKey('');
    try {
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_API_KEY);
    } catch {
      // Ignore
    }
  }, []);

  // Core send message function
  const sendMessage = useCallback(
    async (rawText: string) => {
      const prompt = rawText.trim();
      if (!prompt || isStreaming || !activeSession) return;

      stopSpeech();

      const userMessage: ChatMessageType = {
        id: generateId(),
        role: 'user',
        content: prompt,
        createdAt: Date.now(),
      };

      const assistantId = generateId();
      const assistantPlaceholder: ChatMessageType = {
        id: assistantId,
        role: 'assistant',
        content: '',
        createdAt: Date.now(),
      };

      const targetSessionId = activeSession.id;
      const priorHistory = activeSession.messages
        .filter((m) => !m.isError && m.content.trim().length > 0)
        .map((m) => ({ role: m.role, content: m.content }));

      const updatedHistoryForApi = [...priorHistory, { role: 'user' as const, content: prompt }];

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== targetSessionId) return s;
          const isFirstMessage = s.messages.length === 0;
          return {
            ...s,
            title: isFirstMessage ? deriveChatTitle(prompt) : s.title,
            messages: [...s.messages, userMessage, assistantPlaceholder],
            updatedAt: Date.now(),
          };
        })
      );

      setInputValue('');
      setIsStreaming(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (customApiKey.trim()) {
          headers['x-gemini-api-key'] = customApiKey.trim();
        }

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers,
          signal: controller.signal,
          body: JSON.stringify({
            messages: updatedHistoryForApi,
            roleId: activeSession.roleId,
            customRoleName: activeSession.customRoleName,
            depthLevel: activeSession.depthLevel,
            hinglishMode: activeSession.hinglishMode,
            adaptiveFormat: activeSession.adaptiveFormat,
            activeFormatLabel: activeSession.activeFormatLabel,
            activeFormatInstruction: activeSession.activeFormatInstruction,
            webSearchEnabled,
            antiHallucinationEnabled,
            selectedModel,
          }),
        });

        if (!response.ok) {
          let friendlyError = 'Unable to reach Gemini right now. Please try again.';
          try {
            const errJson = (await response.json()) as { error?: string; rawError?: string };
            console.error(
              '[Veritas AI] Raw Gemini API Error (HTTP ' + response.status + '):',
              errJson.rawError ?? errJson.error ?? errJson
            );
            if (response.status === 429) {
              friendlyError = 'Server is busy right now, please wait 10 seconds and try again.';
            } else if (errJson?.error) {
              friendlyError = errJson.error;
            }
          } catch (parseErr) {
            console.error('[Veritas AI] Raw HTTP Error (' + response.status + '):', parseErr);
            if (response.status === 429) {
              friendlyError = 'Server is busy right now, please wait 10 seconds and try again.';
            }
          }

          setSessions((prev) =>
            prev.map((s) =>
              s.id !== targetSessionId
                ? s
                : {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantId
                        ? { ...m, content: friendlyError, isError: true }
                        : m
                    ),
                    updatedAt: Date.now(),
                  }
            )
          );
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response stream available');
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let accumulatedText = '';
        let collectedSources: GroundingSource[] | undefined;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() ?? '';

          for (const block of lines) {
            const dataLine = block
              .split('\n')
              .find((l) => l.startsWith('data: '));
            if (!dataLine) continue;

            try {
              const event = JSON.parse(dataLine.slice(6)) as {
                type: 'chunk' | 'grounding' | 'done' | 'error';
                text?: string;
                sources?: GroundingSource[];
                message?: string;
                rawError?: string;
                fallbackWarnings?: string[];
                model?: string;
                status?: number;
              };

              if (event.type === 'chunk' && event.text) {
                accumulatedText += event.text;
                setSessions((prev) =>
                  prev.map((s) =>
                    s.id !== targetSessionId
                      ? s
                      : {
                          ...s,
                          messages: s.messages.map((m) =>
                            m.id === assistantId ? { ...m, content: accumulatedText } : m
                          ),
                          updatedAt: Date.now(),
                        }
                  )
                );
              } else if (event.type === 'grounding' && event.sources) {
                collectedSources = event.sources;
                setSessions((prev) =>
                  prev.map((s) =>
                    s.id !== targetSessionId
                      ? s
                      : {
                          ...s,
                          messages: s.messages.map((m) =>
                            m.id === assistantId
                              ? { ...m, sources: collectedSources }
                              : m
                          ),
                        }
                  )
                );
              } else if (event.type === 'done') {
                if (event.model) {
                  setActiveModelName(event.model);
                }
                if (event.fallbackWarnings && event.fallbackWarnings.length > 0) {
                  console.warn(
                    '[Veritas AI] Model fallback triggered:',
                    event.fallbackWarnings,
                    'Connected using:',
                    event.model
                  );
                }
              } else if (event.type === 'error') {
                console.error(
                  '[Veritas AI] Raw Gemini API Error:',
                  event.rawError ?? event.message,
                  event.fallbackWarnings ?? []
                );
                const errMessage =
                  event.status === 429
                    ? 'Server is busy right now, please wait 10 seconds and try again.'
                    : event.message ||
                      'Unable to complete response right now. Please try again.';

                setSessions((prev) =>
                  prev.map((s) =>
                    s.id !== targetSessionId
                      ? s
                      : {
                          ...s,
                          messages: s.messages.map((m) =>
                            m.id === assistantId
                              ? {
                                  ...m,
                                  content: accumulatedText
                                    ? `${accumulatedText}\n\n---\n*${errMessage}*`
                                    : errMessage,
                                  isError: !accumulatedText,
                                }
                              : m
                          ),
                          updatedAt: Date.now(),
                        }
                  )
                );
              }
            } catch {
              // Ignore malformed SSE chunk
            }
          }
        }
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') {
          setSessions((prev) =>
            prev.map((s) =>
              s.id !== targetSessionId
                ? s
                : {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantId && !m.content
                        ? { ...m, content: 'Response stopped by user.' }
                        : m
                    ),
                  }
            )
          );
        } else {
          setSessions((prev) =>
            prev.map((s) =>
              s.id !== targetSessionId
                ? s
                : {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantId
                        ? {
                            ...m,
                            content:
                              'Connection interrupted. Please check your network and try again.',
                            isError: true,
                          }
                        : m
                    ),
                  }
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [
      activeSession,
      antiHallucinationEnabled,
      customApiKey,
      isStreaming,
      selectedModel,
      stopSpeech,
      webSearchEnabled,
    ]
  );

  const handleStopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const handleQuickAction = useCallback(
    (action: QuickAction) => {
      if (isStreaming) return;
      const trimmedInput = inputValue.trim();

      if (trimmedInput.length > 0) {
        void sendMessage(`${action.instruction}\n\nTopic / Context: ${trimmedInput}`);
        return;
      }

      if (activeSession.messages.length > 0) {
        void sendMessage(action.instruction);
        return;
      }

      const template = action.starterTemplate;
      setInputValue(template);
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.focus();
        const start = template.indexOf('[');
        const end = template.indexOf(']');
        if (start !== -1 && end !== -1 && end > start) {
          el.setSelectionRange(start, end + 1);
        }
      });
    },
    [activeSession?.messages.length, inputValue, isStreaming, sendMessage]
  );

  const activeRoleDef = ROLE_DEFINITIONS[activeSession.roleId] ?? ROLE_DEFINITIONS.general;
  const activeRoleLabel = getRoleDisplayName(
    activeSession.roleId,
    activeSession.customRoleName
  );
  const activeRoleEmoji = getRoleEmoji(activeSession.roleId);

  const activeFormatDisplay = useMemo(() => {
    if (activeSession.activeFormatLabel) return activeSession.activeFormatLabel;
    if (activeSession.adaptiveFormat) return activeRoleDef.adaptiveToggleLabel;
    return null;
  }, [activeRoleDef.adaptiveToggleLabel, activeSession.activeFormatLabel, activeSession.adaptiveFormat]);

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => b.updatedAt - a.updatedAt),
    [sessions]
  );

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Global Minimal Brand Header */}
      <header className="h-12 shrink-0 px-3 sm:px-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between gap-3 z-30">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => setIsLeftDrawerOpen(true)}
            aria-label="Open chat history"
            className="lg:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 rounded-md bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-display text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
              Veritas AI
            </span>
          </div>

          <button
            type="button"
            aria-pressed={antiHallucinationEnabled}
            onClick={() => setAntiHallucinationEnabled((prev) => !prev)}
            title={
              antiHallucinationEnabled
                ? 'Anti-Hallucination ON: Strict factual mode — AI never guesses and refuses unverified/fictional queries. Click to switch to Creative Mode.'
                : 'Anti-Hallucination OFF (Creative Mode): AI acts like a standard creative LLM and speculates even on hypothetical/fictional queries. Click to enable strict verification.'
            }
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              antiHallucinationEnabled
                ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700/80 text-emerald-700 dark:text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.28)] dark:shadow-[0_0_14px_rgba(16,185,129,0.32)] hover:bg-emerald-100/80 dark:hover:bg-emerald-950'
                : 'bg-amber-50/90 dark:bg-slate-800/90 border-amber-300 dark:border-amber-700/70 text-amber-800 dark:text-amber-300 hover:bg-amber-100/80 dark:hover:bg-slate-800'
            }`}
          >
            {antiHallucinationEnabled ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Anti-Hallucination: ON</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Anti-Hallucination: OFF (Creative Mode)</span>
              </>
            )}
          </button>
        </div>

        {/* Right Global Utilities */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsApiKeyModalOpen(true)}
            title="Configure optional backup Gemini API key"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              customApiKey
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">API Key</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main 3-Column Workspace */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Desktop Left Sidebar */}
        <div className="hidden lg:flex h-full">
          <LeftSidebar
            sessions={sortedSessions}
            activeSessionId={activeSession.id}
            onNewChat={handleNewChat}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
            onClearHistory={handleClearHistory}
          />
        </div>

        {/* Mobile Left Sidebar Overlay */}
        {isLeftDrawerOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden flex bg-slate-950/50 backdrop-blur-xs"
            onClick={() => setIsLeftDrawerOpen(false)}
          >
            <div className="h-full" onClick={(e) => e.stopPropagation()}>
              <LeftSidebar
                sessions={sortedSessions}
                activeSessionId={activeSession.id}
                onNewChat={handleNewChat}
                onSelectSession={handleSelectSession}
                onDeleteSession={handleDeleteSession}
                onClearHistory={handleClearHistory}
                onCloseMobile={() => setIsLeftDrawerOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Center Main Chat Workspace */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950">
          {/* Minimalist Top Control Bar (ONLY: Role Dropdown, Depth Dropdown, Hinglish Toggle, Web Search Toggle, Quick Actions Button, Model / Pro Pass Selector) */}
          <div className="shrink-0 bg-white/90 dark:bg-slate-900/75 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-2 z-20">
            <div className="flex items-center gap-2 flex-wrap">
              {/* [1] Unified Role Dropdown */}
              <RoleDropdown
                roleId={activeSession.roleId}
                customRoleName={activeSession.customRoleName}
                customRoles={customRoles}
                disabled={isStreaming}
                onSelectPresetRole={handleSelectPresetRole}
                onSelectCustomRole={handleApplyCustomRole}
                onDeleteCustomRole={handleDeleteCustomRole}
                onOpenAddCustomRole={() => setIsCustomRoleModalOpen(true)}
              />

              {/* [2] Compact Depth Dropdown */}
              <DepthDropdown
                value={activeSession.depthLevel}
                onChange={(level) =>
                  updateActiveSession((s) => ({
                    ...s,
                    depthLevel: level,
                  }))
                }
              />

              {/* [3] Hinglish Toggle */}
              <button
                type="button"
                aria-pressed={activeSession.hinglishMode}
                onClick={() =>
                  updateActiveSession((s) => ({
                    ...s,
                    hinglishMode: !s.hinglishMode,
                  }))
                }
                title="Reply in conversational Hindi + English mix"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeSession.hinglishMode
                    ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>🌐 Hinglish</span>
                <span className="text-[11px] opacity-80">
                  {activeSession.hinglishMode ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* [4] Web Search Toggle */}
              <button
                type="button"
                aria-pressed={webSearchEnabled}
                onClick={() => setWebSearchEnabled((prev) => !prev)}
                title="Toggle Google Search Grounding (OFF by default to protect API quota)"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  webSearchEnabled
                    ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>🔍 Web Search</span>
                <span className="text-[11px] opacity-80">
                  {webSearchEnabled ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* [5] Quick Actions Button */}
              <button
                type="button"
                aria-expanded={isQuickActionsOpen}
                onClick={() => setIsQuickActionsOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isQuickActionsOpen
                    ? 'bg-slate-900 dark:bg-blue-600 border-slate-900 dark:border-blue-600 text-white'
                    : activeFormatDisplay
                    ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>⚡ Quick Actions</span>
                {activeFormatDisplay && !isQuickActionsOpen && (
                  <span className="text-[10px] font-semibold opacity-85">· 1</span>
                )}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${
                    isQuickActionsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {/* [6] Model / Pro Pass Selector */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setPendingProModel(null);
                  setIsUpgradeModalOpen(true);
                }}
                title={
                  isPro
                    ? 'Veritas Pro Active (Click to manage)'
                    : 'Free Plan (Click to upgrade)'
                }
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isPro
                    ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300/80 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>{isPro ? '✨ Pro Active' : 'Free Plan'}</span>
              </button>

              <ModelSelector
                selectedModel={selectedModel}
                isPro={isPro}
                disabled={isStreaming}
                onSelectModel={(modelId) => setSelectedModel(modelId)}
                onRequireUpgrade={(requestedModelId) => {
                  setPendingProModel(requestedModelId);
                  setIsUpgradeModalOpen(true);
                }}
              />
            </div>
          </div>

          {/* Chat Message Stream */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-6">
            <div className="max-w-3xl mx-auto space-y-5">
              {activeSession.messages.length === 0 ? (
                <div className="py-12 sm:py-16 px-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs mx-auto flex items-center justify-center text-xl mb-4">
                    <span aria-hidden="true">{activeRoleEmoji}</span>
                  </div>

                  <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
                    {activeRoleLabel} Workspace
                  </h1>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                    {activeRoleDef.shortDesc}. Switch roles, depth, or output formats anytime
                    from the control bar above.
                  </p>

                  <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    <span>
                      Depth:{' '}
                      <strong className="text-slate-700 dark:text-slate-200">
                        {DEPTH_LEVELS.find((d) => d.id === activeSession.depthLevel)?.label}
                      </strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Format:{' '}
                      <strong className="text-slate-700 dark:text-slate-200">
                        {activeFormatDisplay ?? 'Standard Prose'}
                      </strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Web Search:{' '}
                      <strong className="text-slate-700 dark:text-slate-200">
                        {webSearchEnabled ? 'Live Grounding ON' : 'Offline Quota-Safe'}
                      </strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Guardrail:{' '}
                      <strong
                        className={
                          antiHallucinationEnabled
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : 'text-amber-700 dark:text-amber-300'
                        }
                      >
                        {antiHallucinationEnabled ? 'Anti-Hallucination ON' : 'Creative Mode (OFF)'}
                      </strong>
                    </span>
                  </div>
                </div>
              ) : (
                activeSession.messages.map((msg, idx) => {
                  const isLastStreamingMsg =
                    isStreaming &&
                    idx === activeSession.messages.length - 1 &&
                    msg.role === 'assistant';
                  return (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      isStreaming={isLastStreamingMsg}
                      isSpeaking={speakingMessageId === msg.id}
                      onToggleSpeak={handleToggleSpeak}
                      roleLabel={activeRoleLabel}
                    />
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Bottom Composer */}
          <div className="shrink-0 px-3 sm:px-6 pb-4 pt-2 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent dark:from-slate-950 dark:via-slate-950">
            <div className="max-w-3xl mx-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendMessage(inputValue);
                }}
                className="relative flex items-end gap-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/15 p-2 transition-all"
              >
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void sendMessage(inputValue);
                    }
                  }}
                  placeholder={`Ask ${activeRoleLabel} anything... (Enter to send, Shift+Enter for new line)`}
                  className="flex-1 resize-none bg-transparent px-2.5 py-2 text-[15px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none max-h-[160px]"
                />

                {isStreaming ? (
                  <button
                    type="button"
                    onClick={handleStopStreaming}
                    title="Stop generating"
                    aria-label="Stop generating"
                    className="w-9 h-9 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    title="Send message"
                    aria-label="Send message"
                    className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white flex items-center justify-center shrink-0 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                )}
              </form>

              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-1">
                <span>
                  {activeRoleEmoji} {activeRoleLabel} ·{' '}
                  {DEPTH_LEVELS.find((d) => d.id === activeSession.depthLevel)?.label}
                  {activeSession.hinglishMode ? ' · Hinglish' : ''}
                  {activeFormatDisplay ? ` · ${activeFormatDisplay}` : ''}
                </span>
                <span className="hidden sm:inline">
                  {webSearchEnabled
                    ? `Google Search Grounding enabled · ${activeModelName}`
                    : `Model: ${activeModelName}`}
                </span>
              </div>
            </div>
          </div>
        </main>

        {/* Expandable Quick Actions Drawer (Section 1: Output Format Cards, Section 2: Smart Pre-Fill Prompts) */}
        {isQuickActionsOpen && (
          <>
            <div className="hidden lg:flex h-full">
              <QuickActionsDrawer
                roleId={activeSession.roleId}
                customRoleName={activeSession.customRoleName}
                hasMessages={activeSession.messages.length > 0}
                activeFormatId={activeSession.activeFormatId ?? null}
                customFormats={customFormats}
                customShortcuts={customShortcuts}
                onToggleFormat={handleToggleOutputFormat}
                onAddCustomFormat={(label, instruction) => {
                  const newFormat: CustomFormat = {
                    id: generateId(),
                    roleId: activeSession.roleId,
                    label,
                    instruction,
                    createdAt: Date.now(),
                  };
                  setCustomFormats((prev) => [...prev, newFormat]);
                  handleToggleOutputFormat({
                    id: newFormat.id,
                    label: newFormat.label,
                    description: newFormat.instruction,
                    instruction: newFormat.instruction,
                  });
                }}
                onDeleteCustomFormat={(id) => {
                  setCustomFormats((prev) => prev.filter((f) => f.id !== id));
                  if (activeSession.activeFormatId === id) {
                    updateActiveSession((s) => ({
                      ...s,
                      adaptiveFormat: false,
                      activeFormatId: null,
                      activeFormatLabel: undefined,
                      activeFormatInstruction: undefined,
                    }));
                  }
                }}
                onQuickAction={(action) => {
                  handleQuickAction(action);
                }}
                onAddCustomShortcut={(label, instruction) => {
                  setCustomShortcuts((prev) => [
                    ...prev,
                    {
                      id: generateId(),
                      roleId: activeSession.roleId,
                      label,
                      instruction,
                      createdAt: Date.now(),
                    },
                  ]);
                }}
                onDeleteCustomShortcut={(id) => {
                  setCustomShortcuts((prev) => prev.filter((s) => s.id !== id));
                }}
                disabled={isStreaming}
                onClose={() => setIsQuickActionsOpen(false)}
              />
            </div>

            <div
              className="fixed inset-0 z-40 lg:hidden flex justify-end bg-slate-950/50 backdrop-blur-xs"
              onClick={() => setIsQuickActionsOpen(false)}
            >
              <div className="h-full" onClick={(e) => e.stopPropagation()}>
                <QuickActionsDrawer
                  roleId={activeSession.roleId}
                  customRoleName={activeSession.customRoleName}
                  hasMessages={activeSession.messages.length > 0}
                  activeFormatId={activeSession.activeFormatId ?? null}
                  customFormats={customFormats}
                  customShortcuts={customShortcuts}
                  onToggleFormat={handleToggleOutputFormat}
                  onAddCustomFormat={(label, instruction) => {
                    const newFormat: CustomFormat = {
                      id: generateId(),
                      roleId: activeSession.roleId,
                      label,
                      instruction,
                      createdAt: Date.now(),
                    };
                    setCustomFormats((prev) => [...prev, newFormat]);
                    handleToggleOutputFormat({
                      id: newFormat.id,
                      label: newFormat.label,
                      description: newFormat.instruction,
                      instruction: newFormat.instruction,
                    });
                  }}
                  onDeleteCustomFormat={(id) => {
                    setCustomFormats((prev) => prev.filter((f) => f.id !== id));
                    if (activeSession.activeFormatId === id) {
                      updateActiveSession((s) => ({
                        ...s,
                        adaptiveFormat: false,
                        activeFormatId: null,
                        activeFormatLabel: undefined,
                        activeFormatInstruction: undefined,
                      }));
                    }
                  }}
                  onQuickAction={(action) => {
                    handleQuickAction(action);
                    setIsQuickActionsOpen(false);
                  }}
                  onAddCustomShortcut={(label, instruction) => {
                    setCustomShortcuts((prev) => [
                      ...prev,
                      {
                        id: generateId(),
                        roleId: activeSession.roleId,
                        label,
                        instruction,
                        createdAt: Date.now(),
                      },
                    ]);
                  }}
                  onDeleteCustomShortcut={(id) => {
                    setCustomShortcuts((prev) => prev.filter((s) => s.id !== id));
                  }}
                  disabled={isStreaming}
                  onClose={() => setIsQuickActionsOpen(false)}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        savedKey={customApiKey}
        onSave={handleSaveApiKey}
        onClear={handleClearApiKey}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      <CustomRoleModal
        isOpen={isCustomRoleModalOpen}
        initialRoleName={
          activeSession.roleId === 'custom' ? activeSession.customRoleName || '' : ''
        }
        onApply={handleApplyCustomRole}
        onClose={() => setIsCustomRoleModalOpen(false)}
      />

      <UpgradeProModal
        isOpen={isUpgradeModalOpen}
        isPro={isPro}
        onActivateDemoPro={() => {
          setIsPro(true);
          if (pendingProModel) {
            setSelectedModel(pendingProModel);
            setPendingProModel(null);
          }
        }}
        onRevertToFree={() => {
          setIsPro(false);
          const currentOption = getModelOption(selectedModel);
          if (currentOption.tier === 'pro') {
            setSelectedModel(DEFAULT_MODEL_ID);
          }
        }}
        onClose={() => {
          setIsUpgradeModalOpen(false);
          setPendingProModel(null);
        }}
      />
    </div>
  );
}

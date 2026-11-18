import type { ModelOption, ModelOptionId } from '../types/chat';

export const DEFAULT_MODEL_ID: ModelOptionId = 'gemini-2.5-flash';

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    shortLabel: '2.5 Flash',
    tier: 'free',
    emoji: '⚡',
    subtitle: 'Free - Fast & High Quota',
  },
  {
    id: 'gemini-2.5-flash-lite',
    label: 'Gemini 2.5 Flash-Lite',
    shortLabel: '2.5 Flash-Lite',
    tier: 'free',
    emoji: '🪶',
    subtitle: 'Free - Ultra-Light',
  },
  {
    id: 'gemini-pro',
    label: 'Gemini Pro',
    shortLabel: 'Gemini Pro',
    tier: 'pro',
    emoji: '🧠',
    subtitle: 'Deep Reasoning',
  },
  {
    id: 'gemini-4-hydrogen',
    label: 'Gemini 4 Hydrogen',
    shortLabel: '4 Hydrogen',
    tier: 'pro',
    emoji: '🚀',
    subtitle: 'Ultra',
  },
];

export function getModelOption(id: ModelOptionId): ModelOption {
  return MODEL_OPTIONS.find((m) => m.id === id) ?? MODEL_OPTIONS[0];
}

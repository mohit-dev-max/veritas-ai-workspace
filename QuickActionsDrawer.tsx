import React, { useState } from 'react';
import {
  ArrowUpRight,
  Check,
  LayoutTemplate,
  Plus,
  Sparkles,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import {
  ROLE_DEFINITIONS,
  getRoleDisplayName,
  getRoleEmoji,
} from '../config/roles';
import type {
  CustomFormat,
  CustomShortcut,
  OutputFormatOption,
  QuickAction,
  RoleId,
} from '../types/chat';

interface QuickActionsDrawerProps {
  roleId: RoleId;
  customRoleName?: string;
  hasMessages: boolean;
  activeFormatId: string | null;
  customFormats: CustomFormat[];
  customShortcuts: CustomShortcut[];
  onToggleFormat: (format: OutputFormatOption) => void;
  onAddCustomFormat: (label: string, instruction: string) => void;
  onDeleteCustomFormat: (id: string) => void;
  onQuickAction: (action: QuickAction) => void;
  onAddCustomShortcut: (label: string, instruction: string) => void;
  onDeleteCustomShortcut: (id: string) => void;
  disabled?: boolean;
  onClose: () => void;
}

export const QuickActionsDrawer: React.FC<QuickActionsDrawerProps> = ({
  roleId,
  customRoleName,
  hasMessages,
  activeFormatId,
  customFormats,
  customShortcuts,
  onToggleFormat,
  onAddCustomFormat,
  onDeleteCustomFormat,
  onQuickAction,
  onAddCustomShortcut,
  onDeleteCustomShortcut,
  disabled = false,
  onClose,
}) => {
  const [isAddingFormat, setIsAddingFormat] = useState(false);
  const [formatLabel, setFormatLabel] = useState('');
  const [formatInstruction, setFormatInstruction] = useState('');

  const [isAddingPrompt, setIsAddingPrompt] = useState(false);
  const [promptLabel, setPromptLabel] = useState('');
  const [promptInstruction, setPromptInstruction] = useState('');

  const roleDef = ROLE_DEFINITIONS[roleId];
  const displayName = getRoleDisplayName(roleId, customRoleName);
  const emoji = getRoleEmoji(roleId);

  const roleCustomFormats = customFormats.filter((f) => f.roleId === roleId);
  const roleCustomPrompts = customShortcuts.filter((s) => s.roleId === roleId);

  const handleSaveFormat = (e: React.FormEvent) => {
    e.preventDefault();
    const label = formatLabel.trim();
    const instruction = formatInstruction.trim();
    if (!label || !instruction) return;
    onAddCustomFormat(label, instruction);
    setFormatLabel('');
    setFormatInstruction('');
    setIsAddingFormat(false);
  };

  const handleSavePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    const label = promptLabel.trim();
    const instruction = promptInstruction.trim();
    if (!label || !instruction) return;
    onAddCustomShortcut(label, instruction);
    setPromptLabel('');
    setPromptInstruction('');
    setIsAddingPrompt(false);
  };

  return (
    <aside className="flex flex-col h-full w-[310px] shrink-0 bg-white/95 dark:bg-slate-900/95 border-l border-slate-200 dark:border-slate-800 animate-[fadeIn_140ms_ease-out]">
      {/* Drawer Header */}
      <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <h2 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              Quick Actions · {emoji} {displayName}
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
            Format styles & smart prompts for this role
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close Quick Actions"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* SECTION 1: OUTPUT FORMAT CARDS */}
        <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <LayoutTemplate className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Output Format Cards
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {activeFormatId ? '1 active' : 'Standard'}
            </span>
          </div>

          <div className="space-y-1.5">
            {roleDef.outputFormats.map((fmt) => {
              const isActive = activeFormatId === fmt.id;
              return (
                <button
                  key={fmt.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onToggleFormat(fmt)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 dark:border-blue-600 text-blue-900 dark:text-blue-100'
                      : 'bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{fmt.label}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {fmt.description}
                    </p>
                  </div>
                  <span
                    className={`mt-0.5 shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-md ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-300 dark:border-slate-700 text-transparent'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                  </span>
                </button>
              );
            })}

            {/* Custom Formats for Active Role */}
            {roleCustomFormats.map((cf) => {
              const isActive = activeFormatId === cf.id;
              const asOption: OutputFormatOption = {
                id: cf.id,
                label: cf.label,
                description: cf.instruction,
                instruction: cf.instruction,
              };
              return (
                <div
                  key={cf.id}
                  className={`group relative rounded-xl border transition-all flex items-start justify-between gap-1 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 dark:border-blue-600 text-blue-900 dark:text-blue-100'
                      : 'bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => onToggleFormat(asOption)}
                    className="flex-1 min-w-0 text-left px-3 py-2.5 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold truncate">{cf.label}</span>
                      <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 shrink-0">
                        Custom
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {cf.instruction}
                    </p>
                  </button>

                  <div className="flex items-center gap-1 pr-2 pt-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onDeleteCustomFormat(cf.id)}
                      title="Delete custom format"
                      aria-label={`Delete ${cf.label}`}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleFormat(asOption)}
                      aria-label={`Toggle ${cf.label}`}
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-md cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-300 dark:border-slate-700 text-transparent'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* + Add Custom Format */}
          <div className="mt-2.5">
            {!isAddingFormat ? (
              <button
                type="button"
                onClick={() => setIsAddingFormat(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Custom Format</span>
              </button>
            ) : (
              <form onSubmit={handleSaveFormat} className="space-y-2 pt-1">
                <input
                  type="text"
                  autoFocus
                  maxLength={36}
                  value={formatLabel}
                  onChange={(e) => setFormatLabel(e.target.value)}
                  placeholder="Format name (e.g. Cornell Notes)"
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
                <textarea
                  rows={2}
                  value={formatInstruction}
                  onChange={(e) => setFormatInstruction(e.target.value)}
                  placeholder="Style rule (e.g. Format with Cues, Notes, and Bottom Summary)"
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs resize-none bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
                <div className="flex items-center gap-1.5">
                  <button
                    type="submit"
                    disabled={!formatLabel.trim() || !formatInstruction.trim()}
                    className="flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    Save Format
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingFormat(false);
                      setFormatLabel('');
                      setFormatInstruction('');
                    }}
                    className="py-1.5 px-2.5 rounded-lg text-xs font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* SECTION 2: SMART PRE-FILL PROMPTS */}
        <div className="p-3.5">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Smart Pre-Fill Prompts
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {hasMessages ? 'Sends on click' : 'Pre-fills input'}
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/30">
            {roleDef.quickActions.map((action) => (
              <button
                key={action.id}
                type="button"
                disabled={disabled}
                onClick={() => onQuickAction(action)}
                className="w-full text-left group px-3 py-2.5 hover:bg-white dark:hover:bg-slate-800/70 transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-start justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {action.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {action.description}
                  </p>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            ))}

            {roleCustomPrompts.map((custom) => {
              const asQuickAction: QuickAction = {
                id: custom.id,
                label: custom.label,
                description: custom.instruction,
                instruction: custom.instruction,
                starterTemplate: `${custom.instruction} [topic]`,
              };
              return (
                <div
                  key={custom.id}
                  className="group relative flex items-start justify-between gap-2 px-3 py-2.5 hover:bg-white dark:hover:bg-slate-800/70 transition-colors"
                >
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onQuickAction(asQuickAction)}
                    className="flex-1 min-w-0 text-left cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                        {custom.label}
                      </span>
                      <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 shrink-0">
                        Custom
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {custom.instruction}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteCustomShortcut(custom.id)}
                    title="Delete custom prompt"
                    aria-label={`Delete ${custom.label}`}
                    className="p-1 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/70 transition-all cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* + Add Custom Prompt */}
          <div className="mt-2.5">
            {!isAddingPrompt ? (
              <button
                type="button"
                onClick={() => setIsAddingPrompt(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Custom Prompt</span>
              </button>
            ) : (
              <form onSubmit={handleSavePrompt} className="space-y-2 pt-1">
                <input
                  type="text"
                  autoFocus
                  maxLength={36}
                  value={promptLabel}
                  onChange={(e) => setPromptLabel(e.target.value)}
                  placeholder="Prompt name (e.g. Flashcards)"
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
                <textarea
                  rows={2}
                  value={promptInstruction}
                  onChange={(e) => setPromptInstruction(e.target.value)}
                  placeholder="Prompt instruction (e.g. Turn this into 5 Q&A flashcards)"
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs resize-none bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
                <div className="flex items-center gap-1.5">
                  <button
                    type="submit"
                    disabled={!promptLabel.trim() || !promptInstruction.trim()}
                    className="flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    Save Prompt
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingPrompt(false);
                      setPromptLabel('');
                      setPromptInstruction('');
                    }}
                    className="py-1.5 px-2.5 rounded-lg text-xs font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Lock, Sparkles } from 'lucide-react';
import { MODEL_OPTIONS, getModelOption } from '../config/models';
import type { ModelOptionId } from '../types/chat';

interface ModelSelectorProps {
  selectedModel: ModelOptionId;
  isPro: boolean;
  disabled?: boolean;
  onSelectModel: (modelId: ModelOptionId) => void;
  onRequireUpgrade: (requestedModelId: ModelOptionId) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  isPro,
  disabled = false,
  onSelectModel,
  onRequireUpgrade,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentModel = getModelOption(selectedModel);
  const freeModels = MODEL_OPTIONS.filter((m) => m.tier === 'free');
  const proModels = MODEL_OPTIONS.filter((m) => m.tier === 'pro');

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleChoose = (modelId: ModelOptionId, tier: 'free' | 'pro') => {
    setIsOpen(false);
    if (tier === 'pro' && !isPro) {
      onRequireUpgrade(modelId);
      return;
    }
    onSelectModel(modelId);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
      >
        <span aria-hidden="true">{currentModel.emoji}</span>
        <span className="hidden md:inline">{currentModel.label}</span>
        <span className="md:hidden">{currentModel.shortLabel}</span>
        {currentModel.tier === 'pro' && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
            PRO
          </span>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Select Gemini Model"
          className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-[300px] sm:w-[320px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-[fadeIn_120ms_ease-out]"
        >
          {/* Free Tier Section */}
          <div className="px-2.5 py-1.5">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              Free Tier (Unlocked)
            </span>
          </div>
          <div className="space-y-1">
            {freeModels.map((model) => {
              const isSelected = selectedModel === model.id;
              return (
                <button
                  key={model.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleChoose(model.id, model.tier)}
                  className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-100'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="text-base leading-none mt-0.5 shrink-0" aria-hidden="true">
                      {model.emoji}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{model.label}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {model.subtitle}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="my-2 border-t border-slate-200/80 dark:border-slate-800" />

          {/* Pro Tier Section */}
          <div className="px-2.5 py-1.5 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              Pro Tier
            </span>
            {isPro ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-3 h-3" />
                Unlocked
              </span>
            ) : (
              <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                Upgrade required
              </span>
            )}
          </div>
          <div className="space-y-1">
            {proModels.map((model) => {
              const isSelected = selectedModel === model.id;
              const isLocked = !isPro;
              return (
                <button
                  key={model.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleChoose(model.id, model.tier)}
                  className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-100'
                      : isLocked
                      ? 'hover:bg-amber-50/70 dark:hover:bg-amber-950/25 text-slate-700 dark:text-slate-300'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="text-base leading-none mt-0.5 shrink-0" aria-hidden="true">
                      {model.emoji}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{model.label}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {model.subtitle}
                      </p>
                    </div>
                  </div>

                  {isLocked ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                      <Lock className="w-2.5 h-2.5" />
                      PRO
                    </span>
                  ) : isSelected ? (
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 shrink-0">
                      PRO
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

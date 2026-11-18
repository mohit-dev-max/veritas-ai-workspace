import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { DEPTH_LEVELS } from '../config/roles';
import type { DepthLevel } from '../types/chat';

interface DepthDropdownProps {
  value: DepthLevel;
  onChange: (level: DepthLevel) => void;
}

const DEPTH_WORD_HINTS: Record<DepthLevel, string> = {
  simple: '50–70 words · 1 short paragraph + 1 example',
  intermediate: '150–180 words · 2-line intro + 3–4 bullets',
  'deep-expert': '400+ words · Headings, tables & deep analysis',
};

export const DepthDropdown: React.FC<DepthDropdownProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedLevel = DEPTH_LEVELS.find((d) => d.id === value) ?? DEPTH_LEVELS[1];

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

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={selectedLevel.description}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
      >
        <span>🎯 Depth: {selectedLevel.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Select Explanation Depth"
          className="absolute left-0 mt-1.5 w-[275px] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-40 animate-[fadeIn_120ms_ease-out]"
        >
          {DEPTH_LEVELS.map((lvl) => {
            const isSelected = lvl.id === value;
            return (
              <button
                key={lvl.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(lvl.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-start justify-between gap-2 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-100'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold">{lvl.label}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {DEPTH_WORD_HINTS[lvl.id]}
                  </p>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

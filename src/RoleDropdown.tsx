import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Plus, Trash2 } from 'lucide-react';
import {
  ROLE_DEFINITIONS,
  getRoleDisplayName,
  getRoleEmoji,
} from '../config/roles';
import type { CustomRoleEntry, PresetRoleId, RoleId } from '../types/chat';

interface RoleDropdownProps {
  roleId: RoleId;
  customRoleName?: string;
  customRoles: CustomRoleEntry[];
  disabled?: boolean;
  onSelectPresetRole: (roleId: PresetRoleId) => void;
  onSelectCustomRole: (roleName: string) => void;
  onDeleteCustomRole: (id: string) => void;
  onOpenAddCustomRole: () => void;
}

const PRESET_ORDER: PresetRoleId[] = [
  'general',
  'student',
  'teacher',
  'businessman',
  'data-analyst',
];

export const RoleDropdown: React.FC<RoleDropdownProps> = ({
  roleId,
  customRoleName,
  customRoles,
  disabled = false,
  onSelectPresetRole,
  onSelectCustomRole,
  onDeleteCustomRole,
  onOpenAddCustomRole,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeEmoji = getRoleEmoji(roleId);
  const activeName = getRoleDisplayName(roleId, customRoleName);

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
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
      >
        <span>🎭 Role:</span>
        <span className="font-semibold max-w-[165px] truncate">
          {activeEmoji} {activeName}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Select AI Role"
          className="absolute left-0 mt-1.5 w-[285px] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50 animate-[fadeIn_120ms_ease-out]"
        >
          <div className="space-y-0.5">
            {PRESET_ORDER.map((presetId) => {
              const def = ROLE_DEFINITIONS[presetId];
              const isSelected = roleId === presetId;
              return (
                <button
                  key={presetId}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setIsOpen(false);
                    onSelectPresetRole(presetId);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-100'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="text-sm leading-none mt-0.5 shrink-0" aria-hidden="true">
                      {def.emoji}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{def.label}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {def.shortDesc}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Saved Custom Roles */}
          {customRoles.length > 0 && (
            <>
              <div className="my-1.5 border-t border-slate-200/80 dark:border-slate-800" />
              <div className="px-2.5 py-1">
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                  Saved Custom Roles
                </span>
              </div>
              <div className="space-y-0.5 max-h-[150px] overflow-y-auto">
                {customRoles.map((entry) => {
                  const isSelected =
                    roleId === 'custom' &&
                    customRoleName?.toLowerCase() === entry.name.toLowerCase();
                  return (
                    <div
                      key={entry.id}
                      className={`group flex items-center justify-between gap-1 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-100'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setIsOpen(false);
                          onSelectCustomRole(entry.name);
                        }}
                        className="flex-1 flex items-center gap-2 px-2.5 py-1.5 text-left min-w-0 cursor-pointer"
                      >
                        <span className="text-xs shrink-0" aria-hidden="true">
                          ✨
                        </span>
                        <span className="text-xs font-medium truncate">{entry.name}</span>
                      </button>

                      <div className="flex items-center gap-1 pr-1.5 shrink-0">
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCustomRole(entry.id);
                          }}
                          title="Delete saved role"
                          aria-label={`Delete ${entry.name}`}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* + Add Custom Role */}
          <div className="mt-1.5 pt-1.5 border-t border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenAddCustomRole();
              }}
              className="w-full flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Custom Role</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

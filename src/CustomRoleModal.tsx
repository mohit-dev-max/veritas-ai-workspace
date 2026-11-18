import React, { useEffect, useState } from 'react';
import { UserPlus, X } from 'lucide-react';

interface CustomRoleModalProps {
  isOpen: boolean;
  initialRoleName: string;
  onApply: (roleName: string) => void;
  onClose: () => void;
}

const SUGGESTED_ROLES = [
  'Doctor',
  'Full-Stack Coder',
  'Product Manager',
  'Financial Advisor',
  'UX Designer',
  'Career Coach',
];

export const CustomRoleModal: React.FC<CustomRoleModalProps> = ({
  isOpen,
  initialRoleName,
  onApply,
  onClose,
}) => {
  const [roleName, setRoleName] = useState(initialRoleName);

  useEffect(() => {
    setRoleName(initialRoleName);
  }, [initialRoleName, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = roleName.trim();
    if (!trimmed) return;
    onApply(trimmed);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-xs animate-[fadeIn_140ms_ease-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-role-modal-title"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="custom-role-modal-title"
                className="text-base font-semibold text-slate-900 dark:text-white"
              >
                Create Custom Persona
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Starts a new chat session locked to this expert role
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="custom-role-input"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Role or Profession
            </label>
            <input
              id="custom-role-input"
              type="text"
              autoFocus
              maxLength={48}
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g., Doctor, Senior Coder, Legal Consultant"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Quick Presets
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_ROLES.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setRoleName(preset)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!roleName.trim()}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              Start Chat as Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

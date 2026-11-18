import React, { useState } from 'react';
import { MessageSquarePlus, Trash2, MessageSquare, X } from 'lucide-react';
import { getRoleDisplayName } from '../config/roles';
import type { ChatSession } from '../types/chat';

interface LeftSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onClearHistory: () => void;
  onCloseMobile?: () => void;
}

function formatShortTime(ts: number): string {
  const diffMs = Date.now() - ts;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const ROLE_BADGE_STYLES: Record<string, string> = {
  general:
    'bg-slate-100 text-slate-700 border-slate-200/90 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  student:
    'bg-blue-50 text-blue-700 border-blue-200/70 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60',
  teacher:
    'bg-amber-50 text-amber-800 border-amber-200/70 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
  businessman:
    'bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
  'data-analyst':
    'bg-indigo-50 text-indigo-700 border-indigo-200/70 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60',
  custom:
    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
};

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  sessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onClearHistory,
  onCloseMobile,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <aside className="flex flex-col h-full w-[268px] shrink-0 bg-slate-100/80 dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-800 select-none">
      <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            onNewChat();
            onCloseMobile?.();
          }}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shadow-xs"
        >
          <MessageSquarePlus className="w-4 h-4 shrink-0" />
          <span>+ New Chat</span>
        </button>

        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close chat history"
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="px-3.5 pt-3 pb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Chat History
        </span>
        <span className="text-xs font-mono tabular-nums text-slate-400 dark:text-slate-500">
          {sessions.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-2.5 py-1.5 space-y-1">
        {sessions.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
            <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-40" />
            <p>Your conversations will be saved automatically here.</p>
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const roleLabel = getRoleDisplayName(session.roleId, session.customRoleName);
            const badgeStyle = ROLE_BADGE_STYLES[session.roleId] || ROLE_BADGE_STYLES.custom;

            return (
              <div
                key={session.id}
                className={`group relative rounded-xl transition-colors ${
                  isActive
                    ? 'bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 shadow-2xs'
                    : 'border border-transparent hover:bg-white/70 dark:hover:bg-slate-800/50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectSession(session.id);
                    onCloseMobile?.();
                  }}
                  className="w-full text-left px-3 py-2.5 pr-8 cursor-pointer rounded-xl"
                >
                  <p
                    className={`text-[13px] font-medium truncate ${
                      isActive
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {session.title}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5 min-w-0">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-medium border truncate max-w-[125px] ${badgeStyle}`}
                    >
                      {roleLabel}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums whitespace-nowrap">
                      {formatShortTime(session.updatedAt)}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  title="Delete chat"
                  aria-label={`Delete ${session.title}`}
                  className="absolute right-2 top-2.5 p-1 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700/70 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800">
        {!confirmClear ? (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            disabled={sessions.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClearHistory();
                setConfirmClear(false);
              }}
              className="flex-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Confirm Clear
            </button>
            <button
              type="button"
              onClick={() => setConfirmClear(false)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

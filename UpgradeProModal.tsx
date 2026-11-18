import React, { useEffect, useState } from 'react';
import { Check, Crown, Sparkles, X, Zap } from 'lucide-react';

interface UpgradeProModalProps {
  isOpen: boolean;
  isPro: boolean;
  onActivateDemoPro: () => void;
  onRevertToFree: () => void;
  onClose: () => void;
}

const FREE_FEATURES = [
  'Gemini 2.5 Flash & Flash-Lite models',
  'Role-Adaptive personas & Depth levels',
  'Anti-Hallucination & Hinglish mode',
  'Local browser chat history & voice',
];

const PRO_FEATURES = [
  'Unlimited Gemini Pro (Deep Reasoning)',
  'Unlimited Gemini 4 Hydrogen (Ultra)',
  'Priority inference speed & zero queues',
  'Priority Live Web Search Grounding',
];

export const UpgradeProModal: React.FC<UpgradeProModalProps> = ({
  isOpen,
  isPro,
  onActivateDemoPro,
  onRevertToFree,
  onClose,
}) => {
  const [checkoutNotice, setCheckoutNotice] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCheckoutNotice(false);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-[fadeIn_140ms_ease-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-pro-title"
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="upgrade-pro-title"
                className="font-display text-lg font-bold text-slate-900 dark:text-white"
              >
                Upgrade to Veritas Pro ✨
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Unlock deep reasoning, Gemini 4 Hydrogen Ultra, and priority speed
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

        {/* Plan Comparison Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Free Plan Card */}
          <div className="rounded-xl p-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Free Plan
                </h3>
                {!isPro && (
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Current Plan
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                  ₹0
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">/mo</span>
              </div>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                For everyday study, planning, and fast quota-protected chats.
              </p>

              <ul className="mt-4 space-y-2.5">
                {FREE_FEATURES.map((feat) => (
                  <li
                    key={feat}
                    className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <Check className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800">
              {isPro ? (
                <button
                  type="button"
                  onClick={() => {
                    onRevertToFree();
                    onClose();
                  }}
                  className="w-full py-2 px-3 rounded-xl text-xs font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Switch Back to Free Plan
                </button>
              ) : (
                <div className="w-full py-2 px-3 rounded-xl text-xs font-medium text-center bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Active on Free Tier
                </div>
              )}
            </div>
          </div>

          {/* Pro Plan Card */}
          <div className="rounded-xl p-5 bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-500 flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Pro Plan</span>
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </h3>
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  {isPro ? 'Active' : 'Recommended'}
                </span>
              </div>

              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                  ₹499
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">/mo</span>
              </div>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                Unlimited Pro/Hydrogen models & priority speed for power users.
              </p>

              <ul className="mt-4 space-y-2.5">
                {PRO_FEATURES.map((feat) => (
                  <li
                    key={feat}
                    className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
              {isPro ? (
                <div className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-center bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                  ✨ Veritas Pro Active
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setCheckoutNotice(true)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white transition-colors cursor-pointer"
                  >
                    Upgrade for ₹499/mo
                  </button>
                  {checkoutNotice && (
                    <p className="text-[11px] text-center text-blue-600 dark:text-blue-400">
                      Billing checkout is simulated in demo mode — use the Demo Pro Pass below to test Pro models live.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Discreet Live Presentation Demo Unlock */}
        {!isPro && (
          <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Presenting live? Unlock Pro models instantly for this session.
            </span>
            <button
              type="button"
              onClick={() => {
                onActivateDemoPro();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Activate 1-Click Demo Pro Pass</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Check,
  Copy,
  ExternalLink,
  Volume2,
  Square,
  AlertTriangle,
  Bot,
  User,
} from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
  isSpeaking?: boolean;
  onToggleSpeak: (messageId: string, text: string) => void;
  roleLabel: string;
}

function CodeBlock({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const [copiedCode, setCopiedCode] = useState(false);
  const codeText = String(children ?? '').replace(/\n$/, '');
  const match = /language-(\w+)/.exec(className || '');
  const language = match?.[1] || 'code';

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1800);
    } catch {
      // Clipboard API fallback ignored cleanly
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-950 text-slate-100">
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800 bg-slate-900/90 text-xs text-slate-400">
        <span className="font-mono">{language}</span>
        <button
          type="button"
          onClick={handleCopyCode}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          {copiedCode ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 text-[13px] leading-relaxed overflow-x-auto font-mono m-0">
        <code className={className}>{codeText}</code>
      </pre>
    </div>
  );
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isStreaming = false,
  isSpeaking = false,
  onToggleSpeak,
  roleLabel,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  if (message.role === 'user') {
    return (
      <div className="flex justify-end gap-3 animate-[fadeIn_160ms_ease-out]">
        <div className="max-w-[82%] sm:max-w-[74%] rounded-2xl rounded-tr-sm bg-slate-900 dark:bg-blue-600 text-white px-4 py-3 shadow-xs">
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <div
          className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5"
          aria-hidden="true"
        >
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 animate-[fadeIn_180ms_ease-out]">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
          message.isError
            ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400'
            : 'bg-blue-50 dark:bg-blue-950/60 border-blue-200/80 dark:border-blue-800/70 text-blue-600 dark:text-blue-400'
        }`}
        aria-hidden="true"
      >
        {message.isError ? <AlertTriangle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div
        className={`flex-1 min-w-0 rounded-2xl rounded-tl-sm px-4 py-3.5 border ${
          message.isError
            ? 'bg-red-50/70 dark:bg-red-950/25 border-red-200 dark:border-red-900/70 text-red-900 dark:text-red-200'
            : 'bg-white dark:bg-slate-900/90 border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-100'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
              Veritas AI
            </span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{roleLabel}</span>
          </div>
          {!isStreaming && message.content && !message.isError && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleCopy}
                title="Copy response"
                aria-label="Copy response"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Copy</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onToggleSpeak(message.id, message.content)}
                title={isSpeaking ? 'Stop reading aloud' : 'Read aloud'}
                aria-label={isSpeaking ? 'Stop reading aloud' : 'Read aloud'}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isSpeaking
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <Square className="w-3 h-3 fill-current" />
                    <span className="hidden sm:inline">Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Listen</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {message.isError ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <div className="prose-chat">
            {message.content ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const isBlock = Boolean(className) || String(children).includes('\n');
                    if (isBlock) {
                      return <CodeBlock className={className}>{children}</CodeBlock>;
                    }
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  a({ href, children }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            ) : isStreaming ? (
              <div className="flex items-center gap-1.5 py-1 text-slate-400 dark:text-slate-500 text-sm">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.2s]" />
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.1s]" />
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
                <span className="ml-1.5 text-xs">Thinking...</span>
              </div>
            ) : null}
          </div>
        )}

        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-800">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Verified Web Sources
            </p>
            <div className="flex flex-wrap gap-1.5">
              {message.sources.map((src, idx) => (
                <a
                  key={`${src.uri}-${idx}`}
                  href={src.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors max-w-[240px]"
                >
                  <span className="truncate">{src.title}</span>
                  <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

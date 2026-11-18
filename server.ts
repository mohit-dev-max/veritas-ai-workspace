import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, type Content } from '@google/genai';
import { buildSystemInstruction } from './src/config/roles.ts';
import type { DepthLevel, GroundingSource, ModelOptionId, RoleId } from './src/types/chat.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '2mb' }));

const PORT = Number(process.env.PORT) || 3000;
const FRIENDLY_RATE_LIMIT_MESSAGE =
  'Server is busy right now, please wait 10 seconds and try again.';

function resolveModelCandidates(selectedModel?: ModelOptionId): string[] {
  switch (selectedModel) {
    case 'gemini-2.5-flash-lite':
      return ['gemini-2.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-4-hydrogen'];
    case 'gemini-pro':
      return ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'];
    case 'gemini-4-hydrogen':
      return ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'];
    case 'gemini-2.5-flash':
    default:
      return ['gemini-2.5-flash', 'gemini-3.1-flash-lite', 'gemini-4-hydrogen'];
  }
}

interface ChatRequestBody {
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  roleId?: RoleId;
  customRoleName?: string;
  depthLevel?: DepthLevel;
  hinglishMode?: boolean;
  adaptiveFormat?: boolean;
  activeFormatLabel?: string;
  activeFormatInstruction?: string;
  webSearchEnabled?: boolean;
  antiHallucinationEnabled?: boolean;
  selectedModel?: ModelOptionId;
}

function extractRawError(err: unknown): string {
  if (err instanceof Error) {
    const extra = err as Error & { status?: number; code?: number; statusCode?: number; errorDetails?: unknown };
    const statusPart = extra.status ?? extra.code ?? extra.statusCode;
    return statusPart ? `[Status ${statusPart}] ${err.message}` : err.message;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err ?? 'Unknown error');
  }
}

function isFallbackTriggerError(err: unknown): boolean {
  const rawMessage = err instanceof Error ? err.message : String(err ?? '');
  const lower = rawMessage.toLowerCase();
  const errObj = err as { status?: number; code?: number; statusCode?: number } | null;
  const numericStatus = errObj?.status ?? errObj?.code ?? errObj?.statusCode;
  return (
    numericStatus === 404 ||
    numericStatus === 503 ||
    lower.includes('not_found') ||
    lower.includes('404') ||
    lower.includes('503') ||
    lower.includes('unavailable') ||
    lower.includes('high demand') ||
    lower.includes('is not found for api version') ||
    lower.includes('is not supported for generatecontent')
  );
}

function classifyGeminiError(err: unknown): { status: number; message: string; rawError: string } {
  const rawError = extractRawError(err);
  const lower = rawError.toLowerCase();

  // Check HTTP status or SDK error properties safely
  const errObj = err as { status?: number; code?: number; statusCode?: number } | null;
  const numericStatus = errObj?.status ?? errObj?.code ?? errObj?.statusCode;

  if (
    numericStatus === 429 ||
    lower.includes('429') ||
    lower.includes('resource_exhausted') ||
    lower.includes('quota') ||
    lower.includes('rate limit')
  ) {
    return { status: 429, message: FRIENDLY_RATE_LIMIT_MESSAGE, rawError };
  }

  if (
    numericStatus === 503 ||
    lower.includes('503') ||
    lower.includes('unavailable') ||
    lower.includes('high demand')
  ) {
    return {
      status: 503,
      message: 'Server is experiencing high demand right now, please wait 10 seconds and try again.',
      rawError,
    };
  }

  if (
    numericStatus === 400 ||
    numericStatus === 401 ||
    numericStatus === 403 ||
    lower.includes('api_key_invalid') ||
    lower.includes('api key not valid') ||
    lower.includes('permission_denied') ||
    lower.includes('unauthenticated')
  ) {
    return {
      status: 401,
      message:
        'Unable to authenticate with Gemini using the active API key. Please check your Gemini integration or backup key.',
      rawError,
    };
  }

  if (numericStatus === 404 || lower.includes('not_found')) {
    return {
      status: 404,
      message: 'The requested Gemini model is currently unavailable. Please try again shortly.',
      rawError,
    };
  }

  return {
    status: 500,
    message: 'Unable to reach Gemini right now. Please try again in a moment.',
    rawError,
  };
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    hasServerKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
  });
});

app.post('/api/chat', async (req, res) => {
  const headerKey = req.header('x-gemini-api-key')?.trim();
  const envKey = process.env.GEMINI_API_KEY?.trim();
  const effectiveKey =
    headerKey && headerKey.length > 0
      ? headerKey
      : envKey && envKey !== 'MY_GEMINI_API_KEY'
      ? envKey
      : '';

  if (!effectiveKey) {
    const missingMsg = 'Built-in GEMINI_API_KEY is not configured on the server.';
    res.status(401).json({
      error: missingMsg,
      rawError: missingMsg,
    });
    return;
  }

  const body = (req.body ?? {}) as ChatRequestBody;
  const incomingMessages = Array.isArray(body.messages) ? body.messages : [];

  if (incomingMessages.length === 0) {
    res.status(400).json({ error: 'Please enter a message before sending.' });
    return;
  }

  const roleId: RoleId = body.roleId ?? 'general';
  const customRoleName = body.customRoleName;
  const depthLevel: DepthLevel = body.depthLevel ?? 'intermediate';
  const hinglishMode = Boolean(body.hinglishMode);
  const adaptiveFormat = Boolean(body.adaptiveFormat);
  const activeFormatLabel = body.activeFormatLabel;
  const activeFormatInstruction = body.activeFormatInstruction;
  const webSearchEnabled = Boolean(body.webSearchEnabled);
  const antiHallucinationEnabled = body.antiHallucinationEnabled !== false;
  const selectedModel: ModelOptionId = body.selectedModel ?? 'gemini-2.5-flash';
  const modelCandidates = resolveModelCandidates(selectedModel);

  const systemInstruction = buildSystemInstruction({
    roleId,
    customRoleName,
    depthLevel,
    hinglishMode,
    adaptiveFormat,
    activeFormatLabel,
    activeFormatInstruction,
    antiHallucinationEnabled,
  });

  // Convert conversation messages to @google/genai Content[]
  const contents: Content[] = incomingMessages
    .filter((m) => m.content && m.content.trim().length > 0)
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  if (contents.length === 0) {
    res.status(400).json({ error: 'Please enter a valid message.' });
    return;
  }

  const ai = new GoogleGenAI({
    apiKey: effectiveKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Set up SSE headers and flush immediately
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  res.write(': connected\n\n');

  const sendEvent = (payload: Record<string, unknown>) => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
  };

  let lastError: unknown = null;
  let succeeded = false;
  const fallbackWarnings: string[] = [];

  for (const modelName of modelCandidates) {
    let streamedAnyChunk = false;
    try {
      console.log(`[Veritas AI] Requesting stream from model "${modelName}" (requested=${selectedModel}, keySource=${headerKey ? 'custom' : 'env'})`);
      const stream = await ai.models.generateContentStream({
        model: modelName,
        contents,
        config: {
          systemInstruction,
          ...(selectedModel === 'gemini-pro' && modelName === 'gemini-4-hydrogen'
            ? { thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } }
            : {}),
          ...(webSearchEnabled ? { tools: [{ googleSearch: {} }] } : {}),
        },
      });

      const sourceMap = new Map<string, GroundingSource>();

      for await (const chunk of stream) {
        if (res.writableEnded) break;

        const text = chunk.text;
        if (text) {
          streamedAnyChunk = true;
          sendEvent({ type: 'chunk', text });
        }

        const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (Array.isArray(groundingChunks)) {
          for (const gChunk of groundingChunks) {
            const web = gChunk?.web;
            if (web?.uri) {
              sourceMap.set(web.uri, {
                uri: web.uri,
                title: web.title || web.uri,
              });
            }
          }
        }
      }

      if (sourceMap.size > 0) {
        sendEvent({ type: 'grounding', sources: Array.from(sourceMap.values()) });
      }

      sendEvent({
        type: 'done',
        model: modelName,
        ...(fallbackWarnings.length > 0 ? { fallbackWarnings } : {}),
      });
      succeeded = true;
      break;
    } catch (err) {
      lastError = err;
      const raw = extractRawError(err);
      console.error(`[Veritas AI] Model "${modelName}" failed:`, raw);

      // Only fall back to the next candidate if no output was streamed yet and it's a 404/503 availability error
      if (!streamedAnyChunk && isFallbackTriggerError(err)) {
        fallbackWarnings.push(`Model "${modelName}" unavailable: ${raw}`);
        continue;
      }
      break;
    }
  }

  if (!succeeded && lastError) {
    const classified = classifyGeminiError(lastError);
    sendEvent({
      type: 'error',
      status: classified.status,
      message: classified.message,
      rawError: classified.rawError,
      fallbackWarnings,
    });
  }

  if (!res.writableEnded) {
    res.end();
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Veritas AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

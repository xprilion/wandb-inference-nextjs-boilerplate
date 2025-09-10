import OpenAI from 'openai';

// WandB Inference client configuration
export function createWandbClient(apiKey?: string, project?: string) {
  const finalApiKey = apiKey || process.env.WANDB_API_KEY || process.env.OPENAI_API_KEY;

  if (!finalApiKey) {
    throw new Error('WandB API key is required');
  }

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${finalApiKey}`,
  };

  if (project && project.trim()) {
    defaultHeaders['OpenAI-Project'] = project.trim();
  }

  return new OpenAI({
    baseURL: 'https://api.inference.wandb.ai/v1',
    apiKey: finalApiKey,
    defaultHeaders,
  });
}

// Helper function to extract settings from request headers
export function getSettingsFromHeaders(request: Request) {
  const apiKey = request.headers.get('X-WandB-API-Key');
  const project = request.headers.get('OpenAI-Project') || undefined;
  
  return { apiKey, project };
}

// Available models for different tasks
export const MODELS = {
  TEXT_GENERATION: {
    'openai/gpt-oss-20b': 'GPT OSS 20B',
    'openai/gpt-oss-120b': 'GPT OSS 120B',
    'meta-llama/Llama-3.3-70B-Instruct': 'Llama 3.3 70B',
    'meta-llama/Llama-3.1-8B-Instruct': 'Llama 3.1 8B',
    'moonshotai/Kimi-K2-Instruct': 'Kimi K2 Instruct',
    'microsoft/Phi-4-mini-instruct': 'Phi-4 Mini',
  },
  REASONING: {
    'deepseek-ai/DeepSeek-R1-0528': 'DeepSeek R1',
    'deepseek-ai/DeepSeek-V3-0324': 'DeepSeek V3',
    'Qwen/Qwen3-235B-A22B-Thinking-2507': 'Qwen3 235B Thinking',
    'Qwen/Qwen3-235B-A22B-Instruct-2507': 'Qwen3 235B Instruct',
  },
  CODE: {
    'Qwen/Qwen3-Coder-480B-A35B-Instruct': 'Qwen3 Coder 480B',
    'deepseek-ai/DeepSeek-V3-0324': 'DeepSeek V3',
  },
  VISION: {
    'meta-llama/Llama-4-Scout-17B-16E-Instruct': 'Llama 4 Scout Vision',
  },
} as const;

// All models list for easy access
export const ALL_MODELS = {
  'openai/gpt-oss-20b': 'GPT OSS 20B',
  'openai/gpt-oss-120b': 'GPT OSS 120B',
  'Qwen/Qwen3-235B-A22B-Instruct-2507': 'Qwen3 235B Instruct',
  'deepseek-ai/DeepSeek-R1-0528': 'DeepSeek R1',
  'deepseek-ai/DeepSeek-V3-0324': 'DeepSeek V3',
  'meta-llama/Llama-4-Scout-17B-16E-Instruct': 'Llama 4 Scout Vision',
  'meta-llama/Llama-3.3-70B-Instruct': 'Llama 3.3 70B',
  'moonshotai/Kimi-K2-Instruct': 'Kimi K2 Instruct',
  'Qwen/Qwen3-235B-A22B-Thinking-2507': 'Qwen3 235B Thinking',
  'meta-llama/Llama-3.1-8B-Instruct': 'Llama 3.1 8B',
  'Qwen/Qwen3-Coder-480B-A35B-Instruct': 'Qwen3 Coder 480B',
  'microsoft/Phi-4-mini-instruct': 'Phi-4 Mini',
} as const;

export type ModelCategory = keyof typeof MODELS;
export type ModelId = string;

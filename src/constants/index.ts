export const LANGUAGE_MAP: Record<string, string> = {
  en: "English",
  my: "Myanmar",
  de: "German",
};

const favicon = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

export const AI_PROVIDERS = [
  { id: "openai", name: "OpenAI", baseUrl: "https://api.openai.com/v1", icon: favicon("openai.com") },
  { id: "google", name: "Google Gemini", baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai", icon: favicon("ai.google.dev") },
  { id: "groq", name: "Groq", baseUrl: "https://api.groq.com/openai/v1", icon: favicon("groq.com") },
  { id: "openrouter", name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", icon: favicon("openrouter.ai") },
  { id: "together", name: "Together AI", baseUrl: "https://api.together.xyz/v1", icon: favicon("together.ai") },
  { id: "fireworks", name: "Fireworks AI", baseUrl: "https://api.fireworks.ai/inference/v1", icon: favicon("fireworks.ai") },
  { id: "mistral", name: "Mistral AI", baseUrl: "https://api.mistral.ai/v1", icon: favicon("mistral.ai") },
  { id: "deepseek", name: "DeepSeek", baseUrl: "https://api.deepseek.com", icon: favicon("deepseek.com") },
  { id: "perplexity", name: "Perplexity", baseUrl: "https://api.perplexity.ai", icon: favicon("perplexity.ai") },
  { id: "xai", name: "xAI (Grok)", baseUrl: "https://api.x.ai/v1", icon: favicon("x.ai") },
  { id: "cerebras", name: "Cerebras", baseUrl: "https://api.cerebras.ai/v1", icon: favicon("cerebras.ai") },
  { id: "sambanova", name: "SambaNova", baseUrl: "https://api.sambanova.ai/v1", icon: favicon("sambanova.ai") },
  { id: "custom", name: "Custom", baseUrl: "", icon: "" },
] as const;

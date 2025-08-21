const OLLAMA_MODEL = process.env.MODEL_NAME || 'gemma3:1b';
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

export const ollamaConfig = {
    baseUrl: `${OLLAMA_URL}/v1`,
    model: OLLAMA_MODEL
};

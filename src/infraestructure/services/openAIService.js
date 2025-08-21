import OpenAI from 'openai';
import { ollamaConfig } from '../../../config/ollama.js';

export const OpenAiClient = new OpenAI({
    baseURL: ollamaConfig.baseUrl,
    apiKey: 'ollama'
});
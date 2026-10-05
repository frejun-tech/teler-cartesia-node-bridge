import { config } from './config';

const DEFAULT_SYSTEM_PROMPT = "You are a helpful and friendly voice assistant. Keep your responses concise, natural, and conversational. Speak clearly and at a moderate pace.";

export const getAgentConfig = (stream_id: string) => JSON.stringify({
    event: "start",
    stream_id: stream_id,
    config: {
        input_format: "pcm_16000",
        output_format: "pcm_16000"
    },
    agent: {
        id: config.cartesiaAgentId,
        system_prompt: config.cartesiaSystemPrompt || DEFAULT_SYSTEM_PROMPT,
        behaviors: {
            interruption_enabled: false
        }
    }
});
import { config } from './config';

// Cartesia Agent Configuration for WebSocket Stream
// Reference: https://docs.cartesia.ai/line/integrations/websocket-api
//
// Audio flow:
// - Input: 16kHz PCM from Teler
// - Processing: Cartesia agent processes audio
// - Output: 16kHz PCM from Cartesia → Resampled to 8kHz for Teler

const DEFAULT_SYSTEM_PROMPT = "You are a helpful and friendly voice assistant. Keep your responses concise, natural, and conversational. Speak clearly and at a moderate pace.";

export const getAgentConfig = () => {
    return {
        event: "start",
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
    };
};

export const agentConfig = JSON.stringify(getAgentConfig());
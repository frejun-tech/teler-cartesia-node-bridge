import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port:                       Number(process.env.PORT) || 8000,
    nodeEnv:                    process.env.NODE_ENV || 'development',
    serverDomain:               process.env.SERVER_DOMAIN || 'your_fallback_domain',
    
    telerKey:                   process.env.TELER_API_KEY || '',
    telerSampleRate:            process.env.TELER_SAMPLE_RATE || "16k",
    telerChunkSize:             Number(process.env.TELER_CHUNK_SIZE) || 500,
    
    cartesiaAgentId:            process.env.CARTESIA_AGENT_ID || '',
    cartesiaBaseURL:            process.env.CARTESIA_BASE_URL || '',
    cartesiaApiKey:             process.env.CARTESIA_API_KEY || '',
    cartesiaSampleRate:         Number(process.env.CARTESIA_SAMPLE_RATE) || 16000,
    cartesiaBufferSize:         Number(process.env.CARTESIA_MESSAGE_BUFFER_SIZE) || 20,
} as const;
export const agentConfig = JSON.stringify({
    event: "start",
    config: {
        input_format: "pcm_16000",
        output_format: "pcm_8000"
    },
    agent: {
        introduction: "Hello, I'm an AI assistant",
        system_prompt: "### Your Role \n You are a helpful assistant. Keep your voice stable"
    },
});
import { StreamData, StreamHandlerResult, StreamOP } from "@frejun/teler";
import { agentConfig } from "../core/agentConfig";
import { AudioResampler } from "./audioResampler";

let isAck = false;
let isStart = false;
const audioResampler = new AudioResampler();

export const callStreamHandler = async (message: StreamData): Promise<StreamHandlerResult> => {
    try {
        if(isAck && typeof message === "string") {
            const data = JSON.parse(message);
    
            if(data["type"] === "audio") {
                const audioB64 = data["data"]["audio_b64"];
                const cartesiaPayload = JSON.stringify({
                    event: "media_input",
                    stream_id: data["stream_id"],
                    media: {
                        payload: audioB64
                    }
                })
                return [cartesiaPayload, StreamOP.RELAY];
            }
        } else if(!isStart) {
            isStart = true;
            return [agentConfig, StreamOP.RELAY];
        }

        return ['', StreamOP.PASS];
    } catch(err) {
        console.log("Error in call stream handler", err);
        return ['', StreamOP.PASS];
    }
}

export const remoteStreamHandler = () => {
    let chunkId = 1
    const CHUNK_SIZE = 320;
    let chunkBuffer = Buffer.alloc(0);

    const handler = async(message: StreamData): Promise<StreamHandlerResult> => {
        try {
            if(typeof message === "string") {
                const control = JSON.parse(message);
                const event = control?.event;

                if(event === "ack") {
                    isAck = true;
                    console.log(`Cartesia Acknowledged the configuration`);

                } else if(event === 'media_output') {
                    const audio16k       = control["media"]["payload"] || '';
                    const audio16kBuffer = Buffer.from(audio16k, "base64");
                    const audio8kBuffer  = audioResampler.resample(audio16kBuffer, 16000, 8000);

                    chunkBuffer = Buffer.concat([chunkBuffer, audio8kBuffer]);
                    if (chunkBuffer.length >= CHUNK_SIZE) {
                        const chunk = chunkBuffer.subarray(0, CHUNK_SIZE);
                        chunkBuffer = chunkBuffer.subarray(CHUNK_SIZE);

                        const payload = JSON.stringify({
                            type: "audio",
                            audio_b64: chunk.toString("base64"),
                            chunk_id: chunkId++,
                        });
                        console.info("Relaying to Teler...");
                        
                        return [payload, StreamOP.RELAY];
                    }
                    
                } else if (event === 'clear') {
                    console.log(`Flushing buffer of ${chunkBuffer.length} chunks on speech stop`);
                    chunkBuffer = Buffer.alloc(0);
                    const payload = JSON.stringify({
                        type: "clear"
                    });
                    return [payload, StreamOP.RELAY];
                    
                } else {
                    console.log(`Cartesia Error: ${JSON.stringify(control)}`);
                }
            }
            return ['', StreamOP.PASS];
            
        } catch (error) {
            console.warn(`Error in remote stream handler: ${error}`);
            chunkBuffer = Buffer.alloc(0);
            return ['', StreamOP.PASS];
        }
    }

    return handler;
}
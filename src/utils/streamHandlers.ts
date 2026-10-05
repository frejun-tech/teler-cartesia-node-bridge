import { StreamData, StreamHandlerResult, StreamOP } from "@frejun/teler";
import { getAgentConfig } from "../core/agentConfig";
import { telerClient } from "./telerClient";
import { Call } from "../models/calls";

export const callStreamHandler = (call: Call) => {
    const handler = async (message: StreamData): Promise<StreamHandlerResult> => {
        try {
            const data = JSON.parse(message.toString());
            if (data["type"] === "start") {
                call.id = data?.call_id;
            } else if(call.isAcked) {
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
            } else if(!call.isStartSent) {
                call.isStartSent = true;
                const stream_id = data?.stream_id;
                const agentConfig = getAgentConfig(stream_id);
                return [agentConfig, StreamOP.RELAY];
            }
            return ['', StreamOP.PASS];
        } catch(err) {
            console.log("Error in call stream handler", err);
            return ['', StreamOP.PASS];
        }
    }
    return handler;
}

export const remoteStreamHandler = (call: Call) => {
    let chunkId = 1
    const CHUNK_SIZE = 10;
    let messageBuffer: Buffer[] = [];

    function _flush_buffer() {
        const audioData = Buffer.concat(messageBuffer);
        const resampledAudio = call.audioProcessor.downsample(audioData);

        const payload = JSON.stringify({
            type: "audio",
            audio_b64: resampledAudio.toString("base64"),
            chunk_id: chunkId++,
        });
        messageBuffer.length = 0;
        return payload;
    }

    const handler = async(message: StreamData): Promise<StreamHandlerResult> => {
        try {
            const control = JSON.parse(message.toString());
            const event = control?.event;

            if(event === "ack") {
                call.isAcked = true;
                console.log(`Cartesia Acknowledged the configuration`);
            } else if(event === 'media_output') {
                const audioData = control["media"]["payload"] || '';
                messageBuffer.push(Buffer.from(audioData, 'base64'));

                if (messageBuffer.length >= CHUNK_SIZE) {
                    return [_flush_buffer(), StreamOP.RELAY];
                }
            } else if (event === 'clear') {
                console.log(`Flushing buffer of ${messageBuffer.length} chunks on speech stop`);
                messageBuffer.length = 0;
                const payload = JSON.stringify({
                    type: "clear"
                });
                return [payload, StreamOP.RELAY];
            } else if (event === 'transfer_call') {
                console.log(`The agent want's to transfer the call to a humana representative.`);
                const destination_number = control?.transfer?.target_phone_number || null;
                if (destination_number === null) {
                    console.warn("No destination number selected.");
                } else {
                    const transfer_result = telerClient.voice.operations.transfer(call.id!, {
                        target: destination_number
                    });
                    console.log(`Call transfer result: ${transfer_result}`);
                }
            } else if (event === "turn_output_text_delta") {
                console.debug(`Agent transcript: ${JSON.stringify(control)}`);
            }
            else {
                console.log(`Cartesia Error: ${JSON.stringify(control)}`);
            }
            return ['', StreamOP.PASS];
        } catch (error) {
            console.warn(`Error in remote stream handler: ${error}`);
            messageBuffer.length = 0;
            return ['', StreamOP.PASS];
        }
    }

    return handler;
}
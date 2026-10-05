import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { StreamConnector } from '@frejun/teler';
import { StreamType }      from '@frejun/teler';
import { callStreamHandler, remoteStreamHandler } from './streamHandlers';
import { config } from '../core/config';
import { CartesiaClient } from './cartesiaClient';
import { telerClient } from './telerClient';
import { Call } from '../models/calls';

export const wss = new WebSocketServer({ noServer: true });

wss.on('connection', async (telerWs: WebSocket) => {
    console.log('Teler connected to WebSocket');

    const cartesiaClient = new CartesiaClient(config.cartesiaBaseURL, config.cartesiaApiKey, config.cartesiaAgentId);
    const isToken = await cartesiaClient.getToken();

    if(!isToken) {
        console.error("Cartesia Access Token not found.")
        telerWs.close(1008, "Cartesia didn't responded with a Access Token.");
        return;
    }
    
    const remoteHeaders = cartesiaClient.getHeaders();
    const call = new Call();
    const connector = telerClient.streamConnector.create(
        cartesiaClient.wsURL,
        callStreamHandler(call),
        remoteStreamHandler(call),
        StreamType.BIDIRECTIONAL,
        remoteHeaders
    );

    await connector.bridgeStream(telerWs);
});

export const handleUpgrade = (request: IncomingMessage, socket: Socket, head: Buffer) => {
    if (request.url === '/api/v1/media-stream') {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws);
        });
    } else {
        socket.destroy();
    }
};
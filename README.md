# Teler-Cartesia-Node-Bridge

A reference integration between Teler and CARTESIA in Node, based on [Media Streaming Bridge](https://frejun.ai/docs/category/media-streaming/) over WebSockets.


## Setup

1. **Clone and configure:**

   ```bash
   git clone https://github.com/rupak-stack/teler-cartesia-node-bridge.git
   cd teler-cartesia-node-bridge
   cp .env.example .env
   # Edit .env with your actual values
   ```

2. **Run with Docker:**
   ```bash
   docker compose up -d --build
   ```


## Environment Variables

The following environment variables are required to configure the server, Teler integration, and Cartesia integration.

| Variable | Description | Default |
|---|---|---|
| `PORT` | Port on which the application server runs. | `8000` |
| `SERVER_DOMAIN` | Domain and port where the server is accessible. | `localhost:8000` |
| `TELER_API_KEY` | API key used to authenticate with the Teler voice platform. | **Required** |
| `TELER_SAMPLE_RATE` | Audio sample rate used for Teler audio streaming. | `16k` |
| `TELER_CHUNK_SIZE` | Size of each audio chunk sent by Teler during streaming. | `400` |
| `CARTESIA_AGENT_ID` | ID of the Cartesia agent to use for voice interactions. | **Required** |
| `CARTESIA_BASE_URL` | Base URL for the Cartesia API, without the `https://` protocol prefix. | `api.cartesia.ai` |
| `CARTESIA_API_KEY` | API key used to authenticate with Cartesia. | **Required** |
| `CARTESIA_SAMPLE_RATE` | Audio sample rate used for Cartesia audio processing. This should be `16000` (16 kHz). | `16000` |
| `CARTESIA_MESSAGE_BUFFER_SIZE` | Number of messages buffered from the Cartesia stream before streaming to Teler. | `10` |
| `CARTESIA_SYSTEM_PROMPT` | System prompt that controls the Cartesia agent's behavior, response style, and conversational instructions. | See `.env.example` |

## API Endpoints

- `GET /` - Health check with server domain
- `GET /health` - Service status
- `GET /ngrok-status` - Current ngrok status and URL
- `POST /api/v1/calls/initiate-call` - Start a new call with dynamic phone numbers
- `POST /api/v1/calls/flow` - Get call flow configuration
- `WebSocket /api/v1/calls/media-stream` - Audio streaming
- `POST /api/v1/webhooks/receiver` - Teler webhook receiver

### Call Initiation Example

```bash
curl -X POST "https://your_ngrok_domain/api/v1/calls/initiate-call" \
  -H "Content-Type: application/json" \
  -d '{
    "from_number": "+918064xxx",
    "to_number": "+919967xxx"
  }'
```

## Features

- **Bi-directional media streaming** - Bridges audio between Teler and Cartesia (Voice API) over WebSockets.
- **Real-time audio handling** - Receives live audio chunks from Teler, processes them, and forwards to Cartesia; streams responses back to Teler.
- **Dockerized setup** - Comes with Dockerfile and docker-compose.yaml for easy local development and deployment.
- **Dynamic ngrok URL detection** - Automatically detects current ngrok domain

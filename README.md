# SATYNX AI Chat

A multi-model, streaming AI orchestration layer for SATYNX conversations, powered by OpenAI and Google Gemini models.

## Features

- **Multi-Provider Support**: Works with both OpenAI and Google Gemini models
- **Real-time Streaming**: Progressive token streaming for responsive conversations
- **Smart Context Management**: Automatic conversation summarization for long discussions
- **Quick Actions**: AI-generated follow-up suggestions
- **Provider Switching**: Switch between models without code changes
- **Rate Limit Friendly**: Built-in retry logic with exponential backoff
- **Secure**: Automatic secret redaction from logs

## Supported Models

### OpenAI Models
- `gpt-4o` - Latest GPT-4o model with multimodal capabilities
- `gpt-4o-mini` - Fast and efficient GPT-4o Mini model (default)
- `gpt-3.5-turbo` - Fast and cost-effective chat model

### Google Models
- `gemini-1.5-pro` - Google's most capable multimodal model
- `gemini-1.5-flash` - Fast and efficient Google model

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL="file:./dev.db"

# Auth.js / NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"

# AI Provider API Keys (at least one required)
OPENAI_API_KEY="sk-your-openai-api-key-here"
GOOGLE_GENAI_API_KEY="your-google-generative-ai-api-key-here"

# Optional: GitHub OAuth
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Email (magic link)
EMAIL_SERVER="smtp://user:pass@localhost:1025"
EMAIL_FROM="no-reply@example.com"
```

### API Key Setup

1. **OpenAI API Key**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Must start with `sk-`
   - Required for OpenAI models

2. **Google AI API Key**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Required for Gemini models

## API Usage

### POST /api/agent

Send a message to the AI orchestrator.

**Request Body:**
```json
{
  "conversationId": "optional-conversation-id",
  "message": "Your message here",
  "model": "gpt-4o-mini", // optional, defaults to user's preference or gpt-4o-mini
  "systemPromptOverrides": "Custom system prompt", // optional
  "temperature": 0.7, // optional, defaults to 0.7
  "maxTokens": 1000 // optional
}
```

**Response:** Server-Sent Events (SSE) stream
```
data: Hello! How can I help you today?

data: I can assist you with a wide variety of tasks.

event: done
data: [DONE]
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-auth-token" \
  -d '{
    "message": "Hello, how are you?",
    "model": "gpt-4o-mini"
  }'
```

## Architecture

### Provider Management (`lib/ai/providers.ts`)
- Centralized API key handling
- Model metadata and capabilities
- Provider-specific configuration
- Environment validation

### Agent Orchestrator (`lib/ai/agent.ts`)
- Multi-model conversation processing
- Context loading and management
- Conversation summarization
- Quick action generation
- Streaming response handling

### API Endpoint (`app/api/agent/route.ts`)
- Authentication and validation
- Rate limiting and retry logic
- SSE streaming implementation
- Error handling and logging

## Development

### Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up your environment variables in `.env`

3. Set up the database:
```bash
npm run db:migrate
```

4. Start the development server:
```bash
npm run dev
```

### Testing the API

You can test the agent endpoint using the provided test script or curl commands:

```bash
# Test with default model
curl -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'

# Test with specific model
curl -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about quantum computing", "model": "gemini-1.5-pro"}'
```

## Error Handling

The API returns structured error responses:

```json
{
  "error": "Human readable error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

Common error codes:
- `UNAUTHORIZED` - Authentication required
- `VALIDATION_ERROR` - Invalid request data
- `UNSUPPORTED_MODEL` - Model not supported
- `RATE_LIMITED` - Too many requests
- `INVALID_API_KEY` - API key configuration error
- `INTERNAL_ERROR` - Server error

## Security

- API keys are automatically redacted from logs
- Environment validation prevents misconfiguration
- Authentication required for all requests
- Rate limiting friendly with exponential backoff
- CORS headers configured for cross-origin requests

## Deployment

### Vercel (Recommended)
The application is optimized for deployment on Vercel with Node.js runtime support for the agent endpoint.

### Environment Variables
Ensure all required environment variables are set in your deployment platform.

### Database
The application uses SQLite by default for development. For production, consider switching to PostgreSQL by updating the `DATABASE_URL` and `datasource` in `prisma/schema.prisma`.

## Contributing

1. Follow the existing code style and patterns
2. Add appropriate error handling
3. Include documentation for new features
4. Test with multiple providers when applicable

## License

This project is licensed under the MIT License.
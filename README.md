# Gemini-OpenAI Proxy Server

A simple Node.js proxy server that makes Google's Gemini API compatible with OpenAI's API format, specifically designed for Xcode 26's LLM provider integration.

## Problem

Xcode 26 expects OpenAI-compatible APIs to follow a specific URL structure where the base URL excludes the `/v1/` path segment. However, Google's Gemini OpenAI-compatible API uses a different structure:

- **Xcode expects**: `https://api.openai.com/` (appends `/v1/models` etc.)
- **Gemini uses**: `https://generativelanguage.googleapis.com/v1beta/openai/`

This proxy bridges that gap by translating URL paths and handling authentication properly.

## Features

- ✅ Translates OpenAI API paths to Gemini's format
- ✅ Handles Bearer token authentication
- ✅ CORS support for web applications
- ✅ Request/response logging
- ✅ Health check endpoint
- ✅ Graceful shutdown handling

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- Google Gemini API key ([Get one here](https://aistudio.google.com/apikey))

### Installation

1. **Clone or download the files**:
   ```bash
   mkdir gemini-proxy && cd gemini-proxy
   ```

2. **Save the server code** as `server.js` and **package.json**

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Add your API key** to `server.js`:
   ```javascript
   const GOOGLE_API_KEY = "your-actual-api-key-here";
   ```

5. **Start the server**:
   ```bash
   npm start
   ```

The server will run on `http://localhost:3000`

## Usage

### For Xcode 26

1. **Open Xcode 26** and go to LLM provider settings
2. **Add a custom provider** with:
   - **Base URL**: `http://localhost:3000/`
   - **API Key**: Your Google Gemini API key
3. **Select a Gemini model** like `gemini-2.0-flash`

### Testing the Proxy

Visit the status page:
```
http://localhost:3000/
```

Test the models endpoint:
```bash
curl "http://localhost:3000/v1/models" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Health check:
```bash
curl http://localhost:3000/health
```

## How It Works

The proxy performs these transformations:

| Xcode Request | Proxy Transforms To |
|---------------|-------------------|
| `GET /v1/models` | `GET /v1beta/openai/models` |
| `POST /v1/chat/completions` | `POST /v1beta/openai/chat/completions` |
| `POST /v1/embeddings` | `POST /v1beta/openai/embeddings` |

**Authentication**: Converts API keys to proper `Authorization: Bearer` headers required by Gemini's OpenAI-compatible endpoint.

## Configuration

### Environment Variables (Optional)

Instead of hardcoding the API key, you can use an environment variable:

```bash
export GOOGLE_API_KEY="your-api-key"
npm start
```

Then update `server.js`:
```javascript
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "fallback-key-here";
```

### Custom Port

Change the port in `server.js`:
```javascript
const PORT = 3001; // or any available port
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Status page with server info |
| `/health` | GET | Health check (JSON response) |
| `/v1/*` | ALL | Proxied to Gemini API |

## Supported Gemini Models

- `gemini-2.0-flash` (recommended)
- `gemini-2.5-flash-preview-04-17`
- `gemini-1.5-pro`
- `gemini-1.5-flash`
- `text-embedding-004` (for embeddings)

## Troubleshooting

### "Cannot GET /" Error
This is normal! The proxy doesn't serve the root path by default. Visit the specific endpoints or restart with the updated code that includes a status page.

### Authentication Errors
- Verify your API key is correct
- Check that it's properly set in the `GOOGLE_API_KEY` variable
- Ensure no extra quotes or spaces around the key

### Connection Refused in Xcode
- Make sure the proxy server is running (`npm start`)
- Verify the base URL is `http://localhost:3000/` (with trailing slash)
- Check that port 3000 isn't blocked by firewall

### Rate Limiting
Google's API has rate limits. If you hit them, you'll see 429 errors. Consider adding request queuing for production use.

## Security Notes

⚠️ **Important**: This setup is for development/testing only.

- API key is stored in plain text
- No HTTPS (use ngrok or similar for remote access)
- No request validation or rate limiting
- Consider using environment variables for production

For production use:
- Use environment variables for secrets
- Add HTTPS with proper certificates
- Implement request validation and rate limiting
- Add proper logging and monitoring

## Contributing

Feel free to submit issues and pull requests! Areas for improvement:

- [ ] Environment variable configuration
- [ ] HTTPS support
- [ ] Request rate limiting
- [ ] Better error handling
- [ ] Docker support
- [ ] Configuration file support

## License

MIT License - feel free to use this for any purpose.

## Related Links

- [Google Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Gemini OpenAI Compatibility](https://ai.google.dev/gemini-api/docs/openai)
- [Get Gemini API Key](https://aistudio.google.com/apikey)
- [Xcode 16 Documentation](https://developer.apple.com/xcode/)

---

**Made with ❤️ for developers who want to use Gemini with Xcode 26**

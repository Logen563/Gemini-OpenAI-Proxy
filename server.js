const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

// Your Google API key - replace with your actual API key
const GOOGLE_API_KEY = "YOUR_ACTUAL_API_KEY_HERE";

if (!GOOGLE_API_KEY || GOOGLE_API_KEY === "YOUR_ACTUAL_API_KEY_HERE") {
  console.error('Please replace YOUR_ACTUAL_API_KEY_HERE with your actual Google API key in the code');
  process.exit(1);
}

// Middleware to handle JSON bodies
app.use(express.json());

// Proxy configuration
const proxyOptions = {
  target: 'https://generativelanguage.googleapis.com',
  changeOrigin: true,
  pathRewrite: {
    '^/v1': '/v1beta/openai' // Rewrite /v1/* to /v1beta/openai/*
  },
  onProxyReq: (proxyReq, req, res) => {
    // Handle authentication for OpenAI-compatible API
    if (req.headers.authorization) {
      // If there's already an authorization header, pass it through
      proxyReq.setHeader('Authorization', req.headers.authorization);
    } else {
      // Otherwise, use our API key
      proxyReq.setHeader('Authorization', `Bearer ${GOOGLE_API_KEY}`);
    }
    
    console.log(`Proxying: ${req.method} ${req.path} -> ${proxyReq.path}`);
    console.log(`Auth header: ${proxyReq.getHeader('Authorization') ? 'Set' : 'Not set'}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    // Add CORS headers if needed
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
};

// Create proxy middleware
const proxy = createProxyMiddleware(proxyOptions);

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// Apply proxy to all /v1/* routes
app.use('/v1', proxy);

// Root endpoint - simple status page
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Gemini-OpenAI Proxy</title></head>
      <body>
        <h1>🚀 Gemini-OpenAI Proxy Server</h1>
        <p><strong>Status:</strong> Running</p>
        <p><strong>Usage:</strong> Use <code>http://localhost:${PORT}/</code> as your base URL in Xcode</p>
        <p><strong>API Key:</strong> ${GOOGLE_API_KEY ? '✅ Set' : '❌ Not set'}</p>
        <h3>Test Endpoints:</h3>
        <ul>
          <li><a href="/health">Health Check</a></li>
          <li><a href="/v1/models">Models Endpoint</a></li>
        </ul>
      </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Gemini-to-OpenAI proxy server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`📝 Use this URL in Xcode: http://localhost:${PORT}/`);
  console.log(`🔑 Make sure GOOGLE_API_KEY environment variable is set`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down proxy server...');
  process.exit(0);
});

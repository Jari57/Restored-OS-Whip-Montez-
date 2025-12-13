const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const morgan = require('morgan');
const winston = require('winston');
const fs = require('fs');

// Environment detection
const NODE_ENV = process.env.NODE_ENV || 'development';
const isDevelopment = NODE_ENV === 'development';
const isProduction = NODE_ENV === 'production';

// 🪵 WINSTON LOGGER SETUP
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'whip-montez-backend', env: NODE_ENV },
  transports: [
    // Error logs
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Combined logs
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Console output for development
if (isDevelopment) {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
} else {
  // Simplified console for production (Railway logs)
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

logger.info(`🚀 Starting server in ${NODE_ENV} mode`);

// 🟢 FORCE LOAD .ENV FROM CURRENT DIRECTORY (local dev only)
// In production (Railway), environment variables come from the platform
const envPath = path.resolve(__dirname, '.env');
try {
  const result = require('dotenv').config({ path: envPath });
  if (result.error && result.error.code !== 'ENOENT') {
    logger.warn('.env file not found - using platform environment variables');
  } else if (!result.error) {
    logger.info('.env file loaded successfully');
  }
} catch (e) {
  logger.warn('Could not load .env file - using platform environment variables', { error: e.message });
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// 🪵 REQUEST LOGGING
if (isDevelopment) {
  app.use(morgan('dev')); // Colorful logs for development
} else {
  // Production: Log to file and include more details
  const accessLogStream = fs.createWriteStream(
    path.join(logDir, 'access.log'),
    { flags: 'a' }
  );
  app.use(morgan('combined', { stream: accessLogStream }));
  app.use(morgan('tiny')); // Brief console output
}

// �️ RATE LIMITING - CRITICAL FOR PRODUCTION
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to API routes only
app.use('/api/', apiLimiter);

// Stricter limit for AI generation (most expensive operation)
const generationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 AI generations per minute
  message: 'AI generation rate limit exceeded. Please wait before trying again.',
  skipSuccessfulRequests: false
});

// 🟢 API KEY VALIDATION
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    logger.error('CRITICAL: GEMINI_API_KEY is missing!', { 
      env: NODE_ENV,
      envVars: Object.keys(process.env).filter(k => k.includes('GEMINI'))
    });
} else {
    logger.info(`API Key loaded successfully`, { 
      keyPrefix: apiKey.substring(0, 8),
      keyLength: apiKey.length 
    });
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(apiKey);

// Attempt to list available models at startup to help with debugging model selection.
(async () => {
  try {
    if (typeof genAI.listModels === 'function') {
      const models = await genAI.listModels();
      const sample = Array.isArray(models) ? models.slice(0, 20).map(m => m.name || m.model || JSON.stringify(m)) : JSON.stringify(models);
      logger.info('Available Gemini models fetched', { modelCount: sample.length, sample: sample.slice(0, 5) });
    } else {
      logger.info('listModels() not available on this SDK version');
    }
  } catch (err) {
    logger.warn('Could not list models at startup', { error: err?.message });
  }
})().catch(err => {
  logger.error('Fatal error during initialization', { error: err });
  // Don't exit the process - server should stay running even if models check fails
});

// ROOT ROUTE (Health Check)
app.get('/', (req, res) => {
  res.send('Whip Montez Backend System Online. Uplink Established.');
});

// 📊 MONITORING DASHBOARD
app.get('/dashboard', (req, res) => {
  logger.info('Dashboard accessed', { ip: req.ip });
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// DETAILED HEALTH CHECK
app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    },
    apiKey: apiKey ? 'configured' : 'missing',
    rateLimiting: 'active',
    nodeVersion: process.version,
    platform: process.platform
  };
  
  logger.debug('Health check requested', { ip: req.ip });
  res.json(healthStatus);
});

// MODELS ROUTE - returns available models that support generateContent
app.get('/api/models', async (req, res) => {
  try {
    if (!apiKey) {
      return res.status(500).json({ error: 'Server missing API Key. Check backend/.env' });
    }

    if (typeof genAI.listMgenerationLimiter, async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;
    
    // 🛡️ INPUT VALIDATION
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Invalid prompt' });
    }
    if (prompt.length > 10000) { // Prevent abuse with extremely long prompts
      return res.status(400).json({ error: 'Prompt too long (max 10,000 characters)' });
    }
    
    console.log(`[${new Date().toISOString()}] Generation request from ${req.ip}`
    const models = await genAI.listModels();
    // `models` may be an array of model objects. Filter those that advertise generateContent support.
    const supported = (Array.isArray(models) ? models : []).filter(m => {
      try {
        const methods = m.supportedGenerationMethods || m.supportedMethods || [];
        return Array.isArray(methods) && methods.includes('generateContent');
      } catch (e) { return false; }
    }).map(m => (m.name || m.model || '').toString().replace(/^models\//, ''));

    res.json({ models: supported });
  } catch (err) {
    res.status(500).json({ error: 'Model listing failed', details: err && err.message ? err.message : String(err) });
  }
});

// GENERATION ROUTE
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;
    logger.info('AI generation request', { 
      ip: req.ip, 
      promptLength: prompt.length,
      hasSystemInstruction: !!systemInstruction 
    });

    if (!apiKey) {
        throw new Error("Server missing API Key. Check backend/.env");
    }

    const desiredModel = process.env.GENERATIVE_MODEL || "gemini-2.0-flash-exp";
    const model = genAI.getGenerativeModel({ 
      model: desiredModel,
      systemInstruction: systemInstruction
    });

    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const duration = Date.now() - startTime;

    logger.info('Generation successful', { 
      ip: req.ip,
      duration: `${duration}ms`,
      outputLength: text.length,
      model: desiredModel
    });
    res.json({ output: text });

  } catch (error) {
    const msg = error && error.message ? error.message : String(error);
    const statusCode = error?.response?.status || error?.status || (msg.includes('429') ? 429 : 500);
    
    logger.error('Generation error', { 
      error: msg,
      statusCode,
      ip: req.ip,
      stack: error?.stack
    });

    // Handle quota / rate limit explicitly so the frontend can show a clear message
    if (statusCode === 429) {
      return res.status(429).json({
        error: 'Rate limited or quota exceeded',
        details: 'Gemini returned 429. Check billing/quotas for the GEMINI_API_KEY or switch to a lower-cost model (e.g., gemini-1.5-flash).'
      });
    }

    const suggestion = msg.toLowerCase().includes('not found') || msg.includes('404')
      ? 'Model not found for this API/version. Restart the server to see `listModels()` output, or set a supported model in backend/server.js or via env var `GENERATIVE_MODEL`.'
      : null;
    const details = suggestion ? `${msg} | SUGGESTION: ${suggestion}` : msg;
    res.status(500).json({ error: 'AI Generation Failed', details });
  }
});

const HOST = '0.0.0.0'; // Bind to all interfaces for Railway
const server = app.listen(PORT, HOST, () => {
  logger.info('Server started successfully', {
    host: HOST,
    port: PORT,
    environment: NODE_ENV,
    nodeVersion: process.version,
    platform: process.platform
  });
  logger.info(`🚀 Uplink Ready at http://${HOST}:${PORT}`);
});

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed successfully');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception - Server will restart', { error: err.message, stack: err.stack });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', { reason, promise });
  // Don't exit - keep server running even on unhandled rejections
});
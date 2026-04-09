import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import router from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.js';
import { globalLimiter } from './middleware/rateLimit.js';
import { validateInput } from './middleware/validation.js';
import { initDb } from './db/init.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// Request size limits - prevent large payload attacks
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Apply global rate limiting (before routes)
app.use(globalLimiter);

// Input validation middleware
app.use(validateInput);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// API routes
app.use('/api', router);

app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    await initDb();
    app.listen(PORT, () => console.log(`🚀 Library API running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start:', err.message);
    process.exit(1);
  }
}

start();

// Main Express server
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import chatRoutes from './routes/chat.js';
import usersRoutes from './routes/users.js';
import postsRoutes from './routes/posts.js';
import interactionsRoutes from './routes/interactions.js';
import followsRoutes from './routes/follows.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/interactions', interactionsRoutes);
app.use('/api/follows', followsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// --- SERVE FRONTEND ---
const buildPath = path.join(__dirname, '..', 'frontend', 'build');
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
const staticPath = fs.existsSync(distPath) ? distPath : buildPath;

if (fs.existsSync(staticPath)) {
  console.log(`Serving static files from: ${staticPath}`);
  app.use(express.static(staticPath));
  

  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  console.warn('⚠️ Frontend static folder not found. API mode only.');
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🙏 Bible Social API running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});
// Main Express server
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES Module path fixes
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import Routes
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

// --- SERVE FRONTEND 
const rootDir = process.cwd();
const frontendPath = path.join(rootDir, 'frontend');
const distPath = path.join(frontendPath, 'dist'); // Path for Vite
const buildPath = path.join(frontendPath, 'build'); // Path for CRA


const staticPath = fs.existsSync(distPath) ? distPath : buildPath;

if (fs.existsSync(staticPath)) {
  console.log(`✅ Production Build Found: ${staticPath}`);
  app.use(express.static(staticPath));


  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  console.error('❌ ERROR: No frontend build folder found.');
  console.log('Checked:', distPath);
  console.log('Checked:', buildPath);
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
  console.log(`🚀 Bible Social API active on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});
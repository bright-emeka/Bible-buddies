// Main Express server
require('express-async-errors');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const chatRoutes = require('./routes/chat');
const usersRoutes = require('./routes/users');
const postsRoutes = require('./routes/posts');
const interactionsRoutes = require('./routes/interactions');
const followsRoutes = require('./routes/follows');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/interactions', interactionsRoutes);
app.use('/api/follows', followsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Serve React build if it exists (enables serving web app from backend)
const staticPath = path.join(__dirname, '..', 'frontend', 'build');
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🙏 Bible Social API running on http://localhost:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});

// Authentication middleware to verify Firebase tokens
import { auth } from '../config/firebase.js';

// Verify Firebase ID token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // In development mode, allow requests without token
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️  DEV MODE: Allowing request without token');
        req.userId = 'dev-user-' + Math.random().toString(36).substr(2, 9);
        return next();
      }
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token
    try {
      const decodedToken = await auth.verifyIdToken(token);
      req.userId = decodedToken.uid;
    } catch (verifyError) {
      // In development mode, extract user ID from a test token format
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️  DEV MODE: Using token as user ID');
        req.userId = token.substring(0, 28) || 'dev-user';
      } else {
        throw verifyError;
      }
    }
    
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export { verifyToken };

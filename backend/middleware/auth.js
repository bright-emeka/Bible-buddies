// Authentication middleware to verify Firebase tokens
import { auth } from '../config/firebase.js';

// Verify Firebase ID token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // In development mode, allow requests with a test token
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️  DEV MODE: Allowing request with dev user');
        req.userId = 'dev-user-demo'; // Use fixed dev user ID to avoid race conditions
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
      // In development mode, use a stable dev user ID
      if (process.env.NODE_ENV !== 'production' && token === 'dev-token') {
        console.warn('⚠️  DEV MODE: Using dev token');
        req.userId = 'dev-user-demo';
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

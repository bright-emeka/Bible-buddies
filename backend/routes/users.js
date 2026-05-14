// User routes - handles profiles, user data, follow relationships
import express from 'express';
import { db } from '../config/firebase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * HELPER FUNCTION: Create Default Profile
 * Ensures a consistent user object structure
 */
const createDefaultProfile = async (userRef, userId, data = {}) => {
  const { name, email, bio, avatar, religion } = data;
  const newProfile = {
    uid: userId,
    name: name || email?.split('@')[0] || 'New Believer',
    email: email || '',
    bio: bio || 'Faithful believer sharing wisdom and inspiration',
    avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email || 'User')}&background=random`,
    religion: religion || 'Christian',
    createdAt: new Date().toISOString(),
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
  };
  await userRef.set(newProfile);
  return newProfile;
};

// --- ROUTES ---

// Get or create user profile (Used during Login/Signup)
router.post('/profile', verifyToken, async (req, res) => {
  try {
    const { userId } = req;
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      const newProfile = await createDefaultProfile(userRef, userId, req.body);
      return res.json(newProfile);
    }

    res.json(userDoc.data());
  } catch (error) {
    console.error('Error managing user profile:', error);
    res.status(500).json({ error: 'Failed to manage user profile' });
  }
});

// Search users
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const snapshot = await db
      .collection('users')
      .orderBy('name')
      .startAt(query)
      .endAt(query + '\uf8ff')
      .limit(20)
      .get();

    const users = [];
    snapshot.forEach((doc) => users.push(doc.data()));
    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Get user profile by ID (Self-Healing Version)
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // If the user isn't in Firestore, we return a 404 but include the UID
      // so the frontend knows which ID failed.
      return res.status(404).json({ 
        error: 'User not found', 
        uid: userId,
        message: "This profile hasn't been set up yet." 
      });
    }

    res.json(userDoc.data());
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/:userId', verifyToken, async (req, res) => {
  try {
    const { userId: paramUserId } = req.params;
    const { userId: authUserId } = req;

    // Security: Only allow users to update their own profile
    if (paramUserId !== authUserId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { name, bio, avatar, religion } = req.body;
    const userRef = db.collection('users').doc(paramUserId);

    await userRef.update({
      ...(name && { name }),
      ...(bio && { bio }),
      ...(avatar && { avatar }),
      ...(religion && { religion }),
      updatedAt: new Date().toISOString(),
    });

    const updated = await userRef.get();
    res.json(updated.data());
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

export default router;
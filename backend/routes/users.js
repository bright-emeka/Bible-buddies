// User routes - handles profiles, user data, follow relationships
import express from 'express';
import { db } from '../config/firebase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get or create user profile
router.post('/profile', verifyToken, async (req, res) => {
  try {
    const { userId } = req;
    const { name, email, bio, avatar, religion } = req.body;

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Create new user profile
      await userRef.set({
        uid: userId,
        name: name || email?.split('@')[0] || 'User',
        email,
        bio: bio || 'Faithful believer sharing wisdom and inspiration',
        avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=random`,
        religion: religion || 'Christian',
        createdAt: new Date().toISOString(),
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
      });
    }

    const updated = await userRef.get();
    res.json(updated.data());
  } catch (error) {
    console.error('Error creating/getting user profile:', error);
    res.status(500).json({ error: 'Failed to manage user profile' });
  }
});

// Get user profile by ID
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
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

// Search users
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const q = query.toLowerCase();

    // Firestore doesn't have great full-text search, so we do prefix search
    const snapshot = await db
      .collection('users')
      .orderBy('name')
      .startAt(query)
      .endAt(query + '\uf8ff')
      .limit(20)
      .get();

    const users = [];
    snapshot.forEach((doc) => {
      users.push(doc.data());
    });

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

export default router;

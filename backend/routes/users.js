// User routes - handles profiles, user data, follow relationships using MongoDB
import express from 'express';
import { User } from '../models/index.js'; // 🔌 Import your new Mongoose model
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// --- ROUTES ---

// Get or create user profile
router.post('/profile', verifyToken, async (req, res) => {
  try {
    const { userId } = req; // This is the 'glQY...' string from your middleware
    const { name, email, bio, avatar, religion } = req.body;

    console.log("DEBUG: Looking for user with UID:", userId);

    let user = await User.findOne({ uid: userId });

    if (!user) {
      const defaultName = name || email?.split('@')[0] || 'New Believer';
      const defaultAvatar = avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(defaultName)}&background=random`;

      user = new User({
        _id: userId,   
        uid: userId,   
        name: defaultName,
        email: email || '',
        bio: bio || 'Faithful believer sharing wisdom and inspiration',
        avatar: defaultAvatar,
        religion: religion || 'Christian'
      });

      await user.save();
      console.log(`✨ Success! Saved profile to Atlas with UID: ${userId}`);
    }

    res.json(user);
  } catch (error) {
    console.error('Error managing user profile:', error);
    res.status(500).json({ error: 'Failed to manage user profile' });
  }
});

// Search users
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;

    // 🔎 MongoDB Regular Expression search (case-insensitive search matching name)
    const users = await User.find({
      name: { $regex: query, $options: 'i' }
    }).limit(20);

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Get user profile by ID (Matches your frontend query!)
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // 🔍 Look up user via their Firebase uid field
    const user = await User.findOne({ uid: userId });

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found', 
        uid: userId,
        message: "This profile hasn't been set up yet." 
      });
    }

    res.json(user);
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

    // 🔌 Find and update the document directly in MongoDB
    const updatedUser = await User.findOneAndUpdate(
      { uid: paramUserId },
      { 
        ...(name && { name }),
        ...(bio && { bio }),
        ...(avatar && { avatar }),
        ...(religion && { religion })
      },
      { new: true } // This option returns the updated document back to React
    );

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

export default router;
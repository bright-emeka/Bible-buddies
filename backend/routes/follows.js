// Follows routes - handles user following relationships
import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { User, Follow } from '../models/index.js';

const router = express.Router();

// Helper function to check if user exists
const userExists = async (userId) => {
  return User.exists({ _id: userId });
};

// Follow a user
router.post('/:targetUserId/follow', verifyToken, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const { userId: followerId } = req;

    if (targetUserId === followerId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const [followerExists, targetExists] = await Promise.all([
      userExists(followerId),
      userExists(targetUserId),
    ]);

    if (!followerExists || !targetExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingFollow = await Follow.findOne({
      followerId,
      followingId: targetUserId,
    });

    if (existingFollow) {
      await existingFollow.deleteOne();
      await Promise.all([
        User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } }),
        User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: -1 } }),
      ]);
      return res.json({ following: false, message: 'User unfollowed' });
    }

    await Follow.create({
      followerId,
      followingId: targetUserId,
    });

    await Promise.all([
      User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } }),
      User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: 1 } }),
    ]);

    res.json({ following: true, message: 'User followed' });
  } catch (error) {
    console.error('Error toggling follow:', error);
    res.status(500).json({ error: 'Failed to toggle follow' });
  }
});

// Check if following
router.get('/status/:targetUserId/following', verifyToken, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const { userId } = req;

    const [currentUserExists, targetExists] = await Promise.all([
      userExists(userId),
      userExists(targetUserId),
    ]);

    if (!currentUserExists || !targetExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const following = await Follow.exists({ followerId: userId, followingId: targetUserId });
    res.json({ following: Boolean(following) });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ error: 'Failed to check follow status' });
  }
});

// Get followers of a user
router.get('/:userId/followers', async (req, res) => {
  try {
    const { userId } = req.params;
    let limit = parseInt(req.query.limit, 10) || 50;
    limit = Math.min(limit, 100);

    if (!(await userExists(userId))) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followDocs = await Follow.find({ followingId: userId }).limit(limit).lean();
    const followerIds = followDocs.map((doc) => doc.followerId);
    const followers = await User.find({ _id: { $in: followerIds } });

    res.json(followers);
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

// Get following list for a user
router.get('/:userId/following', async (req, res) => {
  try {
    const { userId } = req.params;
    let limit = parseInt(req.query.limit, 10) || 50;
    limit = Math.min(limit, 100);

    if (!(await userExists(userId))) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followDocs = await Follow.find({ followerId: userId }).limit(limit).lean();
    const followingIds = followDocs.map((doc) => doc.followingId);
    const following = await User.find({ _id: { $in: followingIds } });

    res.json(following);
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

export default router;

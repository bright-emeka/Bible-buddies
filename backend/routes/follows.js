// Follows routes - handles user following relationships
const express = require('express');
const { db } = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Follow a user
router.post('/:targetUserId/follow', verifyToken, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const { userId: followerId } = req;

    if (targetUserId === followerId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const followsRef = db.collection('follows');
    const existingFollow = await followsRef
      .where('followerId', '==', followerId)
      .where('followingId', '==', targetUserId)
      .get();

    if (!existingFollow.empty) {
      // Already following, so unfollow
      await existingFollow.docs[0].ref.delete();

      // Decrease counts
      const followerRef = db.collection('users').doc(followerId);
      const followerData = (await followerRef.get()).data();
      await followerRef.update({
        followingCount: Math.max(0, (followerData?.followingCount || 0) - 1),
      });

      const targetRef = db.collection('users').doc(targetUserId);
      const targetData = (await targetRef.get()).data();
      await targetRef.update({
        followersCount: Math.max(0, (targetData?.followersCount || 0) - 1),
      });

      res.json({ following: false, message: 'User unfollowed' });
    } else {
      // Follow the user
      await followsRef.add({
        followerId,
        followingId: targetUserId,
        createdAt: new Date().toISOString(),
      });

      // Increase counts
      const followerRef = db.collection('users').doc(followerId);
      const followerData = (await followerRef.get()).data();
      await followerRef.update({
        followingCount: (followerData?.followingCount || 0) + 1,
      });

      const targetRef = db.collection('users').doc(targetUserId);
      const targetData = (await targetRef.get()).data();
      await targetRef.update({
        followersCount: (targetData?.followersCount || 0) + 1,
      });

      res.json({ following: true, message: 'User followed' });
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    res.status(500).json({ error: 'Failed to toggle follow' });
  }
});

// Check if following
router.get('/:targetUserId/following', verifyToken, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const { userId } = req;

    const followQuery = await db
      .collection('follows')
      .where('followerId', '==', userId)
      .where('followingId', '==', targetUserId)
      .get();

    res.json({ following: !followQuery.empty });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ error: 'Failed to check follow status' });
  }
});

// Get followers of a user
router.get('/:userId/followers', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const followsSnapshot = await db
      .collection('follows')
      .where('followingId', '==', userId)
      .limit(limit)
      .get();

    const followers = [];
    for (const followDoc of followsSnapshot.docs) {
      const followerDoc = await db.collection('users').doc(followDoc.data().followerId).get();
      followers.push(followerDoc.data());
    }

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
    const limit = parseInt(req.query.limit) || 50;

    const followsSnapshot = await db
      .collection('follows')
      .where('followerId', '==', userId)
      .limit(limit)
      .get();

    const following = [];
    for (const followDoc of followsSnapshot.docs) {
      const followingDoc = await db.collection('users').doc(followDoc.data().followingId).get();
      following.push(followingDoc.data());
    }

    res.json(following);
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

module.exports = router;

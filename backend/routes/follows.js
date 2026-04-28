// Follows routes - handles user following relationships
import express from 'express';
import { db } from '../config/firebase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Helper function to check if user exists
const userExists = async (userId) => {
  const userDoc = await db.collection('users').doc(userId).get();
  return userDoc.exists;
};

// Follow a user
router.post('/:targetUserId/follow', verifyToken, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const { userId: followerId } = req;

    if (targetUserId === followerId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if both users exist
    const [followerExists, targetExists] = await Promise.all([
      userExists(followerId),
      userExists(targetUserId)
    ]);

    if (!followerExists || !targetExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await db.runTransaction(async (transaction) => {
      const followsRef = db.collection('follows');
      const existingFollowQuery = followsRef
        .where('followerId', '==', followerId)
        .where('followingId', '==', targetUserId);
      
      const existingFollow = await transaction.get(existingFollowQuery);

      const followerRef = db.collection('users').doc(followerId);
      const targetRef = db.collection('users').doc(targetUserId);

      if (!existingFollow.empty) {
        // Already following, so unfollow
        transaction.delete(existingFollow.docs[0].ref);

        // Decrease counts
        const followerDoc = await transaction.get(followerRef);
        const followerData = followerDoc.data();
        transaction.update(followerRef, {
          followingCount: Math.max(0, (followerData?.followingCount || 0) - 1),
        });

        const targetDoc = await transaction.get(targetRef);
        const targetData = targetDoc.data();
        transaction.update(targetRef, {
          followersCount: Math.max(0, (targetData?.followersCount || 0) - 1),
        });

        return { following: false, message: 'User unfollowed' };
      } else {
        // Follow the user
        const newFollowRef = followsRef.doc(); // Generate new doc ref
        transaction.set(newFollowRef, {
          followerId,
          followingId: targetUserId,
          createdAt: new Date().toISOString(),
        });

        // Increase counts
        const followerDoc = await transaction.get(followerRef);
        const followerData = followerDoc.data();
        transaction.update(followerRef, {
          followingCount: (followerData?.followingCount || 0) + 1,
        });

        const targetDoc = await transaction.get(targetRef);
        const targetData = targetDoc.data();
        transaction.update(targetRef, {
          followersCount: (targetData?.followersCount || 0) + 1,
        });

        return { following: true, message: 'User followed' };
      }
    });

    res.json(result);
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

    // Check if both users exist
    const [currentUserExists, targetExists] = await Promise.all([
      userExists(userId),
      userExists(targetUserId)
    ]);

    if (!currentUserExists || !targetExists) {
      return res.status(404).json({ error: 'User not found' });
    }

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
    let limit = parseInt(req.query.limit) || 50;
    limit = Math.min(limit, 100); // Max limit

    // Check if user exists
    if (!(await userExists(userId))) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followsSnapshot = await db
      .collection('follows')
      .where('followingId', '==', userId)
      .limit(limit)
      .get();

    const followers = [];
    for (const followDoc of followsSnapshot.docs) {
      const followerDoc = await db.collection('users').doc(followDoc.data().followerId).get();
      if (followerDoc.exists) {
        followers.push(followerDoc.data());
      }
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
    let limit = parseInt(req.query.limit) || 50;
    limit = Math.min(limit, 100); // Max limit

    // Check if user exists
    if (!(await userExists(userId))) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followsSnapshot = await db
      .collection('follows')
      .where('followerId', '==', userId)
      .limit(limit)
      .get();

    const following = [];
    for (const followDoc of followsSnapshot.docs) {
      const followingDoc = await db.collection('users').doc(followDoc.data().followingId).get();
      if (followingDoc.exists) {
        following.push(followingDoc.data());
      }
    }

    res.json(following);
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

export default router;

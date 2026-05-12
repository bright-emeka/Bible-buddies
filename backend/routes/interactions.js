// Interactions routes - handles likes and comments
import express from 'express';
import { db } from '../config/firebase.js';
import { verifyToken } from '../middleware/auth.js';
import admin from 'firebase-admin';

const router = express.Router();

// Like a post
router.post('/:postId/like', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req;

    const likesRef = db.collection('likes');
    const likeQuery = await likesRef
      .where('postId', '==', postId)
      .where('userId', '==', userId)
      .get();

    if (!likeQuery.empty) {
      // Already liked, so unlike
      const likeDoc = likeQuery.docs[0];
      await likeDoc.ref.delete();

      // Decrease likes count using atomic decrement
      await db.collection('posts').doc(postId).update({
        likesCount: admin.firestore.FieldValue.increment(-1),
      });

      res.json({ liked: false, message: 'Post unliked' });
    } else {
      // Like the post
      await likesRef.add({
        postId,
        userId,
        createdAt: new Date().toISOString(),
      });

      // Increase likes count using atomic increment
      await db.collection('posts').doc(postId).update({
        likesCount: admin.firestore.FieldValue.increment(1),
      });

      res.json({ liked: true, message: 'Post liked' });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// Check if user liked a post
router.get('/:postId/liked', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req;

    const likeQuery = await db
      .collection('likes')
      .where('postId', '==', postId)
      .where('userId', '==', userId)
      .get();

    res.json({ liked: !likeQuery.empty });
  } catch (error) {
    console.error('Error checking if liked:', error);
    res.status(500).json({ error: 'Failed to check like status' });
  }
});

// Add comment
router.post('/:postId/comments', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }

    const commentDoc = {
      userId,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likesCount: 0,
    };

    const docRef = await db
      .collection('posts')
      .doc(postId)
      .collection('comments')
      .add(commentDoc);

    // Update post comments count using atomic increment
    await db.collection('posts').doc(postId).update({
      commentsCount: admin.firestore.FieldValue.increment(1),
    });

    // Get comment author info
    const userDoc = await db.collection('users').doc(userId).get();

    res.status(201).json({
      id: docRef.id,
      ...commentDoc,
      author: userDoc.data(),
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Get comments for a post
router.get('/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const lastTimestamp = req.query.lastTimestamp ? new Date(req.query.lastTimestamp) : new Date();

    const commentsSnapshot = await db
      .collection('posts')
      .doc(postId)
      .collection('comments')
      .orderBy('createdAt', 'desc')
      .startAt(lastTimestamp)
      .limit(20)
      .get();

    // Batch fetch all comment author documents
    const commentUserIds = [...new Set(commentsSnapshot.docs.map(doc => doc.data().userId))];
    const commentUserDocs = await Promise.all(
      commentUserIds.map(id => db.collection('users').doc(id).get())
    );
    const commentUsersMap = new Map(commentUserDocs.map(doc => [doc.id, doc.data()]));

    const comments = commentsSnapshot.docs.map((commentDoc) => {
      const comment = commentDoc.data();
      return {
        id: commentDoc.id,
        ...comment,
        author: commentUsersMap.get(comment.userId),
      };
    });

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});
});

// Delete comment
router.delete('/:postId/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId } = req;

    const commentDoc = await db
      .collection('posts')
      .doc(postId)
      .collection('comments')
      .doc(commentId)
      .get();

    if (!commentDoc.exists) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (commentDoc.data().userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await commentDoc.ref.delete();

    // Update post comments count
    const postRef = db.collection('posts').doc(postId);
    const postData = (await postRef.get()).data();
    await postRef.update({
      commentsCount: Math.max(0, (postData?.commentsCount || 0) - 1),
    });

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;

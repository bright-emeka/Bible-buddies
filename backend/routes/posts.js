// Posts routes - handles creating, reading, and managing posts
import express from 'express';
import { db } from '../config/firebase.js';
import { verifyToken } from '../middleware/auth.js';
import admin from 'firebase-admin';

const router = express.Router();

// Create a new post
router.post('/', verifyToken, async (req, res) => {
  try {
    const { userId } = req;
    const { content, image } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Post content cannot be empty' });
    }

    const postsRef = db.collection('posts');
    const postDoc = {
      userId,
      content: content.trim(),
      image: image || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
    };

    const docRef = await postsRef.add(postDoc);

    // Update user's posts count using atomic increment
    await db.collection('users').doc(userId).update({
      postsCount: admin.firestore.FieldValue.increment(1),
    });

    res.status(201).json({
      id: docRef.id,
      ...postDoc,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get feed for current user (posts from followed users + own posts)
router.get('/feed', verifyToken, async (req, res) => {
  try {
    const { userId } = req;
    const lastTimestamp = req.query.lastTimestamp ? new Date(req.query.lastTimestamp) : new Date();

    // Get users that current user is following
    const followsSnapshot = await db
      .collection('follows')
      .where('followerId', '==', userId)
      .get();

    const followingIds = [userId]; // Include own posts
    followsSnapshot.forEach((doc) => {
      followingIds.push(doc.data().followingId);
    });

    // Get posts from followed users with proper pagination
    const postsSnapshot = await db
      .collection('posts')
      .where('userId', 'in', followingIds)
      .orderBy('createdAt', 'desc')
      .startAt(lastTimestamp)
      .limit(20)
      .get();

    // Batch fetch all user documents to avoid N+1 query problem
    const userIds = [...new Set(postsSnapshot.docs.map(doc => doc.data().userId))];
    const userDocs = await Promise.all(
      userIds.map(id => db.collection('users').doc(id).get())
    );
    const usersMap = new Map(userDocs.map(doc => [doc.id, doc.data()]));

    const posts = postsSnapshot.docs.map((postDoc) => {
      const post = postDoc.data();
      return {
        id: postDoc.id,
        ...post,
        author: usersMap.get(post.userId),
      };
    });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

// Get user's posts
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const lastTimestamp = req.query.lastTimestamp ? new Date(req.query.lastTimestamp) : new Date();

    const postsSnapshot = await db
      .collection('posts')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .startAt(lastTimestamp)
      .limit(20)
      .get();

    const posts = postsSnapshot.docs.map((postDoc) => ({
      id: postDoc.id,
      ...postDoc.data(),
    }));

    res.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});

// Get single post with comments
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const postDoc = await db.collection('posts').doc(postId).get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = postDoc.data();
    const userDoc = await db.collection('users').doc(post.userId).get();

    // Get comments
    const commentsSnapshot = await db
      .collection('posts')
      .doc(postId)
      .collection('comments')
      .orderBy('createdAt', 'desc')
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

    res.json({
      id: postId,
      ...post,
      author: userDoc.data(),
      comments,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Delete post (only by author)
router.delete('/:postId', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req;

    const postDoc = await db.collection('posts').doc(postId).get();
    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (postDoc.data().userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await db.collection('posts').doc(postId).delete();

    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;

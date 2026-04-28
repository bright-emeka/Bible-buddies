import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  getUserProfile, 
  getUserPosts, 
  getFollowers, 
  getFollowing, 
  toggleFollow, 
  checkFollowing, 
  updateUserProfile 
} from '../services/api';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Post from '../components/Post';

const Profile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '', avatar: '', religion: '' });
  
  // Track authenticated user state properly
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const isOwnProfile = currentUser && currentUser.uid === userId;

  // Wrapped in useCallback to prevent unnecessary re-renders
  const loadProfile = useCallback(async () => {
    if (!userId || userId === 'undefined') {
      console.error("Profile Error: userId is undefined. Check your Link tags or Routes.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // 1. Fetch User Data First
      const userData = await getUserProfile(userId);
      
      if (!userData) {
        console.error(`Profile Error: No document found in Firestore for UID: ${userId}`);
        setUser(null);
        return;
      }

      setUser(userData);

      // 2. Run other fetches in parallel to speed up loading
      const [userPosts, followersList, followingList] = await Promise.all([
        getUserPosts(userId),
        getFollowers(userId),
        getFollowing(userId)
      ]);

      setPosts(userPosts || []);
      setFollowers(followersList || []);
      setFollowing(followingList || []);

      // 3. Check follow status if it's someone else's profile
      if (currentUser && currentUser.uid !== userId) {
        const result = await checkFollowing(userId);
        setIsFollowing(result?.following || false);
      }
      
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, currentUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleFollow = async () => {
    try {
      const result = await toggleFollow(userId);
      setIsFollowing(result.following);
      
      setUser(prev => ({
        ...prev,
        followersCount: result.following ? (prev.followersCount || 0) + 1 : (prev.followersCount || 1) - 1,
      }));
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleEdit = () => {
    setEditForm({
      name: user.name || '',
      bio: user.bio || '',
      avatar: user.avatar || '',
      religion: user.religion || 'Christian',
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateUserProfile(userId, editForm);
      setUser(prev => ({ ...prev, ...editForm }));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="error-container">
        <h2>User not found</h2>
        <p>We couldn't find a user with the ID: <strong>{userId}</strong></p>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img 
          src={user.avatar || 'https://via.placeholder.com/150'} 
          alt={user.name} 
          className="profile-avatar" 
        />
        <div className="profile-info">
          {isEditing ? (
            <div className="edit-form">
              <h3>Edit Your Profile</h3>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Avatar URL</label>
                <input
                  type="text"
                  value={editForm.avatar}
                  onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Religion</label>
                <select
                  value={editForm.religion}
                  onChange={(e) => setEditForm({ ...editForm, religion: e.target.value })}
                >
                  <option value="Christian">Christian</option>
                  <option value="Muslim">Muslim</option>
                  <option value="Jewish">Jewish</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddhist">Buddhist</option>
                  <option value="Sikh">Sikh</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="edit-actions">
                <button className="save-btn" onClick={handleSaveEdit}>Save Changes</button>
                <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h1>{user.name}</h1>
              <p className="religion-tag">{user.religion}</p>
              <p className="profile-bio">{user.bio || "No bio yet."}</p>
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-number">{posts.length}</span>
                  <span className="stat-label">Posts</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{user.followersCount || 0}</span>
                  <span className="stat-label">Followers</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{user.followingCount || 0}</span>
                  <span className="stat-label">Following</span>
                </div>
              </div>
            </>
          )}

          <div className="profile-actions">
            {!isOwnProfile && (
              <button
                className={`follow-btn ${isFollowing ? 'following' : ''}`}
                onClick={handleFollow}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
            {isOwnProfile && !isEditing && (
              <button className="edit-profile-btn" onClick={handleEdit}>
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button className={`tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
          Posts
        </button>
        <button className={`tab ${activeTab === 'followers' ? 'active' : ''}`} onClick={() => setActiveTab('followers')}>
          Followers
        </button>
        <button className={`tab ${activeTab === 'following' ? 'active' : ''}`} onClick={() => setActiveTab('following')}>
          Following
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'posts' && (
          <div className="posts-list">
            {posts.length === 0 ? <p>No posts yet</p> : posts.map((post) => <Post key={post.id} post={post} />)}
          </div>
        )}

        {activeTab === 'followers' && (
          <div className="users-grid">
            {followers.length === 0 ? <p>No followers yet</p> : followers.map((f) => (
              <div key={f.uid} className="user-list-item">
                <img src={f.avatar || 'https://via.placeholder.com/50'} alt="" />
                <h4>{f.name}</h4>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'following' && (
          <div className="users-grid">
            {following.length === 0 ? <p>Not following anyone yet</p> : following.map((f) => (
              <div key={f.uid} className="user-list-item">
                <img src={f.avatar || 'https://via.placeholder.com/50'} alt="" />
                <h4>{f.name}</h4>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
// Main App component - handles routing and auth state
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { onAuthChange } from './services/auth';
import { setAuthToken, createUserProfile } from './services/api';
import Login from './pages/Login';
import Chat from './pages/Chat';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Discover from './pages/Discover';
import Header from './components/Header';

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      if (authUser) {
        // User is logged in
        setUser({
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName,
        });

        // Get and set auth token for API calls
        try {
          const token = await authUser.getIdToken();
          setAuthToken(token);

          // Create or get user profile
          await createUserProfile(authUser.uid, {
            name: authUser.displayName || authUser.email?.split('@')[0] || 'User',
            email: authUser.email,
          });
        } catch (error) {
          console.error('Error setting up user:', error);
        }
      } else {
        // User is logged out
        setUser(null);
        setAuthToken(null);
        navigate('/login');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [navigate]);

  const handleLogout = () => {
    setUser(null);
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="App">
      {user ? (
        <>
          <Header 
            userName={user.email}
            userId={user.uid}
            onLogout={handleLogout}
            onUserClick={handleUserClick}
          />
          <main className="main-content">
            <Routes>
              <Route path="/feed" element={<Feed />} />
              <Route path="/chat" element={<Chat userName={user.email} />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/discover" element={<Discover onUserClick={handleUserClick} />} />
              <Route path="/" element={<Feed />} />
            </Routes>
          </main>
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={() => {}} />} />
          <Route path="*" element={<Login onLoginSuccess={() => {}} />} />
        </Routes>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

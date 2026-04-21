// Header component with app name and navigation
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logOut } from '../services/auth';

const Header = ({ userName, userId, onLogout, onUserClick }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
      onLogout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Error logging out');
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <h1 className="app-title" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          📖 Faith Buddies
        </h1>

        <nav className="header-nav">
          <button onClick={() => navigate('/feed')} className="nav-btn">
            📰 Feed
          </button>
          <button onClick={() => navigate('/chat')} className="nav-btn">
            💬 Chat
          </button>
          <button onClick={() => navigate('/discover')} className="nav-btn">
            🔍 Discover
          </button>
        </nav>

        <div className="header-right">
          <span className="user-name">Hello, {userName}</span>
          {userId && (
            <button
              className="profile-btn"
              onClick={() => onUserClick(userId)}
            >
              👤 Profile
            </button>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

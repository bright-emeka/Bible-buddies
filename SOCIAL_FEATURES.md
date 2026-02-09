# Bible Social - Complete Social Media Platform

A full-featured Christian social network with AI Bible chat, user profiles, posts, following system, and more.

## ✨ Features

### 🔐 Authentication
- Email/password signup and login via Firebase Auth
- Persistent user sessions
- Secure token-based API communication

### 📱 Social Media Features
- **Feed**: See posts from users you follow
- **Posts**: Create text and image posts
- **Profiles**: View user profiles with follower/following lists
- **Follow System**: Follow/unfollow users
- **Likes & Comments**: Engage with posts
- **User Discovery**: Search and discover new users to follow

### 🤖 AI Bible Chat
- Chat with an AI-powered Bible teacher
- Responses grounded in Scripture with verse references
- Chat history that persists across sessions

### 💾 Data Persistence
- User profiles with avatars and bios
- Post history with likes and comments
- Follow relationships
- Chat history

## 📁 Project Structure

```
Bible Social/
├── backend/                    # Express API server
│   ├── routes/
│   │   ├── chat.js             # AI Bible chat
│   │   ├── users.js            # User profiles
│   │   ├── posts.js            # Posts & feed
│   │   ├── interactions.js      # Likes & comments
│   │   └── follows.js           # Follow system
│   ├── config/
│   │   └── firebase.js          # Firebase setup
│   ├── middleware/
│   │   └── auth.js              # Token verification
│   └── server.js
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Feed.js          # Social feed
│   │   │   ├── Profile.js       # User profiles
│   │   │   ├── Discover.js      # Find users
│   │   │   └── Chat.js          # AI chat
│   │   ├── components/
│   │   │   ├── Header.js        # Navigation
│   │   │   ├── Post.js          # Post card
│   │   │   └── UserCard.js      # User profile card
│   │   ├── services/
│   │   │   ├── api.js           # All API calls
│   │   │   ├── auth.js          # Firebase auth
│   │   │   └── firebase.js      # Firebase config
│   │   ├── styles/
│   │   │   ├── App.css          # Main styles
│   │   │   └── social.css       # Social features
│   │   └── App.js               # Main component with routing
│   └── public/
│       └── index.html
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- Firebase account with Firestore & Authentication
- OpenAI API key

### 1. Setup Environment Variables

Create `.env` in the `backend/` folder:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
OPENAI_API_KEY=sk-...
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Create `.env.local` in the `frontend/` folder:
```env
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
REACT_APP_API_URL=http://localhost:5000
```

### 2. Install Dependencies

From the root directory:
```bash
npm run web:install
```

### 3. Build Frontend

```bash
npm run web:build
```

### 4. Run the Application

```bash
npm run web:start
```

The app will be available at `http://localhost:5000`

## 📚 API Endpoints

### Users
- `POST /api/users/profile` - Create/get user profile
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId` - Update user profile
- `GET /api/users/search/:query` - Search users

### Posts
- `POST /api/posts` - Create post
- `GET /api/posts/feed` - Get feed
- `GET /api/posts/user/:userId` - Get user's posts
- `GET /api/posts/:postId` - Get single post
- `DELETE /api/posts/:postId` - Delete post

### Interactions
- `POST /api/interactions/:postId/like` - Like/unlike post
- `GET /api/interactions/:postId/liked` - Check if liked
- `POST /api/interactions/:postId/comments` - Add comment
- `GET /api/interactions/:postId/comments` - Get comments
- `DELETE /api/interactions/:postId/comments/:commentId` - Delete comment

### Follows
- `POST /api/follows/:userId/follow` - Follow/unfollow user
- `GET /api/follows/:userId/following` - Check if following
- `GET /api/follows/:userId/followers` - Get followers
- `GET /api/follows/:userId/following` - Get following list

### Chat
- `POST /api/chat/message` - Send message to AI
- `GET /api/chat/history/:userId` - Get chat history

## 🗄️ Firebase Collections

### users
```javascript
{
  uid: string,
  name: string,
  email: string,
  bio: string,
  avatar: string,
  followersCount: number,
  followingCount: number,
  postsCount: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### posts
```javascript
{
  userId: string,
  content: string,
  image: string,
  likesCount: number,
  commentsCount: number,
  sharesCount: number,
  createdAt: timestamp,
  updatedAt: timestamp,
  
  // subcollection: comments
  // {
  //   userId: string,
  //   content: string,
  //   likesCount: number,
  //   createdAt: timestamp
  // }
}
```

### follows
```javascript
{
  followerId: string,
  followingId: string,
  createdAt: timestamp
}
```

### likes
```javascript
{
  postId: string,
  userId: string,
  createdAt: timestamp
}
```

### chats
```javascript
{
  userId: string,
  messages: [
    {
      role: "user" | "assistant",
      content: string,
      timestamp: timestamp
    }
  ],
  updatedAt: timestamp
}
```

## 🔒 Security

- Firebase Auth for authentication
- Backend token verification on protected routes
- CORS configured for frontend access
- Environment variables for sensitive data

## 🎨 Features in Detail

### Feed
- Real-time posts from followed users
- Infinite scroll with pagination
- Like and comment on posts
- Follow users directly from feed

### Profile
- User avatar and bio
- Posts, followers, and following tabs
- Update own profile info
- Follow/unfollow from profile

### Discover
- Search for users
- Browse user profiles
- Discover new community members
- Follow users from discover page

### Chat
- AI-powered Bible teacher
- Scripture-based responses
- Chat history persistence
- Natural conversation flow

## 🚢 Deployment

### Deploy to Render (Recommended)

1. Push to GitHub
2. Create new Web Service on Render
3. Connect GitHub repo
4. Set environment variables
5. Deploy!

### Deploy to Heroku

1. Create Heroku app: `heroku create your-app-name`
2. Set config vars: `heroku config:set VAR_NAME=value`
3. Deploy: `git push heroku main`

### Deploy to Vercel (Frontend Only)

1. Frontend to Vercel
2. Backend to Render/Heroku
3. Update `REACT_APP_API_URL` in Vercel environment variables

## 🐛 Troubleshooting

**Firebase authentication errors**
- Verify service account key format (should be JSON)
- Check project ID matches
- Ensure Firestore database is created

**API connection errors**
- Verify backend is running
- Check `REACT_APP_API_URL` in frontend .env
- Check CORS settings in backend

**Posts not loading**
- Ensure user profile is created
- Check Firestore security rules
- Verify backend Firebase config

## 📖 Bible Chat System Prompt

The AI is configured with this system prompt:
```
You are a wise and compassionate Bible teacher. Your purpose is to help
people understand and apply God's Word.

INSTRUCTIONS:
1. Answer ALL questions strictly from the Bible
2. Always quote scripture references (Book Chapter:Verse)
3. Provide multiple relevant verses
4. Maintain a tone of love, wisdom, and humility
5. Avoid denominational bias
6. If uncertain, respond with: "Let us search the scriptures"
7. Help people connect biblical truths to their lives
```

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and create a Pull Request

## 📄 License

MIT License - feel free to use this for your own projects

## 💪 Support

For issues or questions:
1. Check Firebase Console for errors
2. Check backend logs
3. Check browser console for frontend errors
4. Verify all environment variables

---

Built with ❤️ for the Christian community

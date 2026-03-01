# Bible Social - AI Bible Chat MVP

> A Christian social application with an AI Bible chat buddy powered by OpenAI

## Overview

Bible Social is an MVP application where users can:
- Sign up and log in with Firebase Authentication
- Chat with an AI Bible teacher that answers strictly from Scripture
- Receive biblically accurate responses with relevant scripture references
- Store chat history securely in Firestore

## Tech Stack

- **Frontend**: React (JavaScript, functional components, hooks)
- **Backend**: Node.js + Express
- **Database**: Firebase (Firestore + Authentication)
- **AI**: OpenAI Chat Completion API
- **Styling**: CSS

## Project Structure

```
Bible social/
├── frontend/                 # React application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.js             # Auth page
│   │   │   └── Chat.js              # AI chat interface
│   │   ├── components/
│   │   │   └── Header.js            # App header
│   │   ├── services/
│   │   │   ├── firebase.js          # Firebase config
│   │   │   ├── auth.js              # Auth functions
│   │   │   └── api.js               # API calls
│   │   ├── styles/
│   │   │   └── App.css
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env.example
│
├── backend/                  # Express API server
│   ├── config/
│   │   └── firebase.js       # Firebase Admin config
│   ├── middleware/
│   │   └── auth.js           # Token verification
│   ├── routes/
│   │   └── chat.js           # Chat endpoints
│   ├── server.js             # Main server
│   ├── package.json
│   └── .env.example
│
└── README.md                 # This file
```

## Features

### 1. Authentication
- Email/password signup and login via Firebase Auth
- Persistent user sessions
- Secure token-based API communication

### 2. AI Bible Chat Buddy
- Chat interface with message history
- Responses locked to Scripture via system prompt
- AI references Bible verses with citations
- Maintains conversation context
- Denomination-neutral approach

### 3. Data Persistence
- User profiles in Firestore
- Chat history per user
- Automatic message timestamps

### 4. Security
- Firebase Auth token verification on backend
- Environment variable protection for API keys
- CORS configuration for frontend access

## Setup Instructions

### Prerequisites
- Node.js 14+ and npm
- Firebase project with Firestore and Authentication enabled
- OpenAI API key
- Firebase Admin SDK service account key

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable **Authentication** (Email/Password)
4. Create **Firestore Database** (start in test mode for development)
5. In Project Settings > Service Accounts, generate and download service account key JSON
6. In Project Settings > General, copy your config values

### 2. OpenAI API Setup

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an API key
3. Ensure you have API credits available

### 3. Backend Setup

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your values:
# - FIREBASE_PROJECT_ID
# - FIREBASE_SERVICE_ACCOUNT_KEY (paste entire JSON string)
# - OPENAI_API_KEY
# - PORT (default: 5000)

# Install dependencies
npm install

# Start server
npm start
# Or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:5000`

### 4. Frontend Setup

```bash
cd frontend

# Copy environment template
cp .env.example .env

# Edit .env with your values:
# - REACT_APP_FIREBASE_* (from Firebase Console)
# - REACT_APP_API_URL (should be http://localhost:5000 for local dev)

# Install dependencies
npm install

# Start frontend
npm start
```

The frontend will open on `http://localhost:3000`

## Run as a Web App (single-server)

You can build the React frontend and serve it from the Express backend so the whole project runs as a single web app.

From the repository root run:

```bash
# install backend + frontend deps
npm run web:install

# build frontend
npm run web:build

# start backend which will serve the frontend build
npm run web:start
```

After `npm run web:start` the app will be available at `http://localhost:5000`.

## Deployment

This repo can be deployed as a single Node.js app that serves both the API
and the built React frontend. A simple way is to use **Heroku**, but any
Platform‑as‑a‑Service that supports Node.js will work (e.g. Vercel, Render,
Fly.io, DigitalOcean App Platform).

### Heroku

1. Create a new Heroku app:

   ```bash
   heroku create bible-social-app
   ```

2. Set required config variables (see earlier section).

> **Optional CI/CD**: You can automate build and deployment with GitHub Actions.  Add the following repository secrets in GitHub Settings → Secrets:
>
> - `HEROKU_API_KEY` – your Heroku API key (from `heroku auth:token`)
> - `HEROKU_APP_NAME` – the name of your Heroku app (e.g. `bible-social-app`)
> - `HEROKU_EMAIL` – the email associated with your Heroku account
>
> A workflow file (`.github/workflows/ci-cd.yml`) is included in this repo which will:
>   * install dependencies and build the frontend on every push/PR to `main`
>   * automatically deploy to Heroku when `main` is updated.
>
> Just commit and push; the Actions tab will show build/deploy status.


2. Provision a MongoDB or other backing store if needed (here we use Firebase
   so no additional database is required).

3. Set environment variables on Heroku:

   ```bash
   heroku config:set \
     FIREBASE_PROJECT_ID=your_project_id \
     FIREBASE_SERVICE_ACCOUNT_KEY="$(cat path/to/serviceAccount.json)" \
     OPENAI_API_KEY=sk-... \
     FRONTEND_URL=https://bible-social-app.herokuapp.com
   ```

4. Add a `Procfile` (see project root) with the following line:

   ```text
   web: npm run web:serve
   ```

5. Push to Heroku (main branch will automatically build the project using the
   `heroku-postbuild` script and start the server):

   ```bash
   git push heroku main
   ```

6. Open the app:

   ```bash
   heroku open
   ```

### Vercel / Netlify / Render

- **Frontend only**: Deploy the `frontend` directory as a React app and set
  `REACT_APP_API_URL` to the URL of your API server.
- **Backend only**: Deploy `backend` as a Node service; make sure to build the
  frontend separately or serve it from the backend.

### Local Docker (optional)

A Dockerfile can bundle both services; you would then push the image to a
registry.


## Usage

1. **Register**: Click "Sign Up" and create an account with email and name
2. **Login**: Use your credentials to log in
3. **Chat**: Type questions about the Bible and receive AI responses grounded in Scripture
4. **History**: Your chat history is automatically saved and loaded on return visits

## API Endpoints

### POST `/api/chat/message`
Send a message to the AI Bible teacher
- **Auth**: Required (Bearer token)
- **Body**: `{ message: string, userId: string }`
- **Response**: `{ message: string, timestamp: string }`

### GET `/api/chat/history/:userId`
Retrieve chat history for a user
- **Auth**: Required (Bearer token)
- **Response**: `{ messages: Array, updatedAt: string }`

### GET `/health`
Server health check
- **Response**: `{ status: string, timestamp: string }`

## System Prompt (AI Behavior)

The AI Bible teacher is configured with this system prompt:

```
You are a wise and compassionate Bible teacher. Your purpose is to help people understand and apply God's Word.

INSTRUCTIONS:
1. Answer ALL questions strictly from the Bible and biblical knowledge
2. Always quote scripture references (Book Chapter:Verse) when relevant
3. Provide multiple relevant verses when applicable
4. Maintain a tone of love, wisdom, and humility
5. Avoid denominational bias - stay focused on Scripture itself
6. If you're uncertain about how Scripture addresses a question, respond with: "Let us search the scriptures"
7. Help people connect biblical truths to their lives
8. Pray for wisdom in your responses
```

## Database Schema

### Users Collection
```javascript
{
  id: string,                // Firebase UID
  name: string,              // User's name
  email: string,             // User's email
  createdAt: ISO timestamp
}
```

### Chats Collection
```javascript
{
  userId: string,            // Firebase UID
  messages: [
    {
      role: string,          // "user" or "assistant"
      content: string,       // Message text
      timestamp: ISO timestamp
    }
  ],
  updatedAt: ISO timestamp
}
```

## Environment Variables Reference

### Backend (.env)
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
OPENAI_API_KEY=sk-...
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
REACT_APP_API_URL=http://localhost:5000
```

## Development Tips

### Testing the Chat Locally
1. After login, try asking: "What does the Bible say about love?"
2. The AI should respond with relevant scripture references

### Debugging
- **Frontend**: Open browser DevTools (F12) for console errors
- **Backend**: Check terminal logs for API errors
- **Firebase**: Use Firebase Console to inspect Firestore data

### Common Issues

**"Firebase service account key is invalid"**
- Make sure `FIREBASE_SERVICE_ACCOUNT_KEY` is a complete JSON string
- Copy the entire service account JSON from Firebase Console

**"OpenAI API key is invalid"**
- Verify API key from https://platform.openai.com/api-keys
- Check you have API credits available

**CORS errors**
- Ensure `FRONTEND_URL` in backend .env matches frontend origin
- Frontend should be using `REACT_APP_API_URL` correctly

## Future Enhancements (Out of MVP Scope)

- User profiles and dashboard
- Social features (follow users, share chats)
- Multiple AI personalities
- Chat categories/folders
- Verse of the day
- Prayer requests
- In-app Bible reading
- Mobile app
- Analytics

## Code Quality

- Clean, readable code with comments on major logic
- Functional React components with hooks
- Proper error handling and user feedback
- Environment-based configuration
- No over-engineering - focus on MVP functionality

## Security Notes

- Never commit `.env` files to git
- API keys are passed server-to-server (OpenAI)
- Firebase Auth tokens verified on every API call
- Firestore security rules should be configured in production
- Use HTTPS in production deployment

## Deployment

For production deployment:
1. Set environment variables on your hosting platform
2. Update `FRONTEND_URL` and `REACT_APP_API_URL` for production domains
3. Configure Firebase security rules
4. Enable HTTPS
5. Use managed database services

## License

MIT

## Support

For issues or questions:
1. Check Firebase and OpenAI console for errors
2. Review backend logs
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

---

Built with ❤️ for the Christian community

# Admas University Blog Platform

<div align="center">

![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=for-the-badge&logo=socket.io&logoColor=white)

[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](CONTRIBUTING.md)
[![Code of Conduct](https://img.shields.io/badge/Code%20of-Conduct-ff69b4.svg?style=for-the-badge)](CODE_OF_CONDUCT.md)

</div>

<p align="center">
  <strong>A comprehensive, full-stack collaborative blogging platform designed for the Admas University community.</strong>
  <br>
  Built with modern technologies and industry best practices.
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## 🚀 Features

### Core Features

- **User Authentication** - JWT-based auth with role-based access control (Admin, Moderator, Author, Reader)
- **Blog Management** - Create, edit, publish, and manage blog posts with rich text editor
- **Following System** - Follow authors and get personalized content feed
- **Following Feed** - View posts from authors you follow with filtering and sorting
- **Comment System** - Threaded comments with moderation capabilities
- **Content Moderation** - AI-powered content analysis and moderation workflow
- **Real-time Notifications** - Socket.io powered live updates for new posts, comments, and follows

### Advanced Features

- **AI Content Assistant** - Writing suggestions, content generation, and violation detection
- **Analytics Dashboard** - Comprehensive engagement metrics and insights
- **Collaboration** - Co-authoring and peer review system
- **Newsletter System** - Email subscription and newsletter management
- **Alumni Verification** - Document-based verification system
- **Search & Discovery** - Advanced search with category and tag filtering

### User Roles

- **Admin** - Full system access, user management, and system settings
- **Moderator** - Content moderation, approval workflows, and user activity monitoring
- **Author** - Create, publish content, collaborate, and manage followers
- **Reader** - Browse, interact with content, follow authors, and comment

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top" width="50%">

### Frontend 🎨

- **Framework**: React 18 with Hooks
- **Build Tool**: Vite 5.x
- **Styling**:
  - Tailwind CSS 3.x
  - PostCSS
  - Custom CSS
- **UI Components**: shadcn/ui
- **State Management**:
  - React Context API
  - React Query (TanStack Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Charts & Visualization**:
  - Chart.js
  - Recharts
  - D3.js
- **Rich Text Editor**: Custom implementation
- **Animations**: Framer Motion, GSAP
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Notifications**: React Hot Toast

</td>
<td valign="top" width="50%">

### Backend ⚙️

- **Runtime**: Node.js 20.x
- **Framework**: Express.js 4.x
- **Database**: MongoDB 7.x with Mongoose ODM
- **Authentication**:
  - JWT (Access & Refresh Tokens)
  - bcrypt for password hashing
- **File Storage**: Cloudinary
- **Real-time Communication**: Socket.io
- **Email**: Nodemailer
- **Caching**: Redis (optional)
- **AI Integration**: OpenAI API
- **Validation**: express-validator
- **Security**:
  - Helmet.js
  - CORS
  - Rate Limiting
  - XSS Protection
- **Testing**:
  - Jest
  - fast-check (Property-Based Testing)
- **Logging**: Winston
- **Process Management**: PM2

</td>
</tr>
</table>

### DevOps & Tools 🚀

- **Version Control**: Git & GitHub
- **Package Manager**: npm
- **Code Quality**: ESLint, Prettier
- **Deployment**:
  - Frontend: Netlify
  - Backend: Render
  - Database: MongoDB Atlas
- **CI/CD**: GitHub Actions (optional)
- **Monitoring**: Built-in health checks

## 📁 Project Structure

```
admas-blog/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files (database, cloudinary, firebase)
│   │   ├── controllers/    # Request handlers (auth, posts, feed, admin)
│   │   ├── middleware/     # Custom middleware (auth, rate limiting, validation)
│   │   ├── models/         # Database schemas (User, BlogPost, Follow, Comment)
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic (feed, notification, email)
│   │   ├── socket/         # WebSocket handlers
│   │   ├── utils/          # Utility functions
│   │   ├── __tests__/      # Test files
│   │   └── app.js          # Express app setup
│   ├── scripts/            # Database seeding scripts
│   ├── uploads/            # Local file uploads
│   ├── server.js           # Server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/            # API client functions (posts, feed, users, admin)
│   │   ├── components/     # React components
│   │   │   ├── feed/       # Feed-related components
│   │   │   ├── dashboard/  # Dashboard components
│   │   │   ├── layout/     # Layout components
│   │   │   └── ...
│   │   ├── contexts/       # React contexts (Auth, Theme, Socket)
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── routes/         # Route definitions and guards
│   │   ├── services/       # Frontend services
│   │   ├── styles/         # CSS styles
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Root component
│   │   └── main.jsx        # Entry point
│   └── package.json
│
└── package.json            # Root package for concurrent dev
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **MongoDB** - Local installation or MongoDB Atlas account ([Setup Guide](https://www.mongodb.com/docs/manual/installation/))
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

#### 1. Clone the repository

```bash
git clone <repository-url>
cd admas-blog
```

#### 2. Install dependencies

```bash
# Install root dependencies (for concurrent dev)
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

#### 3. Configure environment variables

**Backend Environment** (`backend/.env`):

```env
# Server Configuration
PORT=4001
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/admas-blog
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/admas-blog

# JWT Secrets (generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Client URL
CLIENT_URL=http://localhost:5173

# Cloudinary (for image uploads - optional but recommended)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OpenAI (for AI features - optional)
OPENAI_API_KEY=your-openai-api-key

# Email Configuration (optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
EMAIL_FROM=noreply@admas.edu.et

# Redis (optional - for caching)
REDIS_URL=redis://localhost:6379

# Firebase (optional - for Google auth)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

**Frontend Environment** (`frontend/.env`):

```env
# API Configuration
VITE_API_URL=http://localhost:4001/api
VITE_SOCKET_URL=http://localhost:4001

# Firebase (optional - for Google auth)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
```

#### 4. Set up the database

**Option A: Seed with sample data (Recommended for development)**

```bash
cd backend

# Seed users, posts, and initial data
npm run seed

# This will create:
# - Admin, moderator, and author accounts
# - Sample blog posts
# - Categories and tags
# - Terms of service and privacy policy
```

**Option B: Start with empty database**

Just start the server and register your first admin user manually.

#### 5. Start the development servers

**Option A: Run both servers concurrently (Recommended)**

```bash
# From the root directory
npm run dev
```

This starts:

- Backend API server on `http://localhost:4001`
- Frontend dev server on `http://localhost:5173`

**Option B: Run servers separately**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### 6. Access the application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4001
- **API Docs**: http://localhost:4001/api/docs
- **Health Check**: http://localhost:4001/api/health

## 🔐 Test Accounts

After running the seed script, you can login with these accounts:

| Role      | Email                            | Password      | Description                |
| --------- | -------------------------------- | ------------- | -------------------------- |
| Admin     | admin@admas.edu.et               | Admin123!     | Full system access         |
| Moderator | sarah.johnson@admas.edu.et       | Moderator123! | Content moderation         |
| Author    | emma.wilson@student.admas.edu.et | Student123!   | Create and publish posts   |
| Author    | john.doe@student.admas.edu.et    | Student123!   | Another author for testing |

## 📝 API Documentation

### Authentication Endpoints

| Endpoint                    | Method | Description            |
| --------------------------- | ------ | ---------------------- |
| `/api/auth/register`        | POST   | Register new user      |
| `/api/auth/login`           | POST   | User login             |
| `/api/auth/logout`          | POST   | User logout            |
| `/api/auth/refresh-token`   | POST   | Refresh access token   |
| `/api/auth/verify-email`    | POST   | Verify email address   |
| `/api/auth/forgot-password` | POST   | Request password reset |
| `/api/auth/reset-password`  | PUT    | Reset password         |

### Blog Post Endpoints

| Endpoint                  | Method | Description           | Auth Required |
| ------------------------- | ------ | --------------------- | ------------- |
| `/api/posts`              | GET    | Get all posts         | No            |
| `/api/posts`              | POST   | Create new post       | Yes (Author)  |
| `/api/posts/:id`          | GET    | Get single post       | No            |
| `/api/posts/:id`          | PUT    | Update post           | Yes (Author)  |
| `/api/posts/:id`          | DELETE | Delete post           | Yes (Author)  |
| `/api/posts/:id/like`     | POST   | Like a post           | Yes           |
| `/api/posts/:id/like`     | DELETE | Unlike a post         | Yes           |
| `/api/posts/search`       | GET    | Search posts          | No            |
| `/api/posts/category/:id` | GET    | Get posts by category | No            |

### Following Feed Endpoints

| Endpoint                      | Method | Description                     | Auth Required |
| ----------------------------- | ------ | ------------------------------- | ------------- |
| `/api/feed/following`         | GET    | Get personalized feed           | Yes           |
| `/api/feed/following/authors` | GET    | Get followed authors            | Yes           |
| `/api/feed/suggestions`       | GET    | Get suggested authors to follow | Yes           |
| `/api/users/:id/follow`       | POST   | Follow a user                   | Yes           |
| `/api/users/:id/follow`       | DELETE | Unfollow a user                 | Yes           |
| `/api/users/:id/followers`    | GET    | Get user's followers            | No            |
| `/api/users/:id/following`    | GET    | Get users being followed        | No            |

### Admin Endpoints

| Endpoint                       | Method | Description            | Auth Required |
| ------------------------------ | ------ | ---------------------- | ------------- |
| `/api/admin/users`             | GET    | Get all users          | Yes (Admin)   |
| `/api/admin/users/:id/roles`   | PUT    | Update user roles      | Yes (Admin)   |
| `/api/admin/users/:id/suspend` | PUT    | Suspend user           | Yes (Admin)   |
| `/api/admin/stats`             | GET    | Get system statistics  | Yes (Admin)   |
| `/api/admin/settings`          | GET    | Get system settings    | Yes (Admin)   |
| `/api/admin/settings`          | PUT    | Update system settings | Yes (Admin)   |

## 🧪 Running Tests

```bash
# Backend tests
cd backend
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Production Deployment

This project is configured for easy deployment to **Netlify** (frontend) and **Render** (backend).

### Quick Deployment (30 minutes)

1. **Prepare the project**

   ```bash
   # Run production preparation script
   bash prepare-production.sh  # Linux/Mac
   # OR
   prepare-production.bat      # Windows
   ```

2. **Push to GitHub**

   ```bash
   # Run GitHub setup script
   bash setup-github.sh        # Linux/Mac
   # OR
   setup-github.bat            # Windows
   ```

3. **Deploy Backend to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Connect your GitHub repository
   - Configure environment variables
   - Deploy! (5-10 minutes)

4. **Deploy Frontend to Netlify**
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Connect your GitHub repository
   - Configure environment variables
   - Deploy! (3-5 minutes)

### Deployment Documentation

- **📖 [Quick Start Deployment Guide](./QUICK_START_DEPLOYMENT.md)** - 30-minute deployment walkthrough
- **📋 [Production Checklist](./PRODUCTION_CHECKLIST.md)** - Complete pre-deployment checklist
- **📚 [Detailed Deployment Guide](./DEPLOYMENT.md)** - Comprehensive deployment instructions
- **🔒 [Security Guide](./SECURITY.md)** - Security best practices and configuration

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Frontend (Netlify)                                     │
│  - React SPA                                            │
│  - Automatic HTTPS                                      │
│  - Global CDN                                           │
│  - Free tier: 100GB bandwidth                           │
│                                                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ HTTPS API Calls
                 │
┌────────────────▼────────────────────────────────────────┐
│                                                         │
│  Backend (Render)                                       │
│  - Node.js + Express                                    │
│  - WebSocket support                                    │
│  - Automatic HTTPS                                      │
│  - Free tier: Sleeps after 15min                        │
│                                                         │
└────────┬────────────┬────────────┬─────────────────────┘
         │            │            │
         │            │            │
    ┌────▼───┐   ┌────▼────┐  ┌───▼────┐
    │MongoDB │   │Cloudinary│  │OpenAI  │
    │ Atlas  │   │(Images)  │  │(AI)    │
    │(Free)  │   │(Free)    │  │(Paid)  │
    └────────┘   └──────────┘  └────────┘
```

### Cost Estimate

**Free Tier (Perfect for Development/Testing):**

- Render: Free (sleeps after 15 min inactivity)
- Netlify: Free (100GB bandwidth/month)
- MongoDB Atlas: Free (512MB storage)
- Cloudinary: Free (25GB storage)
- **Total: $0/month**

**Production Tier (Recommended for Real Users):**

- Render: $7/month (no sleep, better performance)
- MongoDB Atlas: $9/month (backups, more storage)
- **Total: $16/month**

### Deployment Scripts

The project includes automated deployment scripts:

- `prepare-production.sh` / `.bat` - Checks project for production readiness
- `setup-github.sh` / `.bat` - Initializes git and pushes to GitHub
- `backend/render.yaml` - Render deployment configuration
- `frontend/netlify.toml` - Netlify deployment configuration

## 🔧 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution**: Make sure MongoDB is running

```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

**2. Port Already in Use**

```
Error: listen EADDRINUSE: address already in use :::4001
```

**Solution**: Change the PORT in backend/.env or kill the process using that port

**3. Module Not Found Errors**

```
Error: Cannot find module 'express'
```

**Solution**: Reinstall dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

**4. CORS Errors**
**Solution**: Ensure CLIENT_URL in backend/.env matches your frontend URL

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📄 License

This project is developed for Admas University.

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📜 Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🔒 Security

Found a security vulnerability? Please read our [Security Policy](SECURITY.md) for responsible disclosure guidelines.

## 👥 Contributors

Admas University Development Team

### How to Contribute

- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🔧 Submit pull requests

## 📞 Support

- 📧 Email: support@admas.edu.et
- 🐛 Issues: [GitHub Issues](https://github.com/Ab-xo/Fullstack-Collaborative-Blogging-Platform-for-Admas-Univeristy/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Ab-xo/Fullstack-Collaborative-Blogging-Platform-for-Admas-Univeristy/discussions)

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

## 🙏 Acknowledgments

- Admas University for supporting this project
- All contributors who have helped shape this platform
- Open source community for amazing tools and libraries

---

<div align="center">

**Made with ❤️ by Admas University Development Team**

[Report Bug](https://github.com/Ab-xo/Fullstack-Collaborative-Blogging-Platform-for-Admas-Univeristy/issues) · [Request Feature](https://github.com/Ab-xo/Fullstack-Collaborative-Blogging-Platform-for-Admas-Univeristy/issues) · [Documentation](./docs)

</div>

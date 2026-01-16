# Admas University Blog - Frontend

A modern, responsive React frontend application for the Admas University Blog platform.

## Features

- ✨ Modern UI with Tailwind CSS
- 🌓 Dark mode support
- 📱 Fully responsive design (mobile, tablet, desktop)
- 🔐 JWT-based authentication with automatic token refresh
- 🎨 Smooth animations with Framer Motion
- 🎯 Type-safe API client with Axios
- 📊 Advanced analytics dashboard
- ⚡ Fast development with Vite
- 🎭 Component library with reusable UI components

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **UI Components**: Headless UI
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Prerequisites

- Node.js 16+ and npm
- Backend API running on `http://localhost:4001`

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

3. Update `.env` with your configuration:

```env
VITE_API_URL=http://localhost:4001/api
VITE_APP_NAME=Admas University Blog
```

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Building for Production

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── api/                    # API client and endpoints
│   ├── client.js          # Axios instance with interceptors
│   ├── auth.js            # Authentication endpoints
│   ├── users.js           # User endpoints
│   ├── admin.js           # Admin endpoints
│   └── posts.js           # Blog post endpoints
├── components/            # Reusable components
│   ├── common/            # Shared UI components
│   └── layout/            # Layout components
├── contexts/              # React contexts
│   ├── AuthContext.jsx    # Authentication state
│   └── ThemeContext.jsx   # Theme management
├── hooks/                 # Custom hooks
│   ├── useAuth.js         # Authentication hook
│   ├── useTheme.js        # Theme hook
│   ├── useMediaQuery.js   # Responsive hook
│   ├── useDebounce.js     # Debounce hook
│   └── usePagination.js   # Pagination hook
├── pages/                 # Page components
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin pages
│   └── posts/             # Blog post pages
├── routes/                # Route configuration
│   ├── AppRoutes.jsx      # Main routes
│   ├── ProtectedRoute.jsx # Auth guard
│   └── AdminRoute.jsx     # Admin guard
├── utils/                 # Utility functions
│   └── storage.js         # LocalStorage helpers
├── styles/                # Global styles
│   └── index.css          # Tailwind imports
├── App.jsx                # Root component
└── main.jsx               # Entry point
```

## Available Routes

### Public Routes

- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/verify-email` - Email verification
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset form

### Protected Routes (Requires Authentication)

- `/dashboard` - User dashboard
- `/profile` - User profile
- `/settings` - User settings
- `/posts` - Blog feed
- `/posts/:id` - Post detail
- `/posts/create` - Create post
- `/posts/edit/:id` - Edit post
- `/my-posts` - User's posts

### Admin Routes (Requires Admin Role)

- `/admin` - Admin dashboard
- `/admin/pending` - Pending users
- `/admin/users` - All users
- `/admin/stats` - Statistics

## Key Features

### Authentication

- JWT-based authentication with automatic token refresh
- Secure token storage in localStorage
- Protected routes with authentication guards
- Role-based access control (admin routes)

### Responsive Design

- Mobile-first approach
- Breakpoints: mobile (< 768px), tablet (768-1024px), desktop (> 1024px)
- Touch-friendly controls on mobile
- Adaptive layouts for all screen sizes

### Theme System

- Light and dark mode support
- Auto mode (follows system preference)
- Persistent theme selection
- Smooth transitions between themes

### API Integration

- Centralized API client with Axios
- Automatic token attachment to requests
- Token refresh on 401 errors
- Comprehensive error handling
- Request/response interceptors

## Environment Variables

| Variable                        | Description                         | Default                     |
| ------------------------------- | ----------------------------------- | --------------------------- |
| `VITE_API_URL`                  | Backend API URL                     | `http://localhost:4001/api` |
| `VITE_APP_NAME`                 | Application name                    | `Admas University Blog`     |
| `VITE_CLOUDINARY_CLOUD_NAME`    | Cloudinary cloud name (optional)    | -                           |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset (optional) | -                           |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting

## License

MIT License - see LICENSE file for details

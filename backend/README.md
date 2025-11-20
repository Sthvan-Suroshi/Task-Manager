# Kanban Board Backend

A robust Node.js backend API for a real-time collaborative Kanban board application. Built with Express.js, MongoDB, and Socket.io for seamless real-time collaboration.

## Features

- **RESTful API**: Complete CRUD operations for projects and tasks
- **Real-time Collaboration**: WebSocket integration for live updates and cursor tracking
- **Authentication**: JWT-based secure authentication system
- **Project Management**: Full project lifecycle management
- **Task Operations**: Comprehensive task CRUD with real-time synchronization
- **MongoDB Integration**: Cloud-ready database with MongoDB Atlas support
- **CORS Support**: Configured for cross-origin requests

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **Validation**: Built-in request validation
- **Environment**: dotenv for configuration

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

## Getting Started

### Installation

1. Clone the repository
2. Navigate to the backend directory:

   ```bash
   cd backend
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create environment file:

   ```bash
   cp .env.example .env
   ```

5. Configure environment variables in `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   JWT_SECRET=your-super-secret-jwt-key
   PORT=3000
   ```

### Development

Start the development server:

```bash
npm run dev
```

For production:

```bash
npm start
```

The API will be available at `http://localhost:3000`

##  Project Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   └── projectController.js  # Project and task operations
│   ├── models/
│   │   ├── User.js              # User schema
│   │   └── Project.js           # Project and task schemas
│   ├── routes/
│   │   ├── authRoutes.js        # Authentication routes
│   │   └── projectRoutes.js     # Project management routes
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   └── config/                  # Configuration files
├── .env                         # Environment variables
├── index.js                     # Main application entry point
└── package.json                 # Dependencies and scripts
```

##  Configuration

### Environment Variables

| Variable      | Description               | Required | Default |
| ------------- | ------------------------- | -------- | ------- |
| `MONGODB_URI` | MongoDB connection string | Yes      | -       |
| `JWT_SECRET`  | JWT signing secret        | Yes      | -       |
| `PORT`        | Server port               | No       | 3000    |

### Database Schema

#### User Model

```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  name: String (optional)
}
```

#### Project Model

```javascript
{
  name: String (required),
  columns: [{
    id: String,
    title: String,
    tasks: [{
      id: String,
      title: String,
      description: String,
      deadline: Date
    }]
  }]
}
```

##  API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Projects

- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks

- `POST /api/projects/:projectId/tasks` - Add task to project
- `PUT /api/projects/:projectId/tasks/:taskId` - Update task
- `DELETE /api/projects/:projectId/tasks/:taskId` - Delete task
- `POST /api/projects/:projectId/move-task` - Move task between columns

## 🔌 WebSocket Events

### Client to Server

- `join-project` - Join a project room
- `leave-project` - Leave a project room
- `cursor-move` - Send cursor position updates

### Server to Client

- `cursor-update` - Receive cursor updates from other users
- `task-added` - Task creation notification
- `task-updated` - Task update notification
- `task-deleted` - Task deletion notification
- `task-moved` - Task movement notification
- `project-created` - Project creation notification
- `project-updated` - Project update notification
- `project-deleted` - Project deletion notification

## 🔐 Authentication

### JWT Tokens

- Access tokens are required for protected routes
- Tokens are sent in the `Authorization: Bearer <token>` header
- WebSocket connections require token authentication

### Middleware

- `auth.js` middleware validates JWT tokens for protected routes
- Socket.io connections are authenticated using the same JWT validation

##  Real-time Features

### Cursor Tracking

- Users can see live cursors of collaborators
- Cursors are scoped to individual projects
- Real-time position updates via WebSocket

### Live Updates

- All task and project changes are broadcasted instantly
- Changes appear immediately for all connected users
- Optimistic updates with server synchronization

##  Deployment

### Environment Setup

1. Set environment variables in production
2. Ensure MongoDB Atlas IP whitelist includes your server
3. Configure CORS origins for your frontend domain

### Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Configure MongoDB Atlas connection
- [ ] Set appropriate CORS origins
- [ ] Enable HTTPS in production
- [ ] Set up proper logging
- [ ] Configure rate limiting if needed

## Testing

Run tests:

```bash
npm test
```

## Monitoring

The application includes:

- Request logging
- Error handling middleware
- Database connection monitoring
- WebSocket connection tracking

## Security

- JWT token-based authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation
- Secure headers (recommended for production)

## API Usage Examples

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password","name":"User Name"}'
```

### Create Project

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Project"}'
```

### Add Task

```bash
curl -X POST http://localhost:3000/api/projects/PROJECT_ID/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"columnId":"todo","task":{"title":"New Task","description":"Task description"}}'
```

.

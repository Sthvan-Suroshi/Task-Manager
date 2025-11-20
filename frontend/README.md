# Kanban Board Frontend

A modern, real-time collaborative Kanban board application built with React, TypeScript, and Vite. Features drag-and-drop task management, real-time cursor tracking, and seamless project collaboration.

##  Features

- **Real-time Collaboration**: See live cursors of other users working on the same project
- **Drag & Drop**: Intuitive task management with smooth drag-and-drop functionality
- **Project Management**: Create, edit, and delete projects with full CRUD operations
- **Task Management**: Add, edit, update, and delete tasks with rich metadata
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **WebSocket Integration**: Real-time updates for all collaborative features
- **Authentication**: Secure JWT-based authentication system

##  Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Library**: Radix UI, Tailwind CSS, Lucide Icons
- **State Management**: Zustand
- **Drag & Drop**: @dnd-kit
- **Real-time**: Socket.io-client
- **HTTP Client**: Axios

##  Prerequisites

- Node.js (v18 or higher)
- npm or yarn

##  Getting Started

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
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
   VITE_API_BASE_URL=https://your-api-url.com
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   ├── KanbanBoard.tsx    # Main board component
│   │   ├── KanbanColumn.tsx   # Column component with drag-drop
│   │   ├── TaskCard.tsx       # Individual task card
│   │   ├── ProjectSidebar.tsx # Project navigation sidebar
│   │   ├── ProjectPage.tsx    # Main project page wrapper
│   │   └── Login.tsx          # Authentication component
│   ├── stores/
│   │   └── kanbanStore.ts     # Global state management
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions
│   └── assets/                # Static assets
├── public/                    # Public assets
└── .env                       # Environment variables
```

##  Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | Required |

##  Key Components

### KanbanBoard
Main board component that handles project display and real-time cursor tracking.

### TaskCard
Individual task component with edit/delete functionality and drag handles.

### ProjectSidebar
Navigation sidebar for project management and user actions.

### Real-time Features
- **Cursor Tracking**: Shows live cursors of collaborating users
- **Live Updates**: Instant synchronization of task changes across all users
- **Project Rooms**: WebSocket rooms ensure updates are scoped to specific projects

##  Authentication

The application uses JWT tokens for authentication. Login credentials are stored securely and automatically included in API requests.

##  API Integration

Communicates with the backend API for:
- User authentication
- Project CRUD operations
- Task management
- Real-time WebSocket events



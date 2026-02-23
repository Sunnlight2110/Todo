# 📝 AI-Powered Todo App

A full-stack Todo application with intelligent AI task management. Built with **FastAPI** backend, **React + Vite** frontend, and powered by **MCP (Model Context Protocol)** for natural language task operations.

![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)
![React](https://img.shields.io/badge/React-19+-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

> **Note:** The frontend is minimal and was vibe-coded for demo purposes. My real expertise is in **backend development** — the FastAPI architecture, database design, JWT authentication, and MCP integration are the core focus of this project.

---

## 🌟 Features

### Core Functionality
- ✅ **Create & Manage Todos** - Full CRUD operations with intuitive UI
- ✅ **Prioritization** - Color-coded priorities (High/Medium/Low)
- ✅ **Task Status Tracking** - Pending, In Progress, Completed, Cancelled states
- ✅ **Bulk Operations** - Handle multiple tasks simultaneously
- ✅ **Real-time Updates** - Auto-refresh todo lists (2-second polling)

### AI-Powered Features
- 🤖 **Natural Language Processing** - Manage tasks through conversational AI
- 💬 **Chat Interface** - Dedicated AI chat panel for task instructions
- 🎯 **Intelligent Task Creation** - "Create 3 tasks for this week" → Automatic generation
- 📊 **Smart Queries** - "Show me all high-priority tasks due tomorrow"
- 🔄 **MCP Integration** - Seamless Model Context Protocol support

### UI/UX
- 🎨 **Dark Mode Aesthetic** - Modern SaaS-style design
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🌙 **Tailwind CSS Styling** - Beautiful, consistent styling
- ⚡ **Real-time Feedback** - Instant visual updates and error handling
- 📅 **Calendar View** - Schedule tasks by date
- 🏷️ **Todo Cards** - Multiple view modes (list, grid, calendar)

### Authentication & Security
- 🔐 **JWT Authentication** - Secure token-based auth
- 👤 **User Profiles** - Persistent user data with credentials
- 🔒 **Password Security** - Argon2 hashing
- 📧 **Email Validation** - Built-in email verification

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern async Python web framework
- **SQLAlchemy** - ORM for database operations
- **PostgreSQL** - Robust relational database
- **Alembic** - Database migrations
- **MCP** - Model Context Protocol for AI integration
- **JWT** - Secure authentication

### Frontend
- **React 19** - UI library
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Python 3.9+** - Backend runtime
- **Node.js 18+** - Frontend runtime
- **PostgreSQL 12+** - Database
- **Git** - Version control

---

## 🚀 Quick Start

### Backend Setup

```bash
# Navigate to app directory
cd app

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env  # Configure as needed

# Initialize database
alembic upgrade head

# Start FastAPI server
uvicorn main:app --reload
```

Expected output: `Uvicorn running on http://127.0.0.1:8000`

### Frontend Setup

```bash
# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Expected output: `Local: http://localhost:5173`

### Access the Application

Open your browser and navigate to: **http://localhost:5173**

---

## 📖 Project Structure

```
Fast API/
├── app/                          # Backend (FastAPI)
│   ├── main.py                   # Application entry point
│   ├── config.py                 # Environment configuration
│   ├── database.py               # Database connection
│   ├── auth/                     # Authentication module
│   │   ├── router.py             # Auth endpoints
│   │   ├── models.py             # SQLAlchemy models
│   │   ├── schemas.py            # Pydantic schemas
│   │   └── jwt.py                # JWT utilities
│   ├── mcp_config/               # MCP integration
│   │   └── server_setup.py       # MCP server configuration
│   ├── migrations/               # Alembic migrations
│   └── requirements.txt          # Python dependencies
│
├── frontend/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── main.jsx              # Entry point
│   │   ├── App.jsx               # Root component
│   │   ├── components/           # Reusable components
│   │   │   ├── Header.jsx        # App header with user profile
│   │   │   ├── TodoForm.jsx      # Task creation form
│   │   │   ├── TodoList.jsx      # Todo list display
│   │   │   ├── TodoCardView.jsx  # Card view component
│   │   │   ├── TodoCalendarView.jsx # Calendar view
│   │   │   ├── ChatInterface.jsx # AI chat interface
│   │   │   ├── Login.jsx         # Login form
│   │   │   ├── Register.jsx      # Registration form
│   │   │   ├── ProtectedRoute.jsx # Route protection
│   │   │   └── ProfileModal.jsx  # User profile display
│   │   ├── context/              # React context
│   │   │   └── AuthContext.jsx   # Global auth state
│   │   ├── api/                  # API clients
│   │   │   └── client.js         # Axios http client
│   │   └── utils/                # Utility functions
│   ├── public/                   # Static assets
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.js        # Tailwind CSS config
│   ├── package.json              # Node dependencies
│   └── Makefile                  # Development commands
│
├── Makefile                      # Root development commands
├── requirements.txt              # Root dependencies
└── README.md                     # This file
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login |
| GET | `/auth/me` | Get current user profile |
| POST | `/auth/logout` | User logout |

### Todo Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/todos` | Create new todo |
| GET | `/todos` | Get all todos |
| GET | `/todos/{id}` | Get single todo |
| PUT | `/todos/{id}` | Update todo |
| DELETE | `/todos/{id}` | Delete todo |
| POST | `/todos/bulk` | Bulk operations |

### AI Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat` | Send message to AI |
| POST | `/chat/process` | Process AI commands |

---

## 💡 Usage Examples

### Create a Task (AI Chat)
```
User: "Create a task to review reports by tomorrow"
AI: Creates task with title "Review reports", due_date set to tomorrow, status pending
```

### Query Tasks
```
User: "Show me all high-priority tasks"
AI: Returns filtered list of high-priority todos
```

### Bulk Operations
```
User: "Mark tasks 1, 2, 3 as completed"
AI: Updates status to completed for specified tasks
```

### Task Management
```
User: "Create 3 tasks for this week"
AI: Generates 3 intelligent tasks distributed through the week
```

---

## 🧪 Testing

Run tests for the backend:

```bash
cd app
pytest
```

Run frontend linting:

```bash
cd frontend
npm run lint
```

---

## 📝 Environment Variables

Create a `.env` file in the `app/` directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/todo_db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Server
DEBUG=True
```

---

## 🏗️ Building for Production

### Frontend Build

```bash
cd frontend
npm run build
```

Creates optimized bundle in `frontend/dist/`

### Backend Deployment

```bash
cd app
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## 🔄 Database Migrations

Create a new migration:

```bash
cd app
alembic revision --autogenerate -m "Description of changes"
```

Apply migrations:

```bash
alembic upgrade head
```

View migration history:

```bash
alembic history
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is already in use
lsof -i :8000

# Check database connection
psql postgresql://user:password@localhost:5432/todo_db
```

### Frontend won't compile
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Database issues
```bash
cd app
# Reset migrations
alembic downgrade base
alembic upgrade head
```

### CORS errors
- Ensure backend CORS middleware includes frontend URL
- Check `app/main.py` for allowed origins
- Restart backend server after changes

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Himanshu More**

---

## 🎯 Roadmap

- [ ] Real-time websocket updates (replace polling)
- [ ] Email notifications for task reminders
- [ ] Task templates and recurring tasks
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Integration with calendar apps (Google Calendar, Outlook)
- [ ] Improved AI with custom models

---

**Happy task managing! 🚀**
# Task Management System

A full-stack Task Management System built using the **MERN stack (MongoDB, Express.js, React.js, and Node.js)**. The application helps teams organize projects, manage tasks, track progress, and collaborate efficiently through a centralized dashboard.

Designed with scalability, maintainability, and real-world application workflows in mind.

## 🚀 Key Features

- **Dashboard:** Centralized dashboard for monitoring projects, tasks, and activities.
- **Project Management:** Create, organize, and manage multiple projects.
- **Task Management:** Create, update, assign, and track tasks throughout their lifecycle.
- **Authentication & Authorization:** Secure user authentication and role-based access control.
- **Permission Management:** Control access to application features based on user roles and permissions.
- **Real-Time Notifications:** Real-time updates and notifications using Socket.IO.
- **Profile Management:** Manage user profiles and account information.
- **Global Search:** Search and access application data efficiently.
- **API Integration:** RESTful APIs for communication between frontend and backend.

## 🛠️ Technology Stack

### Frontend
- React.js
- JavaScript (ES6+)
- Redux Toolkit
- React Router
- Bootstrap / Reactstrap
- Axios

### Backend
- Node.js
- Express.js
- RESTful APIs
- JWT Authentication
- Socket.IO

### Database & Caching
- MongoDB
- Mongoose
- Redis

### DevOps & Deployment
- Docker
- Docker Compose
- AWS EC2 / ECS
- Amazon ECR
- Nginx
- GitHub Actions (CI/CD)

## 🏗️ Application Architecture

The application follows a client-server architecture.

```text
              ┌──────────────────────┐
              │      React.js        │
              │      Frontend        │
              └──────────┬───────────┘
                         │
                    REST APIs
                         │
              ┌──────────▼───────────┐
              │     Node.js          │
              │     Express.js       │
              └──────────┬───────────┘
                         │
             ┌───────────┼───────────┐
             │           │           │
        ┌────▼────┐ ┌────▼────┐ ┌────▼────┐
        │ MongoDB │ │  Redis  │ │Socket.IO│
        │Database │ │ Caching │ │Realtime │
        └─────────┘ └─────────┘ └─────────┘
```

## ⚙️ Installation & Setup

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- MongoDB
- Redis (if using Redis features)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/puneet0408/task-management.git

cd task-management
```

### 2. Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file in the backend directory and configure your environment variables.

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REDIS_URL=your_redis_connection_string
```

### 3. Start Backend

```bash
npm run dev
```

### 4. Frontend Setup

Open another terminal:

```bash
cd frontend

npm install

npm run dev
```

### 5. Access the Application

Open the frontend URL displayed by your development server.

## 🐳 Docker & Deployment

The application uses Docker for containerization and deployment.

Deployment technologies include:

- Docker and Docker Compose for container management.
- Amazon ECR for Docker image management.
- AWS ECS for container orchestration.
- Nginx for reverse proxy configuration.
- GitHub Actions for CI/CD automation.

## 🔐 Security

- JWT-based authentication.
- Protected API routes.
- Role-based authorization.
- Environment-based configuration.
- Secure handling of application credentials.

## 👨‍💻 Developer

**Puneet Virmani**

Full Stack Developer | React.js | Node.js | MongoDB | Redis | AWS

- GitHub: [@puneet0408](https://github.com/puneet0408)

---

⭐ If you find this project interesting, consider giving it a star!

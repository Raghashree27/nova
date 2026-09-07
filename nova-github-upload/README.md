# NOVA ? Team Productivity Platform
> **Plan. Collaborate. Deliver.**

A full-stack, enterprise-grade project and team productivity web application built for modern engineering and product teams.

---

## Architecture & Technology Stack

Evaluated across the complete application stack:

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons | Responsive modern SaaS UI, Dark theme, Interactive Kanban Board with column transitions, Filterable Task Table, Executive Analytics Dashboard. |
| **Backend & API** | Next.js REST API Route Handlers (`/api/*`) | Modular, type-safe API with request validation, structured error responses, and cookie-based session verification. |
| **Authentication** | JWT (JSON Web Tokens) + HTTP-only cookies, `bcryptjs` | User registration, login, logout, profile validation, and role-based access (`ADMIN`, `MANAGER`, `MEMBER`). |
| **Database** | Prisma ORM with SQLite (or PostgreSQL) | Relational schema with entities: `User`, `Project`, `ProjectMember`, `Task`, `Comment`, `ActivityLog`. |
| **Deployment** | Docker, Docker Compose, Standalone Next.js | Containerized production build, environment configuration (`.env.example`), and zero-friction setup. |

---

## Core Features

1. **Authentication & Access Control**
   - Secure registration & login with password hashing via `bcryptjs`.
   - JWT tokens stored in HTTP-only cookies with Bearer header fallback.
   - Demo accounts available on the login page for instant evaluation.
   - Roles: `ADMIN`, `MANAGER`, `MEMBER`.

2. **Project Management**
   - Create, edit, and view projects with unique keys (e.g., `NOVA`, `MOB`, `SEC`).
   - Priority levels (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) and status workflows (`PLANNING`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`).
   - Visual progress bars dynamically calculated based on completed tasks.
   - Team member assignments and budget tracking.

3. **Task Workflows & Interactive Kanban Board**
   - 4-column Kanban board: **To Do**, **In Progress**, **In Review**, **Done**.
   - 1-click status transitions with immediate reactivity.
   - Multi-column sorting and filtering (search, priority, status, assignee).
   - Global task directory across all workspaces.

4. **Team Collaboration & Audit Trail**
   - Real-time task comments with author avatars and timestamps.
   - Comprehensive activity stream tracking task moves, creations, and updates.
   - Team directory with member workloads and invitation modal.

5. **Executive Analytics Dashboard**
   - Total Projects, Tasks, Completion Rate %, and Overdue Task indicators.
   - Visual Task Workflow Distribution bar & legend cards.
   - Priority allocation matrix.
   - Team workload allocation leaderboard.

---

## Instant Demo Credentials

Pre-seeded accounts ready to log in immediately:

| Email | Password | Role | Description |
|---|---|---|---|
| `alex@novahq.com` | `Password123!` | **ADMIN** | Head of Engineering |
| `sarah@novahq.com` | `Password123!` | **MANAGER** | Lead Product Manager |
| `marcus@novahq.com` | `Password123!` | **MEMBER** | Senior Full Stack Engineer |
| `elena@novahq.com` | `Password123!` | **MEMBER** | UI/UX Designer |
| `david@novahq.com` | `Password123!` | **MEMBER** | DevOps & QA Engineer |

*(Alternatively, click any of the instant demo buttons on the login page).*

---

## Getting Started (Local Development)

### 1. Prerequisites
- Node.js 18+ or 20+
- npm

### 2. Clone & Install
```bash
cd nova-platform
npm install
```

### 3. Database Setup & Seed
```bash
# Push Prisma schema to SQLite
npx prisma db push

# Populate with realistic demo data
npx tsx prisma/seed.ts
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## REST API Documentation

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Log in and receive JWT cookie | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Authenticated |
| `POST` | `/api/auth/logout` | Clear auth session | Authenticated |
| `GET` | `/api/projects` | List projects (supports search, status, priority filters) | Authenticated |
| `POST` | `/api/projects` | Create a new project | Authenticated |
| `GET` | `/api/projects/:id` | Get project details, tasks, members & activities | Authenticated |
| `PUT` | `/api/projects/:id` | Update project properties | Authenticated |
| `DELETE` | `/api/projects/:id` | Delete a project | Authenticated |
| `GET` | `/api/tasks` | Get all tasks (filterable by project, status, priority, search) | Authenticated |
| `POST` | `/api/tasks` | Create a new task | Authenticated |
| `GET` | `/api/tasks/:id` | Get task details, comments, and audit logs | Authenticated |
| `PUT` | `/api/tasks/:id` | Update task status, priority, or assignee | Authenticated |
| `DELETE` | `/api/tasks/:id` | Delete task | Authenticated |
| `GET` | `/api/tasks/:id/comments` | List comments for a task | Authenticated |
| `POST` | `/api/tasks/:id/comments` | Add comment to a task | Authenticated |
| `GET` | `/api/analytics` | Fetch aggregated workspace KPIs and workload data | Authenticated |
| `GET` | `/api/team` | List team members with task counts | Authenticated |
| `POST` | `/api/team` | Invite a new team member | Authenticated |

---

## Deployment Instructions

### Docker Deployment
```bash
docker-compose up --build -d
```

### Production Build & Run
```bash
npm run build
npm run start
```

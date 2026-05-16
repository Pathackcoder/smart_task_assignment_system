# Smart Task Assignment System

Full-stack task assignment app using Node.js, Express, MongoDB, Mongoose, JWT, and React.

## What it does

When you create a task, the backend automatically assigns it to the best active user:

1. Calculates each active user's workload.
2. Counts only `pending` and `in_progress` tasks.
3. Uses priority points: `low = 1`, `medium = 3`, `high = 5`.
4. Chooses the user with the lowest workload.
5. If tied, chooses the user with fewer active tasks.
6. If still tied, chooses the oldest created user.

The first registered account becomes `admin`. Admin users can add users, create
tasks, change task status, and manage user availability. Member users can view the
dashboard only.

## Project Structure

```text
backend/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    validators/
frontend/
  src/
    api/
    components/
```

## Run locally

Start MongoDB locally first, then run:

```bash
cd backend
npm install
npm run dev
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

Default backend env:

```env
MONGO_URI=mongodb://127.0.0.1:27017/smart_task_assignment
PORT=5003
```

## Docker

```bash
docker compose up --build
```

## API Summary

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/users` | Yes | Users with workload |
| POST | `/api/users` | Yes | Add team member |
| PATCH | `/api/users/:id/availability` | Yes | Activate/deactivate user |
| GET | `/api/tasks` | Yes | List tasks |
| POST | `/api/tasks` | Yes | Create and auto-assign task |
| PATCH | `/api/tasks/:id` | Yes | Update task status |

Send JWT as:

```http
Authorization: Bearer <token>
```

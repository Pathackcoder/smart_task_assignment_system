# Smart Task Assignment API

Simple Express + MongoDB API that assigns new tasks to the active user with the lowest current workload.

## Assignment Rules

- Active tasks are tasks with `pending` or `in_progress` status.
- Workload points:
  - `low`: 1
  - `medium`: 3
  - `high`: 5
- New tasks go to the active user with the lowest workload.
- If workload is equal, the user with fewer active tasks is selected.
- If still equal, the oldest created user is selected.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Default local MongoDB URI and API port:

```env
MONGO_URI=mongodb://127.0.0.1:27017/smart_task_assignment
PORT=5003
```

## Main Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register and receive JWT |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Current logged-in user |
| GET | `/api/users` | List users with workload |
| POST | `/api/users` | Create a user |
| PATCH | `/api/users/:id/availability` | Update user availability |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create task with auto-assignment |
| PATCH | `/api/tasks/:id` | Update task status/details |
| GET | `/api/tasks/reports/workloads` | Workload summary |

Use the JWT as:

```http
Authorization: Bearer <token>
```

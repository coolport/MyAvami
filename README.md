# MyAvami

MyAvami is a comprehensive, modern, and feature-rich inventory management and point-of-sale (POS) system designed specifically for pharmacies. It provides a complete solution for managing products, suppliers, sales, and employees, with separate interfaces for administrators and staff.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Chakra UI
- **Backend:** Node.js, Express 5, TypeScript, Mongoose
- **Database:** MongoDB
- **Infrastructure:** Docker Compose

## Quick Start (Docker)

Requires only [Docker](https://docs.docker.com/get-docker/).

```bash
docker compose up --build -d
```

| Service  | URL                        |
| -------- | -------------------------- |
| Frontend | http://localhost:5173      |
| API      | http://localhost:5555/test |
| MongoDB  | internal only              |

Notes:

- The API health endpoint is `GET /test`.
- Mongo is not published on the host port (this avoids clashing with a system
  `mongod`). Inspect the database with:
  ```bash
  docker compose exec mongo mongosh
  ```
- Uploaded product images persist in the `uploads` volume; database data
  persists in `mongo-data`. Both survive rebuilds.

## Local Development (without Docker)

Prerequisites: Node.js 20+, a running local `mongod`, Docker (optional).

1. **Install dependencies and start the backend** from the repository root:

   ```bash
   npm install
   npm run dev
   ```

2. **Configure environment variables.** Copy `.env.example` to `.env` at the
   repository root:

   ```
   MONGO_URI=mongodb://localhost:27017/myavamifinal
   PORT=5555
   SESSION_SECRET=change-me
   ```

   The backend reads these on startup. Make sure `MONGO_URI` includes the
   database name.

3. **Start the frontend** in a second terminal:

   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Point the frontend at the backend.** Create `client/.env`:

   ```
   VITE_API_URL=http://localhost:5555
   ```

   This value must match the backend's `PORT`.

## Useful Commands

| Where    | Command            | Description                          |
| -------- | ------------------ | ------------------------------------ |
| root     | `npm run dev`      | Backend dev server with watch/reload |
| root     | `npm run build`    | Compile backend to `dist/`           |
| root     | `npm start`        | Run compiled backend                 |
| root     | `npm run typecheck`| TypeScript check without emitting    |
| client   | `npm run dev`      | Frontend dev server                  |
| client   | `npm run build`    | Production frontend bundle           |
| client   | `npm run lint`     | ESLint                               |
| any      | `docker compose up --build -d` | Build + start full stack |
| any      | `docker compose logs -f backend` | Tail backend logs      |
| any      | `docker compose down` | Stop the stack                    |

## Data

The Docker stack stores data in named volumes (`mongo-data`, `uploads`) so it
survives container rebuilds. To seed a fresh stack from an existing local
database:

```bash
mongodump --uri="mongodb://localhost:27017/myavamifinal" --archive=dump.archive
docker compose exec -T mongo mongorestore --drop --archive < dump.archive
```

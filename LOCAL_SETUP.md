# Running Plane Locally

## Prerequisites

- **Docker Desktop** – Must be **installed and running** before `docker compose`
- **Node.js** 22.18+
- **pnpm** (`corepack enable pnpm`)

## Quick Start

### 1. Start Docker Desktop

On Windows, open **Docker Desktop** and wait until it shows "Docker Desktop is running" in the system tray. The `docker_engine` pipe error means Docker isn't running.

### 2. Install dependencies

```powershell
pnpm install
```

### 3. Start backend services

From the project root (`Maintenance-Dept-Plane`):

```powershell
docker compose -f docker-compose-local.yml up -d
```

Wait for containers to start (first run builds the API image and may take several minutes).

### 4. Start web apps

```powershell
pnpm dev
```

### 5. Use the app

- **http://localhost:3001/god-mode/** – Register as instance admin
- **http://localhost:3000** – Main app (log in with same credentials)

## Troubleshooting

### "The system cannot find the file specified" (docker_engine pipe)

**Docker Desktop is not running.** Start Docker Desktop and wait for it to fully initialize before running `docker compose`.

### "apps/api/.env not found"

Ensure you're in the project root and that `.env` files exist. Run:

```powershell
.\setup.ps1
```

### "variable is not set. Defaulting to a blank string"

The root `.env` file is missing or wasn't loaded. Ensure `.env` exists in the project root (same folder as `docker-compose-local.yml`).

### Path with spaces

If your path contains spaces (e.g. `Lemar encio`), run commands from the project directory and use the `-f` flag:

```powershell
cd "C:\Users\Lemar encio\Maintenance-Dept-Plane"
docker compose -f docker-compose-local.yml up -d
```

### Check container status

```powershell
docker compose -f docker-compose-local.yml ps
```

### View logs

```powershell
docker compose -f docker-compose-local.yml logs -f
```

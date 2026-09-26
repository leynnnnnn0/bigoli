# StampBayan

StampBayan is a Laravel 12 application with an Inertia/React frontend.

## Run with Docker

Requirements: Docker Desktop or Docker Engine with Docker Compose.

```bash
docker compose up --build
```

Open [http://localhost:8000](http://localhost:8000). The first startup creates the
SQLite database, runs migrations, creates the public storage link, and starts the
web server, queue worker, and Laravel scheduler.

To run the seeders:

```bash
docker compose exec app php artisan db:seed
```

To stop the containers while preserving application data:

```bash
docker compose down
```

To also remove the SQLite database and uploaded files:

```bash
docker compose down --volumes
```

The Compose defaults are intended for local development. Before deploying, set a
unique `APP_KEY`, turn off `APP_DEBUG`, set the public `DOCKER_APP_URL`, and
configure a production database and persistent storage. You can change the host
port with `APP_PORT`; when doing so, also set the matching URL, for example:

```bash
APP_PORT=8080 DOCKER_APP_URL=http://localhost:8080 docker compose up
```

## Run without Docker

```bash
composer setup
composer dev
```

# drk-sms
A Next.js application with PostgreSQL database using Drizzle ORM.

## Local Development

The local environment relies on `compose.yml` to spin up Next.js along with a development PostgreSQL database.

1. Ensure you have Docker and Docker Compose installed.
2. Clone the `.env.example` file and configure your credentials:
   ```bash
   cp .env.example .env
   ```
   **Important:** Local development runs Next.js in a container but volume mounts your `src` and handles auto-reloading. You must ensure `RUNING_USER` in your `.env` is set to your host machine's User ID (e.g. `1000:1000`) so Docker commands don't alter local file ownership to `root`.
3. Start the local environment:
   ```bash
   docker compose up -d
   ```
4. Push the schema to set up the blank DB:
   ```bash
   npx drizzle-kit push
   ```
   *Note: In dev, `drizzle-kit push` connects to localhost:5432 which is mapped from `drk_sms_db_dev` depending on your setup.*
5. The application will be available at `http://localhost:8080`.

## Production Deployment

Production deployment uses `docker-compose.prod.yml` and `Dockerfile.prod` to bundle the app into a sleek image, manage the PostgreSQL instance using Docker named volumes, and execute periodic database dumps.

1. Configure production keys in `.env` (like `POSTGRES_PASSWORD`, `JWT_SECRET`, etc.).
2. Build and start the production stack:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
3. Initialize or sync the database schema (since the production DB starts completely blank):
   ```bash
   docker compose -f docker-compose.prod.yml exec drk_sms_web_prod npx drizzle-kit push
   ```

### Database Backups in Production

The `drk_sms_db_backup` container automatically takes full database dumps of `db` every day at midnight and retains them for 7 days according to the `SCHEDULE` and `BACKUP_KEEP_DAYS` specs. 

Backups are seamlessly saved onto your host system within the physical `./storage/db-backups` directory in the project's root folder.

### Restoring from a Backup

If your production database needs to be restored, you can use the SQL dump files generated in `./storage/db-backups` and pipe them directly into the Postgres container.

Assuming you want to restore a file named `db-20260311.sql.gz` stored in your host:

1. Stop the web container so the application isn't writing/reading during restore:
   ```bash
   docker compose -f docker-compose.prod.yml stop drk_sms_web_prod
   ```
2. Empty or drop the database tables (or just drop the current database inside `psql` if you prefer a clean state). Since you are restoring an exact dump, you might just restore over it:
   ```bash
   # Decompress the gzip backup to standard SQL, and inject it into the db container
   gunzip -c ./storage/db-backups/daily/db-20260311.sql.gz | docker compose -f docker-compose.prod.yml exec -i drk_sms_db_prod psql -U postgres -d db
   ```
3. Boot the application back up:
   ```bash
   docker compose -f docker-compose.prod.yml start drk_sms_web_prod
   ```
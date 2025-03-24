# Greenergy nx monorepo

This is an nx monorepo with two apps, one for the frontend and one for the backend.

The backend is a nestjs app with prisma as the database.
The frontend is a Nuxt 3 app.

Shared libraries are in the libs folder.
libs/shared - backend libs
libs/shared-client - frontend libs

## Getting started

# Start db

1. Install docker, docker compose (or docker desktop to instal both)
2. run `docker compose up -d` in the root folder

# Start the application

1. Install dependencies with `npm install`
2. Go to backend app folder with `cd apps/greenergy-app/greenergy-backend`
3. copy .env.example to .env in the backend folder
4. run `npx prisma migrate dev` in the backend folder
5. Go back to root folder
6. run `npx nx run greenergy-backend:serve` to start the backend
7. Open new terminal and run `npx nx run greenergy-frontend:serve` to start the frontend
8. Open http://localhost:4200/register to register a user
9. /dashboard to check the dashboard

# Greenergy test relevant code in the repo

The repo was created using an nx monorepo template, there are some files in the repo which are not relevant to the test.

Relevant paths:

- backend: apps/greenergy-app/greenergy-backend/src/modules/unavailability
- frontend:
  - apps/greenergy-app/greenergy-frontend/src/pages/dashboard/power-outages
  - apps/greenergy-app/greenergy-frontend/src/server/api/unavailability
- libs:
  - be: libs/shared/production-generation-units-unavailability
  - fe: libs/shared-client/outage-client

# TODO, things to improve

- remove prisma types from shared lib - use dtos instead
- grouping logic enhancement, current logic does not work correctly

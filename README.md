# Greenergy nx monorepo

1. Install dependencies with `npm install`
2. Go to backend app folder with `cd apps/greenergy-app/greenergy-backend`
3. copy .env.example to .env
4. run `npx prisma migrate dev` in the backend folder
5. Go back to root folder
6. run `npx nx run greenergy-backend:serve` to start the backend
7. Open new terminal and run `npx nx run greenergy-frontend:serve` to start the frontend
8. Open http://localhost:4200/register to register a user
9. /dashboard to check the dashboard

# TODO:

cleanup backend shared lib:

- remove prisma types from shared lib - use dtos instead

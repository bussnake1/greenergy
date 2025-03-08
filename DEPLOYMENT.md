# Deployment Guide for NX Template Project

This guide explains how to deploy the NX Template project using Dokploy on Hetzner with GitHub auto-deployment.

## Prerequisites

- A Hetzner account with a server running Dokploy
- GitHub repository with your project code
- Dokploy admin access to configure environment variables

## Deployment Architecture

The application is split into three separate Docker Compose files:

1. `docker-compose.db.yml` - PostgreSQL database
2. `docker-compose.backend.yml` - NestJS backend API
3. `docker-compose.frontend.yml` - Nuxt3 frontend

This separation allows for independent scaling, easier updates, and more resilient deployments.

## Environment Variables Setup in Dokploy Admin

Instead of using a local .env file, configure the following environment variables in the Dokploy admin panel:

### Global Variables

- `DOMAIN` - Your domain name (e.g., example.com)
- `NODE_ENV` - Set to "production"

### Database Variables

- `POSTGRES_USER` - Database username
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DB` - Database name

### Backend Variables

- `PORT` - Backend port (typically 3333)
- `DATABASE_URL` - PostgreSQL connection string (should be in the format: `postgresql://postgres:postgres@nx-template-postgres:5432/nx_template?schema=public`)
- `JWT_SECRET` - Secret key for JWT token generation
- `JWT_EXPIRES_IN` - JWT token expiration time

### Frontend Variables

- `HOST` - Frontend host (typically 0.0.0.0)
- `PORT` - Frontend port (typically 3000)
- `API_BASE_URL` - URL to the backend API

## GitHub Auto-Deployment Setup

1. In the Dokploy admin panel, connect your GitHub repository
2. Configure the deployment settings:
   - Repository: Your GitHub repository URL
   - Branch: The branch to deploy (usually main or master)
   - Auto-deploy: Enable
   - Docker Compose files: Specify the three compose files

## Container Naming and Networking

The Docker Compose files use specific container names to ensure services can communicate with each other:

- Database container: `nx-template-postgres`
- Backend container: `nx-template-backend`
- Frontend container: `nx-template-frontend`

All services connect to the `dokploy-network` external network, which is created by Dokploy. This network allows the services to communicate with each other using the container names.

**Important**: The backend service connects to the database using the container name `nx-template-postgres` in the DATABASE_URL. Make sure this matches the container name in the database Docker Compose file.

## Deployment Process

With GitHub auto-deployment configured:

1. Make changes to your code
2. Commit and push to your GitHub repository
3. Dokploy automatically detects the push and deploys your services
4. Environment variables are pulled from Dokploy admin settings

### Deployment Order

Dokploy will deploy your services in the following order:

1. Database (docker-compose.db.yml)
2. Backend (docker-compose.backend.yml)
3. Frontend (docker-compose.frontend.yml)

## Verification

After deployment, verify that all services are running in the Dokploy admin panel.

You should be able to access:

- Frontend: https://your-domain.com
- Backend API: https://api.your-domain.com/api

## Database Migrations

To run database migrations after deployment, you can set up a post-deployment hook in Dokploy:

```bash
npx prisma migrate deploy
```

## Troubleshooting

### Checking Logs

To check logs for any service, use the Dokploy admin panel's logging interface.

### Restarting Services

To restart a service, use the Dokploy admin panel's service management interface.

## Rollback

To rollback to a previous version:

1. In the Dokploy admin panel, navigate to the deployment history
2. Select the previous successful deployment
3. Click "Rollback to this version"

## Scaling

To scale a service (if supported by Dokploy):

1. In the Dokploy admin panel, navigate to the service settings
2. Adjust the number of replicas for the service
3. Apply the changes

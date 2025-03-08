# NX Greenergy Project Deployment

This document provides a quick overview of the deployment configuration for the NX Greenergy project using GitHub auto-deployment with Dokploy.

## Deployment Files

The project includes the following deployment files:

- `docker-compose.db.yml` - PostgreSQL database configuration
- `docker-compose.backend.yml` - NestJS backend API configuration
- `docker-compose.frontend.yml` - Nuxt3 frontend configuration
- `DEPLOYMENT.md` - Detailed deployment instructions

## Deployment Architecture

The application is deployed as three separate services:

1. **Database** - PostgreSQL database for storing application data
2. **Backend** - NestJS API that connects to the database
3. **Frontend** - Nuxt3 frontend that connects to the backend API

## Deployment Order

The services are deployed in the following order:

1. Database (dokploy.deploy.order=1)
2. Backend (dokploy.deploy.order=2)
3. Frontend (dokploy.deploy.order=3)

## Environment Variables

All environment variables are configured in the Dokploy admin panel. See `DEPLOYMENT.md` for a complete list of required environment variables.

## GitHub Auto-Deployment

The project is configured for GitHub auto-deployment:

1. Push changes to the GitHub repository
2. Dokploy automatically detects the changes
3. Dokploy deploys the services in the correct order
4. Environment variables are pulled from Dokploy admin settings

## Container Naming and Networking

The services use specific container names to ensure proper communication:

- **Database**: `greenergy-postgres`
- **Backend**: `greenergy-backend`
- **Frontend**: `greenergy-frontend`

All services connect to the `dokploy-network` external network created by Dokploy. This network allows services to communicate with each other using container names.

**Important**: The backend service connects to the database using the container name in the DATABASE_URL environment variable. The correct format is:

```
postgresql://postgres:postgres@greenergy-postgres:5432/greenergy_db?schema=public
```

## Domain Configuration

- Frontend: https://your-domain.com
- Backend API: https://api.your-domain.com/api

## For More Information

See `DEPLOYMENT.md` for detailed deployment instructions.

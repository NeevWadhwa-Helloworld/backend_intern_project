# Free Deployment Guide

## Recommended free hosting

Use Render for both the backend and frontend.

### 1. Backend

1. Create a MongoDB Atlas free cluster.
2. Copy the connection string and create a Render web service from the repository.
3. Set the following environment variables:
   - NODE_ENV=production
   - PORT=10000
   - MONGODB_URI=<your-mongodb-atlas-uri>
   - JWT_SECRET=<strong-random-value>
   - FRONTEND_URL=https://<your-frontend-url>.onrender.com
   - CORS_ORIGIN=https://<your-frontend-url>.onrender.com
   - COOKIE_SECURE=true
   - ALLOW_ALL_ORIGINS=false
   - SWAGGER_URL=https://<your-backend-url>.onrender.com
   - BACKEND_URL=https://<your-backend-url>.onrender.com
4. Deploy.

### 2. Frontend

1. Create a Render static site from the repository.
2. Set build command:
   - npm install
   - npm run build
3. Set publish directory to dist.
4. Set environment variable:
   - VITE_API_URL=https://<your-backend-url>.onrender.com
5. Deploy.

### 3. Local Docker fallback

Run:

```bash
docker compose up --build
```

Then open:

- http://localhost:5173 for the frontend
- http://localhost:5000 for the backend

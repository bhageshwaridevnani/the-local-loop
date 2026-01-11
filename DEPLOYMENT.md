# Deployment Guide - The Local Loop

This guide explains how to deploy The Local Loop application to Render.com using the included `render.yaml` blueprint.

## 🚀 Quick Deploy to Render

### Prerequisites
- GitHub account with this repository
- Render.com account (free tier available)
- PostgreSQL database (automatically provisioned by Render)

### One-Click Deployment

1. **Fork/Push this repository to GitHub** (if not already done)

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Select this repository

3. **Render will automatically**:
   - Create 3 web services (Backend, Frontend, AI Agents)
   - Provision a PostgreSQL database
   - Set up environment variables
   - Deploy all services

## 📋 Manual Deployment Steps

If you prefer manual setup or need to customize:

### 1. Database Setup

Create a PostgreSQL database on Render:
- Go to Render Dashboard → "New" → "PostgreSQL"
- Name: `local-loop-db`
- Plan: Free
- Region: Oregon (or your preferred region)
- Copy the **Internal Database URL** for later

### 2. Backend API Deployment

Create a new Web Service:
- **Name**: `local-loop-backend`
- **Environment**: Node
- **Build Command**: `cd backend && npm install && npm run build`
- **Start Command**: `cd backend && npm start`
- **Plan**: Free

**Environment Variables**:
```
NODE_ENV=production
PORT=5000
DATABASE_URL=<your-postgres-internal-url>
JWT_SECRET=<generate-a-secure-random-string>
JWT_EXPIRES_IN=7d
FRONTEND_URL=<your-frontend-url-after-deployment>
```

### 3. Frontend Deployment

Create a new Static Site:
- **Name**: `local-loop-frontend`
- **Build Command**: `cd frontend && npm install && npm run build`
- **Publish Directory**: `frontend/dist`
- **Plan**: Free

**Environment Variables**:
```
VITE_API_URL=<your-backend-url>
```

### 4. AI Agents Service (Optional)

Create a new Web Service:
- **Name**: `local-loop-ai-agents`
- **Environment**: Python
- **Build Command**: `cd ai-agents && pip install -r requirements.txt`
- **Start Command**: `cd ai-agents && python main.py`
- **Plan**: Free

**Environment Variables**:
```
PORT=8000
GOOGLE_APPLICATION_CREDENTIALS=<path-to-gcp-credentials>
GCP_PROJECT_ID=<your-gcp-project-id>
```

## 🔐 Environment Variables Reference

### Backend Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | Secret for JWT tokens | `your-super-secret-key-min-32-chars` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-app.onrender.com` |

### Frontend Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-backend.onrender.com` |

### AI Agents Optional Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Service port | `8000` |
| `GOOGLE_APPLICATION_CREDENTIALS` | GCP credentials path | `/etc/secrets/gcp-key.json` |
| `GCP_PROJECT_ID` | Google Cloud Project ID | `your-project-id` |

## 🗄️ Database Migration

After deployment, run database migrations:

1. Go to your backend service on Render
2. Open the "Shell" tab
3. Run:
```bash
cd backend
npx prisma migrate deploy
```

## ✅ Post-Deployment Checklist

- [ ] All services are running (green status)
- [ ] Database is connected
- [ ] Backend health check passes: `https://your-backend.onrender.com/api/health`
- [ ] Frontend loads correctly
- [ ] API calls work from frontend to backend
- [ ] CORS is configured properly

## 🔧 Troubleshooting

### Backend Won't Start
- Check DATABASE_URL is correct
- Verify all environment variables are set
- Check build logs for errors
- Ensure Prisma migrations ran successfully

### Frontend Can't Connect to Backend
- Verify VITE_API_URL is correct
- Check CORS settings in backend
- Ensure backend is running

### Database Connection Issues
- Use **Internal Database URL** for backend connection
- Check database is in the same region as backend
- Verify PostgreSQL version compatibility

## 📊 Monitoring

Render provides:
- Real-time logs for each service
- Metrics dashboard
- Health check monitoring
- Automatic restarts on failure

Access logs:
1. Go to your service in Render Dashboard
2. Click "Logs" tab
3. View real-time application logs

## 🔄 Continuous Deployment

Render automatically deploys when you push to your main branch:
1. Push changes to GitHub
2. Render detects the push
3. Automatically rebuilds and deploys
4. Zero-downtime deployment

## 💰 Cost Optimization

**Free Tier Limits**:
- Web Services: Spin down after 15 minutes of inactivity
- Database: 90 days free, then $7/month
- Static Sites: Always free

**Tips**:
- Use free tier for development/testing
- Upgrade to paid plans for production
- Monitor usage in Render Dashboard

## 🆘 Support

- **Render Docs**: https://render.com/docs
- **Project Issues**: Create an issue in this repository
- **Render Community**: https://community.render.com

## 🔗 Useful Links

- [Render Dashboard](https://dashboard.render.com/)
- [Render Documentation](https://render.com/docs)
- [PostgreSQL on Render](https://render.com/docs/databases)
- [Environment Variables](https://render.com/docs/environment-variables)

---

**Note**: Free tier services spin down after 15 minutes of inactivity. First request after spin-down may take 30-60 seconds to respond.
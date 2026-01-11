# Deployment Guide for The Local Loop on Render

This guide will help you deploy The Local Loop application to Render.com.

## Prerequisites

- GitHub account with your repository
- Render.com account (free tier works)
- Google Cloud Platform account (for Vertex AI)

---

## Step 1: Prepare Your Repository

### 1.1 Update Database Configuration

The `prisma/schema.prisma` has been updated to use PostgreSQL instead of SQLite:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 1.2 Commit and Push Changes

```bash
cd /Users/bhageshwaridevnani/Documents/the-local-loop
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

---

## Step 2: Deploy to Render

### 2.1 Create New Blueprint

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository: `bhageshwaridevnani/the-local-loop`
4. Render will automatically detect the `render.yaml` file

### 2.2 Configure Environment Variables

Render will create 3 services and 1 database. You need to add these environment variables:

#### For AI Agents Service:
1. Go to the `local-loop-ai-agents` service
2. Add environment variables:
   - `GOOGLE_APPLICATION_CREDENTIALS`: Upload your `gcp-key.json` file content
   - `GCP_PROJECT_ID`: Your Google Cloud project ID

---

## Step 3: Database Migration

After the database is created, you need to run migrations:

### 3.1 Connect to Backend Service Shell

1. Go to `local-loop-backend` service in Render
2. Click **"Shell"** tab
3. Run migration commands:

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### 3.2 Seed Initial Data (Optional)

```bash
npm run seed
```

---

## Step 4: Update Frontend API URL

After backend is deployed, update the frontend environment variable:

1. Go to `local-loop-frontend` service
2. Update `VITE_API_URL` to your backend URL:
   - Example: `https://local-loop-backend.onrender.com`
3. Trigger a manual deploy

---

## Step 5: Configure CORS

Update backend CORS settings to allow your frontend domain:

1. Go to `local-loop-backend` service
2. Add environment variable:
   - `CORS_ORIGIN`: Your frontend URL (e.g., `https://local-loop-frontend.onrender.com`)
3. Redeploy the service

---

## Step 6: Verify Deployment

### 6.1 Check Health Endpoints

- Backend: `https://local-loop-backend.onrender.com/health`
- AI Agents: `https://local-loop-ai-agents.onrender.com/health`

### 6.2 Test the Application

1. Visit your frontend URL
2. Try registering a new user
3. Test the AI area validation
4. Create a vendor account and add products
5. Place a test order

---

## Troubleshooting

### Issue 1: Build Failed - "npm run build not found"

**Solution:** The render.yaml has been updated to use `npx prisma generate` instead of `npm run build` for the backend.

### Issue 2: Database Connection Error

**Solution:** 
1. Check if DATABASE_URL is properly set
2. Verify PostgreSQL database is running
3. Run migrations: `npx prisma migrate deploy`

### Issue 3: AI Agents Not Working

**Solution:**
1. Verify GCP credentials are uploaded
2. Check GCP_PROJECT_ID is correct
3. Ensure Vertex AI API is enabled in GCP

### Issue 4: CORS Errors

**Solution:**
1. Update CORS_ORIGIN environment variable
2. Add your frontend domain to allowed origins
3. Redeploy backend service

### Issue 5: Frontend Can't Connect to Backend

**Solution:**
1. Update VITE_API_URL in frontend service
2. Ensure backend URL is correct (with https://)
3. Redeploy frontend

---

## Important Notes

### Free Tier Limitations

- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- Database has 1GB storage limit
- 750 hours/month of runtime per service

### Database Backups

Render free tier doesn't include automatic backups. Consider:
1. Exporting data regularly
2. Using `pg_dump` for manual backups
3. Upgrading to paid tier for automatic backups

### Monitoring

1. Check service logs in Render dashboard
2. Monitor health endpoints
3. Set up alerts for service failures

---

## Production Checklist

Before going live:

- [ ] Update JWT_SECRET to a strong random value
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Test all user flows
- [ ] Verify AI area validation works
- [ ] Test order placement and delivery assignment
- [ ] Check mobile responsiveness
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Configure custom domain (optional)
- [ ] Add SSL certificate (Render provides free SSL)

---

## Useful Commands

### View Logs
```bash
# In Render dashboard, go to service → Logs tab
```

### Restart Service
```bash
# In Render dashboard, go to service → Manual Deploy → Deploy latest commit
```

### Database Shell
```bash
# In Render dashboard, go to database → Connect → External Connection
psql <connection_string>
```

### Run Migrations
```bash
# In backend service shell
cd backend
npx prisma migrate deploy
```

---

## Support

If you encounter issues:

1. Check Render documentation: https://render.com/docs
2. Review service logs in Render dashboard
3. Verify all environment variables are set correctly
4. Check GitHub repository for latest updates

---

## Service URLs (After Deployment)

- **Frontend**: `https://local-loop-frontend.onrender.com`
- **Backend API**: `https://local-loop-backend.onrender.com`
- **AI Agents**: `https://local-loop-ai-agents.onrender.com`
- **Database**: Internal connection (not publicly accessible)

---

## Next Steps After Deployment

1. **Test thoroughly** - Try all features
2. **Monitor performance** - Check response times
3. **Gather feedback** - Share with team members
4. **Iterate** - Fix bugs and add features
5. **Scale** - Upgrade to paid tier if needed

---

**Deployment prepared by Team NeoLogic** 🚀
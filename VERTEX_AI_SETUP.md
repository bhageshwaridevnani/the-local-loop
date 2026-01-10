# 🚀 Vertex AI Setup Guide (Using GCP Credits)

This guide will help you set up **Vertex AI** to use your **GCP credits** instead of the free tier Gemini API.

---

## ✅ Benefits of Vertex AI

- ✅ Uses your **GCP credits** (no free tier limits)
- ✅ **Higher quotas** (1500 requests/minute vs 15/minute)
- ✅ **Better for production**
- ✅ **More reliable**

---

## 📋 Prerequisites

1. **GCP Account** with credits
2. **GCP Project** created
3. **Billing enabled** on your project

---

## 🔧 Step-by-Step Setup

### Step 1: Enable Vertex AI API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Go to **APIs & Services** → **Enable APIs and Services**
4. Search for **"Vertex AI API"**
5. Click **Enable**

### Step 2: Set Up Authentication

#### Option A: Using Service Account (Recommended)

1. Go to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Name: `the-local-loop-ai`
4. Grant role: **Vertex AI User**
5. Click **Done**
6. Click on the service account
7. Go to **Keys** tab
8. Click **Add Key** → **Create New Key**
9. Choose **JSON**
10. Download the key file
11. Save it as `gcp-key.json` in the `ai-agents/` folder

#### Option B: Using Application Default Credentials

```bash
# Install gcloud CLI
# Then authenticate
gcloud auth application-default login
```

### Step 3: Install Required Packages

```bash
cd ai-agents
pip install google-cloud-aiplatform
```

### Step 4: Update Environment Variables

Edit `ai-agents/.env`:

```env
# GCP Vertex AI Configuration
GCP_PROJECT_ID=your-project-id
GCP_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./gcp-key.json

# Remove or comment out GEMINI_API_KEY
# GEMINI_API_KEY=...
```

### Step 5: Update main.py

The system will automatically detect Vertex AI configuration and use it instead of Gemini API.

---

## 🧪 Testing

```bash
# Start the AI service
cd ai-agents
python main.py
```

You should see:
```
🤖 Using Google Vertex AI (GCP)
✅ GCP Project: your-project-id
✅ Location: us-central1
```

---

## 💰 Cost Estimation

**Vertex AI Pricing (as of 2024):**
- Gemini 2.0 Flash: **$0.075 per 1M input tokens**
- Gemini 2.0 Flash: **$0.30 per 1M output tokens**

**For your hackathon:**
- ~100 registrations = ~$0.01
- ~1000 registrations = ~$0.10

**Your GCP credits will easily cover this!** 🎉

---

## 🔍 Monitoring Usage

1. Go to [GCP Console](https://console.cloud.google.com/)
2. Navigate to **Billing** → **Reports**
3. Filter by **Vertex AI**
4. Monitor your credit usage

---

## 🆚 Comparison: Free Tier vs Vertex AI

| Feature | Free Tier (AI Studio) | Vertex AI (GCP) |
|---------|----------------------|-----------------|
| Requests/min | 15 | 1500 |
| Requests/day | 1500 | Unlimited |
| Cost | Free (limited) | Uses GCP credits |
| Reliability | Rate limited | Production-ready |
| Best for | Testing | Hackathon/Production |

---

## 🚨 Troubleshooting

### Error: "Permission denied"
**Solution:** Make sure your service account has **Vertex AI User** role

### Error: "API not enabled"
**Solution:** Enable Vertex AI API in GCP Console

### Error: "Project not found"
**Solution:** Check `GCP_PROJECT_ID` in `.env` file

### Error: "Quota exceeded"
**Solution:** Request quota increase in GCP Console (usually approved instantly for new projects)

---

## 📚 Next Steps

1. ✅ Complete setup above
2. ✅ Test with your address
3. ✅ Push to GitHub
4. ✅ Share with your team

---

## 🎯 For Your Team

Each team member can either:
1. **Use the same GCP project** (share the service account key)
2. **Create their own GCP project** (each gets $300 free credits)

**Recommendation:** Use one shared project for the hackathon to simplify collaboration.

---

## 📞 Need Help?

- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Gemini API Pricing](https://ai.google.dev/pricing)
- [GCP Free Tier](https://cloud.google.com/free)

---

**Ready to use your GCP credits! 🚀**
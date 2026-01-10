# 🚀 Vertex AI Integration Steps (You Have GCP Project)

Since you already have a GCP project, follow these exact steps:

---

## Step 1: Enable Vertex AI API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project from the dropdown at the top
3. In the search bar, type **"Vertex AI API"**
4. Click on **"Vertex AI API"**
5. Click the **"ENABLE"** button
6. Wait 1-2 minutes for it to enable

---

## Step 2: Create Service Account

1. In GCP Console, go to **"IAM & Admin"** → **"Service Accounts"**
2. Click **"+ CREATE SERVICE ACCOUNT"**
3. Fill in:
   - **Service account name**: `the-local-loop-ai`
   - **Service account ID**: (auto-filled)
   - **Description**: `AI service for The Local Loop`
4. Click **"CREATE AND CONTINUE"**
5. In **"Grant this service account access to project"**:
   - Click **"Select a role"**
   - Search for **"Vertex AI User"**
   - Select it
   - Click **"CONTINUE"**
6. Click **"DONE"**

---

## Step 3: Create and Download Service Account Key

1. In the Service Accounts list, find **"the-local-loop-ai"**
2. Click on it
3. Go to the **"KEYS"** tab
4. Click **"ADD KEY"** → **"Create new key"**
5. Select **"JSON"**
6. Click **"CREATE"**
7. A JSON file will download automatically
8. **IMPORTANT**: Rename it to `gcp-key.json`
9. Move it to: `/Users/bhageshwaridevnani/Documents/the-local-loop/ai-agents/`

---

## Step 4: Get Your Project ID

1. In GCP Console, look at the top bar
2. You'll see your project name with a dropdown
3. Click the dropdown
4. You'll see **"Project ID"** - copy this (e.g., `my-project-12345`)

---

## Step 5: Install Vertex AI Package

Open terminal and run:

```bash
cd /Users/bhageshwaridevnani/Documents/the-local-loop/ai-agents
pip install google-cloud-aiplatform
```

---

## Step 6: Update .env File

Edit `/Users/bhageshwaridevnani/Documents/the-local-loop/ai-agents/.env`:

```env
# Remove or comment out GEMINI_API_KEY
# GEMINI_API_KEY=...

# Add Vertex AI Configuration
GCP_PROJECT_ID=your-project-id-here
GCP_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./gcp-key.json
```

**Replace `your-project-id-here` with your actual project ID from Step 4**

---

## Step 7: Restart AI Service

```bash
cd /Users/bhageshwaridevnani/Documents/the-local-loop/ai-agents
lsof -ti:8000 | xargs kill -9
python main.py
```

You should see:
```
🤖 Using Google Vertex AI (GCP)
✅ GCP Project: your-project-id
✅ Location: us-central1
```

---

## Step 8: Test It

```bash
curl -X POST http://localhost:8000/agents/area-validation \
  -H "Content-Type: application/json" \
  -d '{
    "address": "352/353, Silver Oak University, Gota Gam",
    "pincode": "382481",
    "city": "Ahmedabad"
  }'
```

Should return: `"status":"approved"` ✅

---

## 🎯 Quick Checklist

- [ ] Vertex AI API enabled in GCP
- [ ] Service account created with "Vertex AI User" role
- [ ] JSON key downloaded and renamed to `gcp-key.json`
- [ ] `gcp-key.json` moved to `ai-agents/` folder
- [ ] Project ID copied
- [ ] `.env` file updated with GCP_PROJECT_ID
- [ ] `google-cloud-aiplatform` package installed
- [ ] AI service restarted
- [ ] Test successful

---

## 💰 Cost with GCP Credits

- **Gemini 2.0 Flash**: $0.075 per 1M input tokens
- **Your hackathon usage**: ~$0.10 for 1000 registrations
- **Your GCP credits**: Easily covers this! 🎉

---

## 🚨 Troubleshooting

### Error: "Permission denied"
**Fix**: Make sure service account has "Vertex AI User" role

### Error: "API not enabled"
**Fix**: Go back to Step 1 and enable Vertex AI API

### Error: "Project not found"
**Fix**: Double-check GCP_PROJECT_ID in .env matches your actual project ID

### Error: "Credentials not found"
**Fix**: Make sure `gcp-key.json` is in the `ai-agents/` folder

---

## 📞 Need Help?

If you get stuck on any step, let me know which step number and I'll help you!

---

**Ready to use unlimited AI with your GCP credits! 🚀**
# 🚀 Deploying Flash UI to Vercel

Flash UI is a high-performance React application powered by Vite and Tailwind CSS. Since it compiles to a static single-page application (SPA), it is incredibly fast and cheap to host on Vercel!

Follow this step-by-step guide to launch your own production deployment of Flash UI in under 2 minutes:

---

## Step 1: Push or Export your Code
You can export this codebase as a **ZIP file** or push it directly to **GitHub** using the settings menu in the top-right corner of Google AI Studio.

## Step 2: Import into Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and log in.
2. Click **Add New...** and select **Project**.
3. Choose the GitHub repository you just pushed, or click **Upload ZIP** to upload the codebase directly.

## Step 3: Configure Project Settings
Vercel will automatically detect that this is a **Vite** project. Ensure the following preset settings are kept:
- **Framework Preset:** `Vite`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

## Step 4: Add Your Gemini API Key 🔑
To allow Flash UI to call the Gemini API in production, you must set up your environment variable:
1. Scroll down to the **Environment Variables** section in the Vercel deployment form.
2. Add a new variable:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** *[Paste your Google Gemini API Key]*
3. Click **Add**.

## Step 5: Deploy! 🎉
Click **Deploy**. Vercel will compile the app and provide you with a fast, secure, live URL for your production Flash UI platform!

---

### Why does this configuration work out-of-the-box?
- **Client-Side SPA Architecture:** The build output is compile-time substituted with your API Key using Vite's configuration.
- **`vercel.json` SPA routing:** We have already included a `vercel.json` configuration in the root directory that routes all paths to `/index.html`. This ensures that refresh or navigation actions will not trigger 404 errors.

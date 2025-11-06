# Netlify Deployment Guide - TaskFlow Todo App

## Overview
Netlify can only host the **frontend** (static files). Backend ko separately deploy karna hoga (Render, Railway, etc.)

## Step-by-Step Deployment

### Part 1: Backend Deploy (Render.com - Recommended)

1. **GitHub pe code push karo:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/ToDo_AR.git
   git push -u origin main
   ```

2. **Render.com pe account banao:**
   - https://render.com pe sign up karo
   - "New +" → "Web Service" select karo
   - GitHub repo connect karo

3. **Backend Settings:**
   - **Name:** `todo-backend` (kuch bhi)
   - **Environment:** `Node`
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`
   - **Root Directory:** `server` (important!)
   - **Environment Variables:** 
     - `NODE_ENV=production`
     - `PORT=10000` (Render automatically set karta hai, but explicitly set karo)

4. **Deploy karo** - Render automatically deploy kar dega

5. **Backend URL copy karo** - Jaise: `https://todo-backend.onrender.com`

---

### Part 2: Frontend Deploy (Netlify)

#### Method 1: Netlify Dashboard (Easy)

1. **Netlify account banao:**
   - https://netlify.com pe sign up karo

2. **New Site from Git:**
   - "Add new site" → "Import an existing project"
   - GitHub repo select karo

3. **Build Settings:**
   - **Base directory:** `client`
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `client/dist`

4. **Environment Variables:**
   - "Site settings" → "Environment variables"
   - Add: `VITE_API_URL` = `https://todo-backend.onrender.com` (apna backend URL)

5. **Netlify Configuration:**
   - `netlify.toml` file already hai `client/` folder mein
   - Backend URL update karo `netlify.toml` mein:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://todo-backend.onrender.com/api/:splat"
   ```

6. **Deploy karo** - Netlify automatically deploy kar dega

#### Method 2: Netlify CLI (Advanced)

```bash
# Netlify CLI install karo
npm install -g netlify-cli

# Login karo
netlify login

# Client folder mein jao
cd client

# Deploy karo
netlify deploy --prod
```

---

## Important Configuration

### 1. Backend CORS Update

Backend (`server/src/index.js`) mein CORS allow karo:

```javascript
app.use(cors({
  origin: ['https://your-netlify-app.netlify.app', 'http://localhost:5173'],
  credentials: true
}));
```

### 2. Frontend API URL

Production mein API calls automatically backend URL use karengi (VITE_API_URL se).

---

## Post-Deployment Checklist

- [ ] Backend deployed on Render/Railway
- [ ] Backend URL copied
- [ ] Frontend deployed on Netlify
- [ ] Environment variable `VITE_API_URL` set kiya
- [ ] `netlify.toml` mein backend URL update kiya
- [ ] CORS backend mein configured
- [ ] Test kiya - frontend se backend API calls kaam kar rahe hain

---

## Troubleshooting

### API calls fail ho rahe hain?
- Check karo backend URL correct hai
- CORS properly configured hai
- Environment variables set kiye hain

### Build fail ho raha hai?
- Check karo `package.json` scripts correct hain
- Dependencies install ho rahi hain
- Build directory correct hai (`client/dist`)

---

## Alternative: Full Stack on Netlify Functions

Agar sirf Netlify use karna hai, to backend ko Netlify Functions mein convert karna padega (complex hai).

**Recommended:** Frontend Netlify, Backend Render/Railway (easiest!)


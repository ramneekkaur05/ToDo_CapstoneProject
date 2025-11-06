Deployment instructions — Netlify (frontend) + Render (single server) or single-service Render

This file explains two simple ways to deploy this ToDo project.

Quick summary
- Easiest (zero-code change): deploy the frontend (`client`) to Netlify and the backend (`server`) to Render. Two services, reliable.
- Single service (one URL): deploy only the `server` to Render and let Express serve the built client. The repository already contains a small change to support this: Express will serve `client/dist` when present, and `server/package.json` has a `postinstall` script that will build the client during deploy.

IMPORTANT: commit and push your code before creating services on Netlify/Render.

Commands to commit & push (PowerShell):

```powershell
cd C:\Users\anura\OneDrive\Documents\GitHub\ToDo_CapstoneProject
git add .
git commit -m "prepare deployment: serve client from server + postinstall build"
git push origin main
```

Option A — Netlify (frontend) + Render (backend) — recommended for beginners

1. Push your repo (see commands above).

Frontend (Netlify)
- Go to https://app.netlify.com and sign in.
- Choose "Add new site" → "Import from Git" → connect GitHub and pick the `ToDo_CapstoneProject` repo.
- On the build settings page set:
  - Base directory: client
  - Build command: npm install && npm run build
  - Publish directory: dist
- Deploy site. After deploy, copy the site URL (ex: https://my-todo.netlify.app).

Backend (Render)
- Go to https://render.com and sign in.
- Create a new Web Service.
  - Connect your GitHub repo, and pick the `server` folder as the root/working directory.
  - Branch: main
  - Build command: npm install
  - Start command: npm start
- After create, in the Render service settings add an environment variable named `FRONTEND_URL` with the Netlify URL (so CORS in `server` matches).
- Deploy the service. Copy its URL (ex: https://todo-backend.onrender.com).

Wire frontend → backend
- Edit `client/netlify.toml` and replace the placeholder backend URL with the Render backend URL (the `[[redirects]]` rule) OR set a frontend environment variable used by your client.
- Commit & push the change. Netlify will redeploy automatically.

Option B — Single Render service (serve frontend from Express)

This uses the changes already added to `server` so Express serves `client/dist`. Render will run the `postinstall` script to build the client during deploy.

1. Push your repo (see commands above).
2. On Render create a Web Service and set:
   - Root: `server`
   - Branch: main
   - Build command: npm install
   - Start command: npm start
3. Render will run `npm install` in `server`, which runs `postinstall` and will build the client (`client/dist`). When the server starts it will serve static files from `client/dist` and your API endpoints at `/api/*`.
4. Optionally set `NODE_ENV=production` in Render and any other env vars.

Notes & troubleshooting
- If you see CORS errors: set `FRONTEND_URL` on the server to the actual frontend origin. Alternatively allow broader CORS temporarily for debugging.
- If Render fails to create the SQLite DB: make sure the service has write permissions to `server/data` (default should work). Check service logs on Render.
- If the frontend shows but API returns 404: ensure the server URL is correct and API calls point to `/api/...` on that host.
- To debug builds: check Netlify/Render build logs in their dashboards — they show `npm` output and errors.

If you want, after you push I can:
- Walk you through exact clicks in Netlify/Render dashboard.
- Prepare and push tiny fixes if any build errors happen and show how to read the logs.

Good luck — pick Option A (fast) or Option B (single service) and tell me when you've pushed or if you'd like me to continue with further edits or guidance.

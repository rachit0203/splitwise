# Friend Payment Management App (Splitwise Clone)

Production-ready monorepo with:

- `backend` Node.js + Express + MongoDB API (Render deployable)
- `mobile` React Native Expo app (EAS APK build ready)

## Project Structure

```text
project-root
├── backend
│   ├── src
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   └── app.js
│   ├── config
│   ├── .env.example
│   ├── package.json
│   ├── render.yaml
│   └── server.js
└── mobile
    ├── app
    ├── components
    ├── context
    ├── navigation
    ├── screens
    ├── services
    ├── utils
    ├── .env.example
    ├── App.js
    ├── app.json
    ├── eas.json
    └── package.json
```

## Backend Setup

1. Go to backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` from `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/splitwise
JWT_SECRET=replace-with-strong-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=*
```

4. Run locally:

```bash
npm run dev
```

The health endpoint is `GET /api/health`.

## Mobile Setup

1. Go to mobile folder:

```bash
cd mobile
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` from `.env.example`:

```env
EXPO_PUBLIC_API_URL=https://your-render-backend.onrender.com
```

4. Start Expo:

```bash
npm run start
```

## Render Deployment (Backend)

1. Push the repository to GitHub.
2. In Render, create a new **Web Service** from your repo.
3. Set Root Directory to `backend`.
4. Build Command:

```bash
npm install
```

5. Start Command:

```bash
npm start
```

6. Add environment variables in Render dashboard:

- `PORT` (Render provides this automatically, but keep code using `process.env.PORT`)
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

7. Deploy and copy your backend URL, for example:

```text
https://split-expenses-api.onrender.com
```

8. Update `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=https://split-expenses-api.onrender.com
```

## EAS APK Build (Expo)

1. Install EAS CLI globally:

```bash
npm install -g eas-cli
```

2. Login to Expo:

```bash
eas login
```

3. Go to mobile folder:

```bash
cd mobile
```

4. Configure EAS project (first time):

```bash
eas build:configure
```

5. Build preview APK:

```bash
eas build --platform android --profile preview
```

The profile uses `apk` from `mobile/eas.json`.

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Users

- `GET /api/users/search?q=<query>`
- `GET /api/users/:id`

### Friends

- `POST /api/friends/request`
- `POST /api/friends/accept`
- `GET /api/friends/list`

### Groups

- `POST /api/groups/create`
- `GET /api/groups/:id`
- `POST /api/groups/add-member`
- `GET /api/groups/my` (mobile helper endpoint)

### Expenses

- `POST /api/expenses/create`
- `GET /api/expenses/group/:groupId`
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`

### Balances

- `GET /api/balances/user/:id`

### Settlement

- `POST /api/settlement`
- `GET /api/settlement/history/me` (mobile helper endpoint)

## Production Notes

- JWT token is stored in `Expo Secure Store` on mobile.
- API base URL is environment-driven (`EXPO_PUBLIC_API_URL`).
- Backend uses `process.env.PORT`, `process.env.MONGO_URI`, and `process.env.JWT_SECRET`.
- CORS is enabled with `app.use(cors())`.
- App does not depend on local server if backend is deployed and mobile env points to Render URL.

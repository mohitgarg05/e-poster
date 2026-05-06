# Poster Management Platform

Single Next.js app with:
- Employee portal (`/employee/login`, `/employee`) to generate downloadable posters
- Admin panel (`/admin`) with 3 resources:
  - Poster
  - User
  - Poster Created (audit)
- Backend APIs via Next.js route handlers

## Features Implemented

- Admin login with JWT token
- CSV employee import (`employeeEmail`, `employeeCode`) with bcrypt hashing
- Poster template creation with color picker and layout metadata
- Employee login restricted to imported users
- Poster generator form fields:
  - Doctor image
  - Doctor Name
  - Doctor Credentials
  - Hospital
  - City
- Downloadable generated poster with doctor name rendered in template color
- Audit log storing who created which poster and when
- Image storage through Cloudinary
- Data storage through MongoDB Atlas

## Tech Stack

- Next.js (App Router) + React + TypeScript
- MongoDB Atlas + Mongoose
- Cloudinary
- JWT auth (`jose`)
- CSV parsing (`csv-parse`)

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill all values.
3. Generate admin password hash:
   ```bash
   node -e "const bcrypt=require('bcryptjs');bcrypt.hash('your-admin-password',10).then(h=>console.log(h))"
   ```
4. Put the printed hash in `ADMIN_PASSWORD_HASH`.
5. Start:
   ```bash
   npm run dev
   ```

## CSV Format

Header must be:
```csv
employeeEmail,employeeCode
```

Example:
```csv
employee1@example.com,1234
employee2@example.com,pass-001
```

## API Endpoints

- `POST /api/admin/login`
- `POST /api/admin/users/import`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id`
- `POST /api/admin/posters`
- `GET /api/admin/posters`
- `PATCH /api/admin/posters/:id`
- `DELETE /api/admin/posters/:id`
- `GET /api/admin/poster-created`
- `POST /api/employee/login`
- `GET /api/posters`
- `POST /api/generate`

## Free Deployment on Render

1. Push this repo to GitHub.
2. Create a Render web service and connect the repo.
3. Use:
   - Build command: `npm install && npm run build`
   - Start command: `npm run start`
4. Add env vars from `.env.example`.
5. Deploy.

A `render.yaml` blueprint is included for quick setup.

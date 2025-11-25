# BiteCheck Admin Dashboard

Web-based admin dashboard for managing product corrections submitted by users.

## Features

- 🔐 **Secure Authentication** - Supabase Auth integration
- 📊 **Dashboard Overview** - Stats and recent activity
- ✏️ **Corrections Management** - Review, approve, or reject user submissions
- 🔍 **Filtering & Search** - Filter by status (pending/approved/rejected)
- 📄 **Pagination** - Handle large volumes of corrections
- 🖼️ **Photo Evidence** - View user-submitted photos
- 📝 **Audit Logging** - Track all admin actions

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Backend**: FastAPI (BiteCheck API)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file (copy from `env.example`):

```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. Configure Admin Users

In the backend `.env` file, add your admin user IDs:

```env
ADMIN_USER_IDS=user-id-1,user-id-2
```

To get your user ID:

1. Sign up/login to your Supabase project
2. Go to Authentication > Users in Supabase Dashboard
3. Copy your user UUID

### 4. Start Development Server

```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

## Usage

### Login

1. Navigate to `http://localhost:3000`
2. You'll be redirected to the login page
3. Sign in with your Supabase credentials
4. If your user ID is in the admin allowlist, you'll access the dashboard

### Dashboard

The main dashboard shows:

- Total corrections count
- Pending corrections (need review)
- Approved corrections count
- Approval rate percentage
- Recent corrections list

### Managing Corrections

1. Click "Corrections" in the sidebar
2. Filter by status: All, Pending, Approved, Rejected
3. Click on any correction to view details
4. For pending corrections:
   - Click "Approve" to accept and apply changes
   - Click "Reject" to decline with a reason

### Approval Process

When you approve a correction:

1. The correction status changes to "approved"
2. The product data is automatically updated
3. An audit log entry is created
4. You can add optional notes

### Rejection Process

When you reject a correction:

1. The correction status changes to "rejected"
2. The product data remains unchanged
3. An audit log entry is created
4. You must provide a reason

## Project Structure

```
admin-dashboard/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home (redirects)
│   ├── login/
│   │   └── page.tsx            # Login page
│   └── dashboard/
│       ├── layout.tsx          # Dashboard layout with sidebar
│       ├── page.tsx            # Dashboard home (stats)
│       └── corrections/
│           ├── page.tsx        # Corrections list
│           └── [id]/
│               └── page.tsx    # Correction detail/review
├── lib/
│   ├── api-client.ts           # Backend API client
│   ├── supabase.ts             # Supabase client
│   └── types.ts                # TypeScript types
└── env.example                 # Environment variables template
```

## API Endpoints Used

- `GET /admin/stats` - Dashboard statistics
- `GET /admin/corrections` - List corrections (with filters)
- `GET /admin/corrections/{id}` - Get correction details
- `PATCH /admin/corrections/{id}/approve` - Approve correction
- `PATCH /admin/corrections/{id}/reject` - Reject correction

## Development

### Build for Production

```bash
npm run build
```

### Run Production Build

```bash
npm start
```

### Linting

```bash
npm run lint
```

## Deployment

This is a standard Next.js application and can be deployed to:

- Vercel (recommended)
- Netlify
- Any Node.js hosting platform

Make sure to set environment variables in your deployment platform.

## Security Notes

- Admin access is controlled via the `ADMIN_USER_IDS` environment variable
- All API requests require valid Supabase authentication
- Backend validates admin permissions before processing requests
- All admin actions are logged in the `admin_audit` table

## Troubleshooting

### "User does not have admin privileges"

Make sure your user ID is added to the `ADMIN_USER_IDS` environment variable in the backend.

### "Failed to load corrections"

1. Check that the backend is running (`http://localhost:8000`)
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check browser console for detailed error messages

### Authentication Issues

1. Verify Supabase credentials in `.env.local`
2. Check that your Supabase project is active
3. Ensure you're using the correct Supabase URL and anon key

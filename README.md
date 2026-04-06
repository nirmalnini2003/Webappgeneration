# 🏢 BNRI Infrastructure Request & Approval System

A comprehensive multi-level approval workflow system for infrastructure requests with real-time updates, Supabase backend, WhatsApp integration, and Excel export capabilities.

## ✨ Features

### Core Functionality
- **Multi-Level Approval Workflow** - Requester → L1 Approver → Final Approver
- **Role-Based Access Control** - 7 user types (Requester, Finance/IT/Legal/HR Approvers, Final Approver, Admin)
- **Real-Time Updates** - Supabase subscriptions for live data synchronization
- **Smart Routing** - Automatic assignment to appropriate approvers based on request type
- **WhatsApp Integration** - Direct notifications and communication (9150459992)
- **Excel Export** - Download requests and detailed reports
- **Admin Dashboard** - Complete system overview and user management
- **Secure Authentication** - Supabase Auth with session management
- **Modern UI** - Built with React 18 + Tailwind CSS v4
- **Comment System** - Full discussion threads on each request
- **Activity History** - Complete audit trail with timestamps

### User Roles
1. **Requester**: Submit and track requests
2. **L1 Approvers**:
   - Finance Approver (handles Finance requests)
   - IT Approver (handles IT requests)
   - Legal Approver (handles Legal requests)
   - HR Approver (handles HR requests)
3. **Final Approver**: Final sign-off on L1-approved requests
4. **Admin**: Full system access, user management, analytics

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account ([sign up here](https://supabase.com))

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/bnri-infrastructure-system.git
cd bnri-infrastructure-system
pnpm install
```

### Step 2: Set Up Supabase

1. **Create a Supabase Project**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Click "New Project" and fill in the details

2. **Run the Database Schema**
   - In your Supabase project, navigate to SQL Editor
   - Copy the contents of `supabase-schema.sql`
   - Paste and run the SQL script

3. **Get Your API Credentials**
   - Go to Project Settings → API
   - Copy your Project URL and anon/public key

### Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_WHATSAPP_OWNER_NUMBER=9150459992
   VITE_WHATSAPP_OWNER_LINK=https://wa.me/message/KDRAPEQYUHEBB1
   ```

### Step 4: Create Demo Users

The database schema includes seed data, but you need to create auth users in Supabase:

1. Go to Authentication → Users in your Supabase dashboard
2. Create users with these credentials:

   | Email | Password | Role |
   |-------|----------|------|
   | admin@bnriinfra.com | demo123 | Admin |
   | bob.finance@bnriinfra.com | demo123 | Finance Approver |
   | carol.it@bnriinfra.com | demo123 | IT Approver |
   | alice.requester@bnriinfra.com | demo123 | Requester |

3. For each user, you need to link them to the database:
   - Get the auth user ID from Supabase Auth dashboard
   - Run SQL to update the corresponding user record:
   ```sql
   UPDATE users
   SET auth_user_id = 'auth-user-id-from-supabase'
   WHERE email = 'user@example.com';
   ```

For complete user setup instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

### Step 5: Run the Development Server

```bash
pnpm dev
```

The app will open at `http://localhost:5173`

## 📖 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Comprehensive deployment guide for GitHub Pages
- **[supabase-schema.sql](./supabase-schema.sql)** - Complete database schema with RLS policies

## 📋 Workflow

1. **Submit Request**: User fills form with title, description, type, priority
2. **L1 Review**: Routed to appropriate approver based on request type
   - Approver can: Approve ✅ | Reject ❌ | Request Clarification ❓
3. **Final Review**: If L1 approved, goes to final approver
4. **Completion**: Request marked as Approved or Rejected

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Build Tool**: Vite
- **Package Manager**: pnpm
- **Deployment**: GitHub Pages

### Database Schema

- `users` - User profiles and roles
- `requests` - Infrastructure requests with auto-generated ref numbers
- `approval_history` - Approval/rejection records
- `request_comments` - Comments on requests
- `request_attachments` - File attachments (planned)
- `audit_logs` - System audit trail
- `notification_logs` - Notification history

### Key Files

```
├── src/
│   ├── app/
│   │   ├── App.tsx                      # Main application component
│   │   └── components/
│   │       ├── SetupRequired.tsx        # Setup instructions screen
│   │       ├── LoginSupabase.tsx        # Authentication
│   │       ├── DashboardSupabase.tsx    # Dashboard with stats
│   │       ├── SidebarSupabase.tsx      # Navigation sidebar
│   │       ├── RequestsListSupabase.tsx # Request list with filters
│   │       ├── RequestDetailSupabase.tsx# Request details & actions
│   │       ├── NewRequestSupabase.tsx   # Create new request
│   │       └── AdminShellSupabase.tsx   # Admin panel
│   ├── contexts/
│   │   └── AuthContext.tsx              # Authentication context
│   ├── hooks/
│   │   ├── useRequests.ts               # Requests data hook with real-time
│   │   └── useUsers.ts                  # Users data hook
│   ├── lib/
│   │   ├── supabase.ts                  # Supabase client config
│   │   ├── database.types.ts            # TypeScript types
│   │   └── api/
│   │       ├── requests.ts              # Request CRUD + subscriptions
│   │       └── users.ts                 # User management functions
│   └── styles/                          # Tailwind CSS
├── supabase-schema.sql                  # Database schema with RLS
└── .github/workflows/deploy.yml         # GitHub Actions deployment
```

## 💬 WhatsApp Integration

**Owner Contact**: 9150459992
**Direct Link**: https://wa.me/message/KDRAPEQYUHEBB1

WhatsApp notifications are sent for:
- New request submissions
- Approval actions
- Status changes
- Clarification requests

Click any WhatsApp button in the app to send instant notifications.

## 📊 Dashboard & Reports

### Dashboard Features
- Total, Pending, Approved, Rejected counts
- Request breakdown by type (Finance, IT, Legal, HR, Procurement)
- Status distribution visualization
- Priority tracking
- Role-based filtering

### Export Options
- **Excel Export**: Full request data with comments and approvals
- **Detail Export**: Individual request details with complete history

## 🔒 Security

- **Row Level Security (RLS)** - Database-level access control
- **Supabase Auth** - Secure authentication with session management
- **Environment Variables** - Sensitive data protected
- **Audit Logging** - All critical operations tracked
- **Role-Based Access** - Users only see authorized data

## 📊 Default Test Credentials

After completing setup:

- **Admin**: admin@bnriinfra.com / demo123
- **Finance Approver**: bob.finance@bnriinfra.com / demo123
- **IT Approver**: carol.it@bnriinfra.com / demo123
- **Requester**: alice.requester@bnriinfra.com / demo123

## 🚀 Deployment to GitHub Pages

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

Quick steps:
1. Push code to GitHub
2. Add Supabase secrets to GitHub repository settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Enable GitHub Pages with GitHub Actions source
4. Automatic deployment on every push to main branch

## 🎨 UI/UX Features

- Clean, modern design with blue color scheme
- Fully responsive layout (desktop and mobile)
- Smooth animations and transitions
- Real-time data updates
- Loading states and error handling
- Modal dialogs for actions
- Comprehensive help guide

## 🛠️ Development

Built with modern web technologies:
- React hooks for state management
- TypeScript for type safety
- Tailwind CSS v4 for styling
- Modular component architecture
- Real-time Supabase subscriptions
- Custom hooks for data fetching

## 📞 Support

For issues or questions:
- WhatsApp: 9150459992
- Click "Help & Guide" in the app sidebar
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for setup help

## 🤝 Contributing

This is a production system for BNRI. For issues or feature requests, please contact the development team.

## 📝 License

Proprietary - BNRI Infrastructure © 2026

---

**Built with ❤️ using Supabase, React, and Tailwind CSS**

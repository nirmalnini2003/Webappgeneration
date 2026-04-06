Build a production-ready full-stack web application for BNRI Infrastructure Request & Approval Management System.

GOAL
Create a clean, modern, responsive business web app that lets users submit requests, route them through a multi-level approval workflow, track status, comment, attach files, receive notifications, and manage everything through an admin panel. The app must be fully functional, not a static mockup.

IMPORTANT
- Do not use localStorage or mock data as the final source of truth.
- Use Supabase for authentication, database, file storage, and real-time updates.
- Make the app production-ready with real CRUD operations.
- Keep the UI visually close to a corporate approval dashboard.
- Support desktop and mobile layouts.
- Use React + TypeScript + Tailwind-style design.
- Use clean cards, tables, filters, status badges, dialogs, and side navigation.

APP NAME
BNRI Infrastructure Request & Approval System

USER ROLES
1. Requester
2. Finance Approver
3. IT Approver
4. Legal Approver
5. HR Approver
6. Final Approver
7. Admin

CORE FEATURES

AUTHENTICATION
- Login page with username/email and password
- Supabase Auth integration
- Role-based access after login
- Session persistence
- Forgot password / reset password flow
- Force password change on first login if user.must_change_pwd = true

DASHBOARD
- Dashboard cards:
  - Total Requests
  - Pending Review
  - Under Review
  - Needs Clarification
  - Approved
  - Rejected
- Charts for request type distribution and status distribution
- “My Tasks” and “All Requests” views
- Recent activity feed
- Quick action buttons: New Request, Export, Admin, Help

REQUEST MANAGEMENT
- Create new request form with:
  - Title
  - Description
  - Request Type: Finance, IT, Procurement, Legal, HR
  - Priority: Low, Medium, High, Critical
  - Attachments
- Auto-generate reference number like BNRI-REQ-0001
- Auto-route request to correct L1 approver based on type
- Request detail page with:
  - Full request info
  - Approval history timeline
  - Comments thread
  - Attachments list
  - Audit trail
  - Status badge
  - Action buttons based on role and status
- Approver actions:
  - Approve
  - Reject
  - Request Clarification
- Final approver can approve after L1 approval
- Requester can see live status only

WORKFLOW LOGIC
- When requester submits request, status = Pending Review
- Route to correct approver based on request type
- L1 approver actions update status:
  - Approve -> Approved L1
  - Reject -> Rejected
  - Clarification -> Needs Clarification
- After L1 approval, route to final approver
- Final approver actions:
  - Approve -> Approved
  - Reject -> Rejected
- Store every action in approval_history table
- Store all comments in request_comments table
- Store every status change in audit_logs table

ADMIN PANEL
- User management:
  - Add user
  - Edit user
  - Disable user
  - Reset password
  - Assign role and department
- Request management:
  - View all requests
  - Delete request if necessary
  - Reassign approver
- Analytics section:
  - Requests by type
  - Requests by status
  - Pending by approver
  - Monthly count
- Export CSV/Excel

WHATSAPP INTEGRATION
- Add a WhatsApp notification action for:
  - New request submitted
  - Request approved/rejected/clarification
  - Final approval completed
- Use a reusable WhatsApp utility function
- Prepare message templates for requester and approver
- Show WhatsApp contact buttons in UI
- Do not hardcode private credentials in frontend

FILTERING AND SEARCH
- Search by reference number, title, description
- Filter by status
- Filter by request type
- Filter by priority
- Filter by assigned approver
- Toggle between “All” and “Mine”

DATABASE DESIGN IN SUPABASE
Create these tables:

users
- id (uuid, primary key)
- name
- username
- email
- phone
- password_hash or auth user mapping
- role
- dept
- active
- must_change_pwd
- created_at
- updated_at

requests
- id (uuid, primary key)
- ref_no
- title
- description
- type
- priority
- status
- submitter_id
- submitter_name
- dept
- assigned_approver_id
- final_approver_id
- created_at
- updated_at

approval_history
- id
- request_id
- stage
- action
- action_by
- comment
- created_at

request_comments
- id
- request_id
- user_id
- user_name
- comment
- created_at

request_attachments
- id
- request_id
- file_name
- file_type
- file_url
- uploaded_by
- created_at

audit_logs
- id
- request_id
- action
- old_value
- new_value
- performed_by
- created_at

NOTIFICATIONS
- notification_logs table
- store recipient, channel, message, status, sent_at

SECURITY
- Use Row Level Security
- Users can only see permitted requests based on role
- Requesters can only see their own requests
- Approvers can see assigned requests only
- Admin can see all data
- Keep Supabase service role keys out of frontend
- Use env variables for all secrets

UI PAGES
1. Login
2. Dashboard
3. Requests List
4. Request Detail
5. New Request
6. Admin Panel
7. Help / FAQ
8. Profile / Change Password

DESIGN STYLE
- Corporate blue / white theme
- Clean dashboard layout
- Rounded cards
- Soft shadows
- Status badges with color coding
- Compact tables
- Responsive sidebar
- Modern approval workflow UI
- Professional enterprise look

COMPONENT BEHAVIOR
- Sidebar navigation should adapt by role
- Buttons should show only when user has permission
- Table rows should open detail page
- Modal dialogs for approve/reject/clarify
- Toast notifications on every action
- Loading skeletons during fetch
- Empty states for no data

INTEGRATIONS
- Supabase Auth
- Supabase Database
- Supabase Storage
- Optional email/WhatsApp notification hooks
- Excel export for request lists and details

SEED DATA
Create demo users for:
- Admin
- Finance Approver
- IT Approver
- Legal Approver
- HR Approver
- Final Approver
- Requester

EXPECTED OUTPUT
Generate the full UI and connect it to a real backend structure. The app should be logically wired so that login, request creation, approval actions, comments, and admin management all work with live data.

FINAL INSTRUCTION
Build this as a polished, working business application with real backend-ready structure, not a prototype-only mockup.
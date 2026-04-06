export interface User {
  id: number;
  name: string;
  username: string;
  password: string;
  role: 'requester' | 'approver_finance' | 'approver_it' | 'approver_legal' | 'approver_hr' | 'final_approver' | 'admin';
  dept: string;
  active: boolean;
  mustChangePwd: boolean;
  phone: string;
  email?: string;
}

export interface Approval {
  stage: string;
  by: string;
  action: 'Approved' | 'Rejected' | 'Clarification';
  comment: string;
  timestamp: string;
}

export interface Request {
  id: number;
  refNo: string;
  title: string;
  description: string;
  type: 'Finance' | 'IT' | 'Procurement' | 'Legal' | 'HR';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending Review' | 'Under Review' | 'Needs Clarification' | 'Approved L1' | 'Pending Final' | 'Approved' | 'Rejected';
  submitter: string;
  dept: string;
  createdAt: string;
  approvals: Approval[];
  comments: Array<{ by: string; text: string; timestamp: string }>;
  attachments?: Array<{ name: string; type: string; uploader: string; date: string; version: string }>;
}

export const MOCK_USERS: User[] = [
  { id: 1, name: 'Admin', username: 'admin', password: 'admin123', role: 'admin', dept: 'Management', active: true, mustChangePwd: false, phone: '9150459992', email: 'admin@bnriinfra.com' },
  { id: 2, name: 'Bob Finance', username: 'bob', password: 'pass123', role: 'approver_finance', dept: 'Finance', active: true, mustChangePwd: false, phone: '9876543210', email: 'bob.finance@bnriinfra.com' },
  { id: 3, name: 'Ravi Kumar', username: 'ravi', password: 'pass123', role: 'approver_it', dept: 'IT', active: true, mustChangePwd: false, phone: '9876543211', email: 'ravi.kumar@bnriinfra.com' },
  { id: 4, name: 'Carol Legal', username: 'carol', password: 'pass123', role: 'approver_legal', dept: 'Legal', active: true, mustChangePwd: false, phone: '9876543212', email: 'carol.legal@bnriinfra.com' },
  { id: 5, name: 'Priya Sharma', username: 'priya', password: 'pass123', role: 'approver_hr', dept: 'HR', active: true, mustChangePwd: false, phone: '9876543213', email: 'priya.sharma@bnriinfra.com' },
  { id: 6, name: 'David Director', username: 'david', password: 'pass123', role: 'final_approver', dept: 'Management', active: true, mustChangePwd: false, phone: '9876543214', email: 'david.director@bnriinfra.com' },
  { id: 7, name: 'Alice Requester', username: '9123456789', password: 'alice123', role: 'requester', dept: 'Operations', active: true, mustChangePwd: false, phone: '9123456789', email: 'alice.requester@bnriinfra.com' },
];

export const MOCK_REQUESTS: Request[] = [
  {
    id: 1,
    refNo: 'REQ-2026-001',
    title: 'Budget Approval for Q2 Marketing Campaign',
    description: 'Request for approval of ₹5,00,000 budget for Q2 digital marketing initiatives including social media ads and influencer partnerships.',
    type: 'Finance',
    priority: 'High',
    status: 'Approved',
    submitter: 'Alice Requester',
    dept: 'Operations',
    createdAt: '2026-04-01T10:30:00',
    approvals: [
      { stage: 'L1', by: 'Bob Finance', action: 'Approved', comment: 'Budget allocation looks reasonable', timestamp: '2026-04-01T14:20:00' },
      { stage: 'Final', by: 'David Director', action: 'Approved', comment: 'Approved for Q2 execution', timestamp: '2026-04-02T09:15:00' }
    ],
    comments: []
  },
  {
    id: 2,
    refNo: 'REQ-2026-002',
    title: 'New Laptop for Development Team',
    description: 'Request for 3 MacBook Pro laptops for the new developers joining next month. Estimated cost: ₹4,50,000.',
    type: 'IT',
    priority: 'Medium',
    status: 'Pending Final',
    submitter: 'Alice Requester',
    dept: 'Operations',
    createdAt: '2026-04-02T11:00:00',
    approvals: [
      { stage: 'L1', by: 'Ravi Kumar', action: 'Approved', comment: 'IT specs verified and approved', timestamp: '2026-04-02T16:45:00' }
    ],
    comments: [
      { by: 'Ravi Kumar', text: 'Please confirm the RAM and storage specifications', timestamp: '2026-04-02T12:00:00' }
    ]
  },
  {
    id: 3,
    refNo: 'REQ-2026-003',
    title: 'Contract Review for Vendor Agreement',
    description: 'Need legal review for new vendor contract worth ₹10,00,000 annually.',
    type: 'Legal',
    priority: 'High',
    status: 'Under Review',
    submitter: 'Alice Requester',
    dept: 'Operations',
    createdAt: '2026-04-03T09:30:00',
    approvals: [],
    comments: []
  },
  {
    id: 4,
    refNo: 'REQ-2026-004',
    title: 'Hire 2 New Sales Representatives',
    description: 'Request approval to hire 2 sales reps for the South region. Expected salary: ₹6,00,000 per annum each.',
    type: 'HR',
    priority: 'Medium',
    status: 'Needs Clarification',
    submitter: 'Alice Requester',
    dept: 'Operations',
    createdAt: '2026-04-03T14:00:00',
    approvals: [
      { stage: 'L1', by: 'Priya Sharma', action: 'Clarification', comment: 'Please provide detailed job description and required qualifications', timestamp: '2026-04-04T10:00:00' }
    ],
    comments: []
  },
  {
    id: 5,
    refNo: 'REQ-2026-005',
    title: 'Purchase Office Furniture',
    description: 'Request to purchase ergonomic chairs and standing desks for 10 employees. Cost: ₹2,50,000.',
    type: 'Procurement',
    priority: 'Low',
    status: 'Pending Review',
    submitter: 'Alice Requester',
    dept: 'Operations',
    createdAt: '2026-04-04T11:30:00',
    approvals: [],
    comments: []
  },
  {
    id: 6,
    refNo: 'REQ-2026-006',
    title: 'Cloud Infrastructure Upgrade',
    description: 'Upgrade AWS infrastructure to handle increased traffic. Estimated monthly cost increase: ₹1,50,000.',
    type: 'IT',
    priority: 'Critical',
    status: 'Approved',
    submitter: 'Alice Requester',
    dept: 'Operations',
    createdAt: '2026-04-05T08:00:00',
    approvals: [
      { stage: 'L1', by: 'Ravi Kumar', action: 'Approved', comment: 'Critical infrastructure need', timestamp: '2026-04-05T09:30:00' },
      { stage: 'Final', by: 'David Director', action: 'Approved', comment: 'Fast-tracked approval', timestamp: '2026-04-05T10:00:00' }
    ],
    comments: []
  }
];

export const ROLE_LABELS: Record<User['role'], string> = {
  requester: 'Requester',
  approver_finance: 'Finance Approver',
  approver_it: 'IT Approver',
  approver_legal: 'Legal Approver',
  approver_hr: 'HR Approver',
  final_approver: 'Final Approver',
  admin: 'Admin'
};

export const STATUS_COLORS: Record<Request['status'], string> = {
  'Pending Review': 'text-amber-600 bg-amber-50 border-amber-200',
  'Under Review': 'text-blue-600 bg-blue-50 border-blue-200',
  'Needs Clarification': 'text-purple-600 bg-purple-50 border-purple-200',
  'Approved L1': 'text-teal-600 bg-teal-50 border-teal-200',
  'Pending Final': 'text-teal-600 bg-teal-50 border-teal-200',
  'Approved': 'text-green-600 bg-green-50 border-green-200',
  'Rejected': 'text-red-600 bg-red-50 border-red-200'
};

export const TYPE_COLORS: Record<Request['type'], string> = {
  Finance: 'text-blue-600 bg-blue-50',
  IT: 'text-purple-600 bg-purple-50',
  Procurement: 'text-teal-600 bg-teal-50',
  Legal: 'text-amber-600 bg-amber-50',
  HR: 'text-red-600 bg-red-50'
};

export const PRIORITY_COLORS: Record<Request['priority'], string> = {
  Low: 'text-gray-600 bg-gray-50',
  Medium: 'text-amber-600 bg-amber-50',
  High: 'text-red-600 bg-red-50',
  Critical: 'text-red-700 bg-red-100 font-bold'
};

import * as XLSX from 'xlsx';
import { Request } from '../data/mockData';

export function exportRequestsToExcel(requests: Request[], filename: string = 'BNRI_Requests_Export.xlsx') {
  // Prepare data for export
  const exportData = requests.map(req => ({
    'Ref No': req.refNo,
    'Title': req.title,
    'Description': req.description,
    'Type': req.type,
    'Priority': req.priority,
    'Status': req.status,
    'Submitter': req.submitter,
    'Department': req.dept,
    'Created Date': new Date(req.createdAt).toLocaleString(),
    'Latest Comment': req.comments.length > 0
      ? `${req.comments[req.comments.length - 1].by}: ${req.comments[req.comments.length - 1].text}`
      : 'No comments',
    'Approvals Count': req.approvals.length,
    'Last Approval': req.approvals.length > 0
      ? `${req.approvals[req.approvals.length - 1].action} by ${req.approvals[req.approvals.length - 1].by}`
      : 'Pending'
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  const columnWidths = [
    { wch: 15 }, // Ref No
    { wch: 40 }, // Title
    { wch: 50 }, // Description
    { wch: 12 }, // Type
    { wch: 10 }, // Priority
    { wch: 18 }, // Status
    { wch: 20 }, // Submitter
    { wch: 15 }, // Department
    { wch: 20 }, // Created Date
    { wch: 50 }, // Latest Comment
    { wch: 15 }, // Approvals Count
    { wch: 30 }  // Last Approval
  ];
  worksheet['!cols'] = columnWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Requests');

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, filename);
}

export function exportRequestDetailToExcel(request: Request, filename?: string) {
  const fname = filename || `${request.refNo}_Detail.xlsx`;

  // Basic info sheet
  const basicInfo = [
    { Field: 'Reference No', Value: request.refNo },
    { Field: 'Title', Value: request.title },
    { Field: 'Description', Value: request.description },
    { Field: 'Type', Value: request.type },
    { Field: 'Priority', Value: request.priority },
    { Field: 'Status', Value: request.status },
    { Field: 'Submitter', Value: request.submitter },
    { Field: 'Department', Value: request.dept },
    { Field: 'Created Date', Value: new Date(request.createdAt).toLocaleString() }
  ];

  // Approvals sheet
  const approvals = request.approvals.map(a => ({
    'Stage': a.stage,
    'Approver': a.by,
    'Action': a.action,
    'Comment': a.comment || '-',
    'Timestamp': new Date(a.timestamp).toLocaleString()
  }));

  // Comments sheet
  const comments = request.comments.map(c => ({
    'By': c.by,
    'Comment': c.text,
    'Timestamp': new Date(c.timestamp).toLocaleString()
  }));

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Add sheets
  const basicSheet = XLSX.utils.json_to_sheet(basicInfo);
  basicSheet['!cols'] = [{ wch: 20 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(workbook, basicSheet, 'Request Info');

  if (approvals.length > 0) {
    const approvalsSheet = XLSX.utils.json_to_sheet(approvals);
    approvalsSheet['!cols'] = [{ wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 40 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, approvalsSheet, 'Approvals');
  }

  if (comments.length > 0) {
    const commentsSheet = XLSX.utils.json_to_sheet(comments);
    commentsSheet['!cols'] = [{ wch: 20 }, { wch: 60 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, commentsSheet, 'Comments');
  }

  // Generate Excel file
  XLSX.writeFile(workbook, fname);
}

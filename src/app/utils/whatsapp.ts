import { Request, User } from '../data/mockData';

export const WHATSAPP_CONFIG = {
  OWNER_LINK: 'https://wa.me/message/KDRAPEQYUHEBB1',
  OWNER_NUMBER: '9150459992',
  SUPPORT_NUMBER: '9500329430'
};

export function openWhatsAppOwner() {
  window.open(WHATSAPP_CONFIG.OWNER_LINK, '_blank');
}

export function openWhatsAppSupport() {
  window.open(`https://wa.me/${WHATSAPP_CONFIG.SUPPORT_NUMBER}`, '_blank');
}

export function notifyRequestSubmitted(request: Request) {
  const message = encodeURIComponent(
    `🆕 New Request Submitted\n\n` +
    `Ref: ${request.refNo}\n` +
    `Title: ${request.title}\n` +
    `Type: ${request.type}\n` +
    `Priority: ${request.priority}\n` +
    `Submitter: ${request.submitter}\n\n` +
    `Please review and approve.`
  );
  window.open(`https://wa.me/${WHATSAPP_CONFIG.OWNER_NUMBER}?text=${message}`, '_blank');
}

export function notifyApprovalAction(request: Request, action: string, approver: string, comment?: string) {
  const actionEmoji = action === 'Approved' ? '✅' : action === 'Rejected' ? '❌' : '❓';
  const message = encodeURIComponent(
    `${actionEmoji} Request ${action}\n\n` +
    `Ref: ${request.refNo}\n` +
    `Title: ${request.title}\n` +
    `Action by: ${approver}\n` +
    `${comment ? `Comment: ${comment}\n` : ''}` +
    `Status: ${request.status}`
  );
  window.open(`https://wa.me/${WHATSAPP_CONFIG.OWNER_NUMBER}?text=${message}`, '_blank');
}

export function contactSubmitter(request: Request, submitterPhone?: string) {
  if (!submitterPhone) {
    alert('Submitter phone number not available');
    return;
  }
  const message = encodeURIComponent(
    `Regarding ${request.refNo}: ${request.title}\n\n` +
    `Current Status: ${request.status}`
  );
  window.open(`https://wa.me/${submitterPhone}?text=${message}`, '_blank');
}

export function notifyRequestUpdate(request: Request, updateType: string, message: string) {
  const fullMessage = encodeURIComponent(
    `📝 Request Update: ${updateType}\n\n` +
    `Ref: ${request.refNo}\n` +
    `Title: ${request.title}\n` +
    `Status: ${request.status}\n\n` +
    `${message}`
  );
  window.open(`https://wa.me/${WHATSAPP_CONFIG.OWNER_NUMBER}?text=${fullMessage}`, '_blank');
}

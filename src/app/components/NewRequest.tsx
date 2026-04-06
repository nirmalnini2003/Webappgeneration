import { useState } from 'react';
import { Request, User } from '../data/mockData';
import { notifyRequestSubmitted } from '../utils/whatsapp';

interface NewRequestProps {
  currentUser: User;
  requests: Request[];
  onAddRequest: (request: Request) => void;
  onNavigate: () => void;
}

export function NewRequest({ currentUser, requests, onAddRequest, onNavigate }: NewRequestProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Request['type']>('Finance');
  const [priority, setPriority] = useState<Request['priority']>('Medium');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const newRequest: Request = {
      id: requests.length + 1,
      refNo: `REQ-2026-${String(requests.length + 1).padStart(3, '0')}`,
      title: title.trim(),
      description: description.trim(),
      type,
      priority,
      status: 'Pending Review',
      submitter: currentUser.name,
      dept: currentUser.dept,
      createdAt: new Date().toISOString(),
      approvals: [],
      comments: []
    };

    onAddRequest(newRequest);

    // Show success message
    const sendNotification = confirm(
      `✅ Request ${newRequest.refNo} submitted successfully!\n\nWould you like to send a WhatsApp notification to the approver?`
    );

    if (sendNotification) {
      notifyRequestSubmitted(newRequest);
    }

    // Reset form
    setTitle('');
    setDescription('');
    setType('Finance');
    setPriority('Medium');

    // Navigate to requests page
    onNavigate();
  };

  return (
    <div className="p-7">
      {/* Header */}
      <div className="mb-6">
        <div className="text-[22px] font-bold tracking-tight text-[#1A2E4A]">New Request</div>
        <div className="text-sm text-[#4A6A8A] mt-0.5">Submit a new request for approval</div>
      </div>

      {/* Form */}
      <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-7 max-w-[700px]">
        {/* Title */}
        <div className="mb-5">
          <label className="text-xs text-[#4A6A8A] font-bold tracking-wide uppercase block mb-2">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Request title..."
            className="w-full bg-[#F0F6FF] border border-[#C2D9F0] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2563EB] transition-colors"
          />
        </div>

        {/* Type and Priority */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="text-xs text-[#4A6A8A] font-bold tracking-wide uppercase block mb-2">
              Request Type *
            </label>
            <div className="flex flex-wrap gap-2">
              {(['Finance', 'IT', 'Procurement', 'Legal', 'HR'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3.5 py-2 rounded-full border text-xs font-semibold transition-all ${
                    type === t
                      ? 'border-[#2563EB] bg-[#DBEAFE] text-[#2563EB]'
                      : 'border-[#C2D9F0] bg-[#F0F6FF] text-[#4A6A8A] hover:border-[#2563EB] hover:bg-[#DBEAFE] hover:text-[#2563EB]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-[#4A6A8A] font-bold tracking-wide uppercase block mb-2">
              Priority
            </label>
            <div className="flex flex-wrap gap-2">
              {(['Low', 'Medium', 'High', 'Critical'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-3.5 py-2 rounded-full border text-xs font-semibold transition-all ${
                    priority === p
                      ? 'border-[#2563EB] bg-[#DBEAFE] text-[#2563EB]'
                      : 'border-[#C2D9F0] bg-[#F0F6FF] text-[#4A6A8A] hover:border-[#2563EB] hover:bg-[#DBEAFE] hover:text-[#2563EB]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-5">
          <label className="text-xs text-[#4A6A8A] font-bold tracking-wide uppercase block mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your request in detail..."
            className="w-full bg-[#F0F6FF] border border-[#C2D9F0] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2563EB] transition-colors resize-vertical h-24"
          />
        </div>

        {/* Attachments */}
        <div className="mb-6">
          <label className="text-xs text-[#4A6A8A] font-bold tracking-wide uppercase block mb-2">
            Attachments
          </label>
          <label className="flex items-center gap-3 bg-[#F0F6FF] border-2 border-dashed border-[#C2D9F0] rounded-lg p-4 cursor-pointer hover:border-[#2563EB] hover:bg-[#DBEAFE] transition-all">
            <span className="text-2xl">📎</span>
            <div>
              <div className="text-sm font-semibold text-[#2563EB]">Click to choose files</div>
              <div className="text-xs text-[#8AAAC8] mt-0.5">No file chosen</div>
            </div>
            <input type="file" multiple className="hidden" />
          </label>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          className="bg-[#2563EB] text-white rounded-xl px-8 py-3.5 text-base font-bold hover:bg-[#1D4ED8] transition-colors"
        >
          Submit Request →
        </button>
      </div>
    </div>
  );
}

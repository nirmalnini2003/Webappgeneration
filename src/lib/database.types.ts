export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth_user_id: string | null
          name: string
          username: string
          email: string
          phone: string | null
          role: 'requester' | 'approver_finance' | 'approver_it' | 'approver_legal' | 'approver_hr' | 'final_approver' | 'admin'
          dept: string
          active: boolean
          must_change_pwd: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id?: string | null
          name: string
          username: string
          email: string
          phone?: string | null
          role: 'requester' | 'approver_finance' | 'approver_it' | 'approver_legal' | 'approver_hr' | 'final_approver' | 'admin'
          dept: string
          active?: boolean
          must_change_pwd?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string | null
          name?: string
          username?: string
          email?: string
          phone?: string | null
          role?: 'requester' | 'approver_finance' | 'approver_it' | 'approver_legal' | 'approver_hr' | 'final_approver' | 'admin'
          dept?: string
          active?: boolean
          must_change_pwd?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      requests: {
        Row: {
          id: string
          ref_no: string
          title: string
          description: string
          type: 'Finance' | 'IT' | 'Procurement' | 'Legal' | 'HR'
          priority: 'Low' | 'Medium' | 'High' | 'Critical'
          status: 'Pending Review' | 'Under Review' | 'Needs Clarification' | 'Approved L1' | 'Pending Final' | 'Approved' | 'Rejected'
          submitter_id: string
          submitter_name: string
          dept: string
          assigned_approver_id: string | null
          final_approver_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ref_no?: string
          title: string
          description: string
          type: 'Finance' | 'IT' | 'Procurement' | 'Legal' | 'HR'
          priority: 'Low' | 'Medium' | 'High' | 'Critical'
          status?: 'Pending Review' | 'Under Review' | 'Needs Clarification' | 'Approved L1' | 'Pending Final' | 'Approved' | 'Rejected'
          submitter_id: string
          submitter_name: string
          dept: string
          assigned_approver_id?: string | null
          final_approver_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ref_no?: string
          title?: string
          description?: string
          type?: 'Finance' | 'IT' | 'Procurement' | 'Legal' | 'HR'
          priority?: 'Low' | 'Medium' | 'High' | 'Critical'
          status?: 'Pending Review' | 'Under Review' | 'Needs Clarification' | 'Approved L1' | 'Pending Final' | 'Approved' | 'Rejected'
          submitter_id?: string
          submitter_name?: string
          dept?: string
          assigned_approver_id?: string | null
          final_approver_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      approval_history: {
        Row: {
          id: string
          request_id: string
          stage: 'L1' | 'Final'
          action: 'Approved' | 'Rejected' | 'Clarification'
          action_by: string
          action_by_name: string
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          stage: 'L1' | 'Final'
          action: 'Approved' | 'Rejected' | 'Clarification'
          action_by: string
          action_by_name: string
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          stage?: 'L1' | 'Final'
          action?: 'Approved' | 'Rejected' | 'Clarification'
          action_by?: string
          action_by_name?: string
          comment?: string | null
          created_at?: string
        }
      }
      request_comments: {
        Row: {
          id: string
          request_id: string
          user_id: string
          user_name: string
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          user_id: string
          user_name: string
          comment: string
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          user_id?: string
          user_name?: string
          comment?: string
          created_at?: string
        }
      }
      request_attachments: {
        Row: {
          id: string
          request_id: string
          file_name: string
          file_type: string | null
          file_url: string
          uploaded_by: string
          uploaded_by_name: string
          version: number
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          file_name: string
          file_type?: string | null
          file_url: string
          uploaded_by: string
          uploaded_by_name: string
          version?: number
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          file_name?: string
          file_type?: string | null
          file_url?: string
          uploaded_by?: string
          uploaded_by_name?: string
          version?: number
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          request_id: string
          action: string
          old_value: string | null
          new_value: string | null
          performed_by: string
          performed_by_name: string
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          action: string
          old_value?: string | null
          new_value?: string | null
          performed_by: string
          performed_by_name: string
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          action?: string
          old_value?: string | null
          new_value?: string | null
          performed_by?: string
          performed_by_name?: string
          created_at?: string
        }
      }
      notification_logs: {
        Row: {
          id: string
          request_id: string
          recipient: string
          channel: 'email' | 'whatsapp' | 'system' | null
          message: string
          status: string
          sent_at: string
        }
        Insert: {
          id?: string
          request_id: string
          recipient: string
          channel?: 'email' | 'whatsapp' | 'system' | null
          message: string
          status?: string
          sent_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          recipient?: string
          channel?: 'email' | 'whatsapp' | 'system' | null
          message?: string
          status?: string
          sent_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

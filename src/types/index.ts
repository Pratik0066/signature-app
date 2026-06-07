export type DocumentStatus = "draft" | "pending" | "signed" | "rejected" | "expired"

export type FieldType = "signature" | "initials" | "text" | "date" | "checkbox"

export type SignerRole = "signer" | "approver" | "cc"

export type SignerStatus = "pending" | "viewed" | "signed" | "rejected"

export type AuditAction =
  | "document_uploaded"
  | "field_added"
  | "signer_invited"
  | "document_viewed"
  | "signature_added"
  | "document_signed"
  | "document_completed"
  | "signer_removed"

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  user_id: string
  name: string
  file_url: string
  file_path: string
  status: DocumentStatus
  page_count: number
  created_at: string
  updated_at: string
}

export interface SignatureField {
  id: string
  document_id: string
  signer_id: string | null
  field_type: FieldType
  label: string
  page: number
  x: number
  y: number
  width: number
  height: number
  required: boolean
  created_at: string
}

export interface Signer {
  id: string
  document_id: string
  email: string
  name: string
  role: SignerRole
  status: SignerStatus
  signing_order: number
  token: string
  viewed_at: string | null
  signed_at: string | null
  created_at: string
}

export interface Signature {
  id: string
  signer_id: string
  document_id: string
  field_id: string
  image_url: string | null
  type: "draw" | "type" | "upload"
  created_at: string
}

export interface AuditLog {
  id: string
  document_id: string
  user_id: string | null
  signer_id: string | null
  action: AuditAction
  details: Record<string, unknown>
  ip_address: string | null
  browser: string | null
  country: string | null
  device: string | null
  created_at: string
}

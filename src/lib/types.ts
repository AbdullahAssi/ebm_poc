// Document Types
export type DocumentType = "pdf" | "pptx";

export interface Document {
  id: string;
  name: string;
  description: string;
  originalFileName: string;
  type: DocumentType;
  size: number;
  uploadDate: Date;
  downloadUrl: string;
  keywords: string[];
  uploadedBy?: string;
}

// Upload Types
export interface UploadDocumentRequest {
  file: File;
  documentName: string;
  description?: string;
}

export interface UploadDocumentResponse {
  success: boolean;
  document?: Document;
  error?: string;
}

// Chat Types
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  relatedDocuments?: DocumentReference[];
}

export interface DocumentReference {
  documentId: string;
  documentName: string;
  downloadUrl: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter Types
export interface DocumentFilters {
  search?: string;
  type?: DocumentType | "all";
  page?: number;
  pageSize?: number;
}

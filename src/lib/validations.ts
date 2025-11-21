import { z } from "zod";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
];

export const uploadDocumentSchema = z.object({
  documentName: z
    .string()
    .min(1, "Document name is required")
    .min(3, "Document name must be at least 3 characters")
    .max(100, "Document name must not exceed 100 characters"),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional(),
  file: z
    .custom<File>()
    .refine((file) => file instanceof File, "File is required")
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      "File size must be less than 50MB"
    )
    .refine(
      (file) =>
        ACCEPTED_FILE_TYPES.includes(file.type) ||
        file.name.endsWith(".pdf") ||
        file.name.endsWith(".pptx"),
      "Only PDF and PPTX files are accepted"
    ),
});

export type UploadDocumentFormData = z.infer<typeof uploadDocumentSchema>;

export const searchDocumentsSchema = z.object({
  query: z.string().max(200, "Search query too long").optional(),
  type: z.enum(["all", "pdf", "pptx"]).default("all"),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(12),
});

export type SearchDocumentsFormData = z.infer<typeof searchDocumentsSchema>;

// Lead Form Validation
export const leadFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(100, "Email must not exceed 100 characters"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[\d\s\-\+\(\)]+$/, "Please enter a valid phone number")
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number must not exceed 20 characters"),
  subject: z
    .string()
    .min(1, "Subject is required")
    .min(3, "Subject must be at least 3 characters")
    .max(200, "Subject must not exceed 200 characters"),
  message: z
    .string()
    .min(1, "Message is required")
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must not exceed 1000 characters"),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;

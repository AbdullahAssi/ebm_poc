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

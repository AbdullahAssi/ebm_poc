import { z } from "zod";

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
];
export const ACCEPTED_FILE_EXTENSIONS = [".pdf", ".pptx", ".ppt"];

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

/**
 * Format bot response with markdown and clickable links
 * Converts URLs, markdown formatting, and lists to HTML
 * @param text - Raw text from bot response
 * @returns Formatted HTML string
 */
export const formatBotResponse = (text: string): string => {
  if (!text) return "";

  // Ensure text is a string
  if (typeof text !== "string") {
    console.warn(
      "formatBotResponse received non-string input:",
      typeof text,
      text
    );
    text = String(text);
  }

  // First, convert URLs to clickable hyperlinks (before any other HTML processing)
  let formatted = text
    .split(/(\s+)/)
    .map((part) => {
      // Check if this part looks like a URL (http://, https://, or www.) and doesn't contain HTML
      const httpPattern = /^https?:\/\/[^\s<>"']+/;
      const wwwPattern = /^www\.[^\s<>"']+/;

      if (
        (httpPattern.test(part) || wwwPattern.test(part)) &&
        !part.includes("<") &&
        !part.includes(">")
      ) {
        // Remove any trailing punctuation that might be part of the sentence
        const cleanUrl = part.replace(/[.,;!?]+$/, "");
        const trailingPunc = part.substring(cleanUrl.length);

        // Add protocol if missing (for www. URLs)
        const fullUrl = cleanUrl.startsWith("www.")
          ? `https://${cleanUrl}`
          : cleanUrl;

        // Create display text
        let displayText = cleanUrl;
        if (cleanUrl.length > 50) {
          displayText = cleanUrl.substring(0, 47) + "...";
        }

        return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">${displayText}</a>${trailingPunc}`;
      }
      return part;
    })
    .join("");

  // Then apply markdown-style formatting to HTML
  formatted = formatted
    // Convert **bold** to <strong>
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Convert *italic* to <em>
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Convert bullet points (*, -, +) to proper HTML lists
    .replace(/^\s*[\*\-\+]\s+(.+)$/gm, "<li>$1</li>")
    // Convert numbered lists (1., 2., etc.)
    .replace(/^\s*\d+\.\s+(.+)$/gm, "<li>$1</li>")
    // Convert line breaks to <br>
    .replace(/\n/g, "<br>")
    // Convert double breaks to paragraph spacing
    .replace(/<br><br>/g, "</p><p>");

  // Wrap consecutive <li> elements in <ul>
  formatted = formatted.replace(
    /(<li>.*?<\/li>)(\s*<li>.*?<\/li>)*/g,
    function (match) {
      return (
        '<ul class="list-disc list-inside space-y-1 my-2">' + match + "</ul>"
      );
    }
  );

  // Wrap in paragraph tags if not already wrapped
  if (!formatted.includes("<p>") && !formatted.includes("<ul>")) {
    formatted = "<p>" + formatted + "</p>";
  } else if (formatted.includes("<p>")) {
    formatted = "<p>" + formatted + "</p>";
  }

  return formatted;
};

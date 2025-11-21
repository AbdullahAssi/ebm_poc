"use client";

import { useState } from "react";
import { FileUpload } from "@/components/chat/file-upload";
import { HiDocumentText, HiTrash, HiCheckCircle } from "react-icons/hi";

interface UploadedDocument {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadDate: Date;
}

export default function AdminPage() {
  const [uploadedDocuments, setUploadedDocuments] = useState<
    UploadedDocument[]
  >([]);
  const [successMessage, setSuccessMessage] = useState("");

  const handleUploadSuccess = (files: Array<{ url: string; name: string }>) => {
    // Add uploaded files to the list
    const newDocs = files.map((file) => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      url: file.url,
      size: 0, // Size not available from upload response
      uploadDate: new Date(),
    }));

    setUploadedDocuments((prev) => [...newDocs, ...prev]);
    setSuccessMessage(
      `Successfully uploaded ${files.length} document${
        files.length > 1 ? "s" : ""
      }!`
    );

    // Clear success message after 5 seconds
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const handleDelete = (id: string) => {
    // TODO: Implement actual delete API call
    setUploadedDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "N/A";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0b0b0b]">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Panel - Document Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload and manage documents for the chatbot knowledge base
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3 animate-fadeIn">
            <HiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
            <p className="text-green-800 dark:text-green-200">
              {successMessage}
            </p>
          </div>
        )}

        {/* File Upload Component */}
        <div className="mb-8">
          <FileUpload
            onUploadSuccess={handleUploadSuccess}
            allowMultiple={true}
            maxSizeMB={15}
            acceptedFileTypes=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.ppt,.pptx"
          />
        </div>

        {/* Uploaded Documents List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Uploaded Documents ({uploadedDocuments.length})
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage your uploaded documents
            </p>
          </div>

          <div className="p-5 sm:p-6">
            {uploadedDocuments.length === 0 ? (
              <div className="text-center py-12">
                <HiDocumentText className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  No documents uploaded yet
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Upload your first document using the form above
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {uploadedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <HiDocumentText className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 truncate">
                        {doc.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          {doc.uploadDate.toLocaleDateString()} at{" "}
                          {doc.uploadDate.toLocaleTimeString()}
                        </span>
                        {doc.size > 0 && (
                          <span>{formatFileSize(doc.size)}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                      aria-label="Delete document"
                      title="Delete document"
                    >
                      <HiTrash className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

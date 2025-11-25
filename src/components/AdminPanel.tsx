"use client";

import { useState } from "react";
import { HiUpload, HiX, HiDocument, HiCheckCircle } from "react-icons/hi";
import {
  ACCEPTED_FILE_TYPES,
  ACCEPTED_FILE_EXTENSIONS,
  MAX_FILE_SIZE,
  uploadDocumentSchema,
  type UploadDocumentFormData,
} from "@/lib/validations";
import type { UploadedFile } from "@/lib/types";

export default function AdminPanel() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    documentName?: string;
    description?: string;
    file?: string;
  }>({});

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const isValidType =
        ACCEPTED_FILE_TYPES.includes(file.type) ||
        ACCEPTED_FILE_EXTENSIONS.some((ext) =>
          file.name.toLowerCase().endsWith(ext)
        );

      if (!isValidType) {
        alert("Please select only PDF or PPTX files");
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        alert(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        return;
      }

      setSelectedFile(file);
      // Pre-fill document name from filename
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setDocumentName(nameWithoutExt);

      // Clear previous errors
      setValidationErrors({});
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file");
      return;
    }

    // Validate using Zod schema
    try {
      const formData: UploadDocumentFormData = {
        documentName: documentName,
        description: description || undefined,
        file: selectedFile,
      };

      uploadDocumentSchema.parse(formData);

      // Clear any previous validation errors
      setValidationErrors({});
    } catch (error) {
      if (error instanceof Error && "errors" in error) {
        const zodError = error as any;
        const errors: Record<string, string> = {};
        zodError.errors?.forEach((err: any) => {
          const path = err.path[0];
          errors[path] = err.message;
        });
        setValidationErrors(errors);
        return;
      }
      alert("Validation failed. Please check your input.");
      return;
    }

    setIsUploading(true);

    // Simulate upload - Replace with actual API call
    setTimeout(() => {
      const newFile: UploadedFile = {
        id: Date.now().toString(),
        originalName: selectedFile.name,
        documentName: documentName,
        description: description,
        type: selectedFile.type,
        size: selectedFile.size,
        uploadDate: new Date(),
      };

      setUploadedFiles([newFile, ...uploadedFiles]);
      setIsUploading(false);
      setShowSuccess(true);

      // Reset form
      setSelectedFile(null);
      setDocumentName("");
      setDescription("");
      setValidationErrors({});

      setTimeout(() => setShowSuccess(false), 3000);
    }, 2000);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setDocumentName("");
    setDescription("");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0b0b0b]">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload and manage product presentations and documents
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
            <HiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-green-800 dark:text-green-200">
              Document uploaded successfully!
            </p>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white dark:bg-[#171717] rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Upload New Document
          </h2>

          {/* File Upload Area */}
          {!selectedFile ? (
            <label className="block">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
                <HiUpload className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  PDF or PPTX files only
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.pptx"
                onChange={handleFileSelect}
              />
            </label>
          ) : (
            <div className="space-y-4">
              {/* Selected File Display */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HiDocument className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <HiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Document Details Form */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Document Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => {
                    setDocumentName(e.target.value);
                    if (validationErrors.documentName) {
                      setValidationErrors({
                        ...validationErrors,
                        documentName: undefined,
                      });
                    }
                  }}
                  placeholder="e.g., Product Orientation 2024"
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    validationErrors.documentName
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-700"
                  }`}
                />
                {validationErrors.documentName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {validationErrors.documentName}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (validationErrors.description) {
                      setValidationErrors({
                        ...validationErrors,
                        description: undefined,
                      });
                    }
                  }}
                  placeholder="Brief description of the document content..."
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none ${
                    validationErrors.description
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-700"
                  }`}
                />
                {validationErrors.description && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {validationErrors.description}
                  </p>
                )}
              </div>

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={isUploading || !documentName.trim()}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <HiUpload className="w-5 h-5" />
                    Upload Document
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Uploaded Documents List */}
        <div className="bg-white dark:bg-[#171717] rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Uploaded Documents ({uploadedFiles.length})
          </h2>

          {uploadedFiles.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No documents uploaded yet
            </p>
          ) : (
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <HiDocument className="w-6 h-6 text-blue-500 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                          {file.documentName}
                        </h3>
                        {file.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {file.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>Original: {file.originalName}</span>
                          <span>{formatFileSize(file.size)}</span>
                          <span>{file.uploadDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <button className="text-red-500 hover:text-red-700 text-sm font-medium">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

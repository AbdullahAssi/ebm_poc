"use client";

import { useState, useRef } from "react";
import {
  HiUpload,
  HiX,
  HiCheckCircle,
  HiExclamationCircle,
  HiDocumentText,
} from "react-icons/hi";
import { Button } from "@/components/ui/button";

interface FileWithDescription {
  file: File;
  description: string;
}

interface FileUploadProps {
  onUploadSuccess?: (files: Array<{ url: string; name: string }>) => void;
  onClose?: () => void;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  allowMultiple?: boolean;
}

export function FileUpload({
  onUploadSuccess,
  onClose,
  acceptedFileTypes = ".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls",
  maxSizeMB = 10,
  allowMultiple = true,
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileWithDescription[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ url: string; name: string }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    console.log(
      `Selected ${files.length} file(s):`,
      files.map((f) => f.name)
    );

    const maxSize = maxSizeMB * 1024 * 1024;

    const validFilesWithDesc: FileWithDescription[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      if (file.size > maxSize) {
        errors.push(`${file.name} exceeds ${maxSizeMB}MB limit`);
      } else {
        validFilesWithDesc.push({ file, description: "" });
      }
    });

    if (errors.length > 0) {
      setErrorMessage(errors.join(", "));
      setUploadStatus("error");
    }

    if (validFilesWithDesc.length > 0) {
      // Append new files to existing selection if allowMultiple is true
      setSelectedFiles((prev) =>
        allowMultiple ? [...prev, ...validFilesWithDesc] : validFilesWithDesc
      );
      setUploadStatus("idle");
      if (errors.length === 0) {
        setErrorMessage("");
      }
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      console.log("No files selected for upload");
      return;
    }

    console.log(`Starting upload of ${selectedFiles.length} file(s)`);
    setIsUploading(true);
    setUploadStatus("idle");
    setErrorMessage("");
    const uploaded: Array<{ url: string; name: string }> = [];
    const errors: string[] = [];

    try {
      // Upload all files in a single request
      const formData = new FormData();

      selectedFiles.forEach(({ file, description }) => {
        formData.append("files", file);
        formData.append("descriptions", description || `${file.name} document`);
      });

      // Set progress for all files
      const progressInterval = setInterval(() => {
        selectedFiles.forEach(({ file }) => {
          setUploadProgress((prev) => {
            const current = prev[file.name] || 0;
            const next = current >= 90 ? 90 : current + 10;
            return { ...prev, [file.name]: next };
          });
        });
      }, 150);

      console.log("Sending POST request to /api/upload with multiple files");
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      console.log(`Response status: ${response.status}`);

      clearInterval(progressInterval);

      // Set all files to 100% progress
      selectedFiles.forEach(({ file }) => {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Upload failed:", error);
        throw new Error(error.error || "Upload failed");
      }

      const result = await response.json();
      console.log("Upload successful:", result);

      // Handle response - could be array or single object
      if (Array.isArray(result)) {
        result.forEach((item: any, index: number) => {
          uploaded.push({
            url: item.file_url || item.url,
            name: selectedFiles[index].file.name,
          });
        });
      } else {
        selectedFiles.forEach(({ file }) => {
          uploaded.push({
            url: result.file_url || result.url,
            name: file.name,
          });
        });
      }

      if (uploaded.length > 0) {
        console.log(
          `Successfully uploaded ${uploaded.length} file(s):`,
          uploaded
        );
        setUploadedFiles(uploaded);
        setUploadStatus("success");

        setTimeout(() => {
          console.log("Calling onUploadSuccess callback");
          onUploadSuccess?.(uploaded);
          setSelectedFiles([]);
          setUploadProgress({});
          setUploadedFiles([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }, 1500);
      }

      if (errors.length > 0) {
        console.error("Upload errors:", errors);
        setErrorMessage(errors.join(", "));
        if (uploaded.length === 0) {
          setUploadStatus("error");
        }
      }
    } catch (error) {
      console.error("Upload exception:", error);
      setUploadStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      console.log("Upload process finished");
      setIsUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files || []);
    const maxSize = maxSizeMB * 1024 * 1024;

    const validFilesWithDesc: FileWithDescription[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      if (file.size > maxSize) {
        errors.push(`${file.name} exceeds ${maxSizeMB}MB limit`);
      } else {
        validFilesWithDesc.push({ file, description: "" });
      }
    });

    if (errors.length > 0) {
      setErrorMessage(errors.join(", "));
      setUploadStatus("error");
    }

    if (validFilesWithDesc.length > 0) {
      setSelectedFiles((prev) =>
        allowMultiple ? [...prev, ...validFilesWithDesc] : validFilesWithDesc
      );
      setUploadStatus("idle");
      if (errors.length === 0) {
        setErrorMessage("");
      }
    }
  };

  const updateDescription = (index: number, description: string) => {
    setSelectedFiles((prev) =>
      prev.map((item, i) => (i === index ? { ...item, description } : item))
    );
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    if (selectedFiles.length === 1) {
      setUploadStatus("idle");
      setErrorMessage("");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <HiUpload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Upload Document
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Upload your documents to share with the assistant
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700 transition-colors shrink-0 ml-2"
              aria-label="Close"
            >
              <HiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Drag and Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept={acceptedFileTypes}
            multiple={allowMultiple}
            className="hidden"
            disabled={isUploading}
            data-multiple={allowMultiple ? "true" : "false"}
          />

          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <HiUpload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                Drag and drop files here
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {allowMultiple
                  ? "Multiple files supported"
                  : "Single file only"}{" "}
                • Max {maxSizeMB}MB per file
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {allowMultiple
                  ? "Browse Files (Ctrl+Click for multiple)"
                  : "Browse File"}
              </button>
            </div>
          </div>
        </div>{" "}
        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""}{" "}
              selected
            </p>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedFiles.map(({ file, description }, index) => {
                const fileId = file.name;
                const progress = uploadProgress[fileId] || 0;
                return (
                  <div
                    key={`${file.name}-${index}`}
                    className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <HiDocumentText className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      {!isUploading && (
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          aria-label="Remove file"
                        >
                          <HiX className="w-4 h-4 text-gray-500" />
                        </button>
                      )}
                    </div>

                    {/* Description Input */}
                    {!isUploading && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={description}
                          onChange={(e) =>
                            updateDescription(index, e.target.value)
                          }
                          placeholder="Add a brief description"
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    {/* Progress Bar */}
                    {isUploading && progress > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* Overall Upload Status */}
        {isUploading && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Uploading {selectedFiles.length} file
              {selectedFiles.length > 1 ? "s" : ""}...
            </p>
          </div>
        )}
        {/* Status Messages */}
        {uploadStatus === "success" && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <HiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
            <p className="text-sm text-green-800 dark:text-green-200">
              {uploadedFiles.length} file{uploadedFiles.length > 1 ? "s" : ""}{" "}
              uploaded successfully!
            </p>
          </div>
        )}
        {uploadStatus === "error" && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <HiExclamationCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-200">
              {errorMessage}
            </p>
          </div>
        )}
        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={() => {
              console.log("Upload button clicked!");
              console.log(`Selected files count: ${selectedFiles.length}`);
              console.log("Selected files:", selectedFiles);
              handleUpload();
            }}
            disabled={
              selectedFiles.length === 0 ||
              isUploading ||
              uploadStatus === "success"
            }
            className="w-full h-12 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Uploading {selectedFiles.length} file
                {selectedFiles.length > 1 ? "s" : ""}...
              </>
            ) : uploadStatus === "success" ? (
              <>
                <HiCheckCircle className="w-5 h-5 mr-2" />
                Uploaded Successfully
              </>
            ) : (
              <>
                <HiUpload className="w-5 h-5 mr-2" />
                Upload{" "}
                {selectedFiles.length > 0
                  ? `${selectedFiles.length} File${
                      selectedFiles.length > 1 ? "s" : ""
                    }`
                  : "Files"}
              </>
            )}
          </Button>

          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full h-11 text-sm border-2"
              disabled={isUploading}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

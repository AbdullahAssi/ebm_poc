"use client";

import { useState } from "react";
import { Document } from "@/lib/types";
import { UploadForm } from "@/components/admin/upload-form";
import { DocumentList } from "@/components/admin/document-list";

// Sample data - Replace with API call
const sampleDocuments: Document[] = [];

export default function AdminPage() {
  const [documents, setDocuments] = useState<Document[]>(sampleDocuments);

  const handleUploadSuccess = () => {
    // TODO: Refresh documents list from API
    console.log("Upload successful, refreshing list...");
  };

  const handleDelete = (id: string) => {
    // TODO: Implement actual delete API call
    console.log("Deleting document:", id);
    setDocuments(documents.filter((doc) => doc.id !== id));
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

        {/* Upload Form */}
        <div className="mb-8">
          <UploadForm onSuccess={handleUploadSuccess} />
        </div>

        {/* Documents List */}
        <DocumentList documents={documents} onDelete={handleDelete} />
      </div>
    </div>
  );
}

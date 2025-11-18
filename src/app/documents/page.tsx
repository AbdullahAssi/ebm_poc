"use client";

import { useState } from "react";
import { Document, DocumentType } from "@/lib/types";
import { DocumentCard } from "@/components/documents/document-card";
import { DocumentSearch } from "@/components/documents/document-search";
import { Pagination } from "@/components/documents/pagination";
import { FileText } from "lucide-react";

// Sample data - Replace with API call
const sampleDocuments: Document[] = [
  {
    id: "1",
    name: "Product Orientation 2024",
    description: "Complete guide for new product features and capabilities",
    originalFileName: "product_orientation.pptx",
    type: "pptx",
    size: 5242880,
    uploadDate: new Date("2024-01-15"),
    downloadUrl: "/api/documents/download/1",
    keywords: ["product", "orientation", "features", "2024"],
  },
  {
    id: "2",
    name: "User Manual - Advanced Features",
    description: "Detailed documentation for advanced product features",
    originalFileName: "user_manual_advanced.pdf",
    type: "pdf",
    size: 3145728,
    uploadDate: new Date("2024-01-20"),
    downloadUrl: "/api/documents/download/2",
    keywords: ["manual", "advanced", "features", "documentation"],
  },
];

export default function DocumentsPage() {
  const [documents] = useState<Document[]>(sampleDocuments);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<DocumentType | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      searchQuery === "" ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.keywords.some((keyword) =>
        keyword.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesType = filterType === "all" || doc.type === filterType;

    return matchesSearch && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedDocuments = filteredDocuments.slice(
    startIndex,
    startIndex + pageSize
  );

  const handleDownload = (document: Document) => {
    // TODO: Implement actual download
    console.log("Downloading:", document.name);
    window.open(document.downloadUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0b0b0b]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Document Library
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse and download product presentations and documents
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <DocumentSearch
            onSearch={setSearchQuery}
            onFilterChange={(type) => {
              setFilterType(type);
              setCurrentPage(1);
            }}
            currentFilter={filterType}
          />

          {/* Results Count */}
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredDocuments.length} of {documents.length} documents
          </div>
        </div>

        {/* Documents Grid */}
        {paginatedDocuments.length === 0 ? (
          <div className="bg-white dark:bg-[#171717] rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              No documents found
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onDownload={handleDownload}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}

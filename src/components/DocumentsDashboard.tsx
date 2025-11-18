"use client";

import { useState } from "react";
import {
  HiSearch,
  HiDownload,
  HiDocument,
  HiDocumentText,
  HiFilter,
} from "react-icons/hi";

interface Document {
  id: string;
  name: string;
  description: string;
  type: "pdf" | "pptx";
  size: number;
  uploadDate: Date;
  downloadUrl: string;
  keywords: string[];
}

// Sample data - Replace with API call
const sampleDocuments: Document[] = [
  {
    id: "1",
    name: "Product Orientation 2024",
    description: "Complete guide for new product features and capabilities",
    type: "pptx",
    size: 5242880,
    uploadDate: new Date("2024-01-15"),
    downloadUrl: "#",
    keywords: ["product", "orientation", "features", "2024"],
  },
  {
    id: "2",
    name: "User Manual - Advanced Features",
    description: "Detailed documentation for advanced product features",
    type: "pdf",
    size: 3145728,
    uploadDate: new Date("2024-01-20"),
    downloadUrl: "#",
    keywords: ["manual", "advanced", "features", "documentation"],
  },
  {
    id: "3",
    name: "Sales Presentation Q1 2024",
    description: "Sales deck for Q1 2024 with metrics and targets",
    type: "pptx",
    size: 7340032,
    uploadDate: new Date("2024-02-01"),
    downloadUrl: "#",
    keywords: ["sales", "presentation", "q1", "2024", "metrics"],
  },
];

export default function DocumentsDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [documents] = useState<Document[]>(sampleDocuments);
  const [filterType, setFilterType] = useState<"all" | "pdf" | "pptx">("all");

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

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

  const handleDownload = (doc: Document) => {
    // Replace with actual download logic
    console.log("Downloading:", doc.name);
    alert(`Downloading: ${doc.name}`);
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

        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-[#171717] rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, description, or keywords..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              <HiFilter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("pdf")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === "pdf"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                PDF
              </button>
              <button
                onClick={() => setFilterType("pptx")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === "pptx"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                PPTX
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredDocuments.length} of {documents.length} documents
          </div>
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length === 0 ? (
          <div className="bg-white dark:bg-[#171717] rounded-lg shadow-sm p-12 text-center">
            <HiDocumentText className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              No documents found
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-[#171717] rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Document Icon Header */}
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 flex items-center justify-center">
                  {doc.type === "pdf" ? (
                    <HiDocumentText className="w-16 h-16 text-white" />
                  ) : (
                    <HiDocument className="w-16 h-16 text-white" />
                  )}
                </div>

                {/* Document Details */}
                <div className="p-5">
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          doc.type === "pdf"
                            ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                            : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                        }`}
                      >
                        {doc.type.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(doc.size)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {doc.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {doc.description}
                    </p>
                  </div>

                  {/* Keywords */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {doc.keywords.slice(0, 3).map((keyword, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {doc.uploadDate.toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <HiDownload className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

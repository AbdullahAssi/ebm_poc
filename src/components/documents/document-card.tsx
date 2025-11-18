"use client";

import { Document } from "@/lib/types";
import { formatFileSize, formatDate, cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, FileType } from "lucide-react";

interface DocumentCardProps {
  document: Document;
  onDownload?: (document: Document) => void;
}

export function DocumentCard({ document, onDownload }: DocumentCardProps) {
  const IconComponent = document.type === "pdf" ? FileText : FileType;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Icon Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 flex items-center justify-center">
        <IconComponent className="w-16 h-16 text-white" />
      </div>

      <CardContent className="p-5">
        {/* Type Badge and Size */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={cn(
              "text-xs font-semibold px-2 py-1 rounded uppercase",
              document.type === "pdf"
                ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
            )}
          >
            {document.type}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatFileSize(document.size)}
          </span>
        </div>

        {/* Document Name */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {document.name}
        </h3>

        {/* Description */}
        {document.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {document.description}
          </p>
        )}

        {/* Keywords */}
        {document.keywords && document.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {document.keywords.slice(0, 3).map((keyword, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(document.uploadDate)}
        </span>
        <Button
          size="sm"
          onClick={() => onDownload?.(document)}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
}

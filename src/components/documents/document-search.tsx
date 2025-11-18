"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DocumentType } from "@/lib/types";

interface DocumentSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (type: DocumentType | "all") => void;
  currentFilter: DocumentType | "all";
}

export function DocumentSearch({
  onSearch,
  onFilterChange,
  currentFilter,
}: DocumentSearchProps) {
  const [query, setQuery] = useState("");

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="bg-white dark:bg-[#171717] rounded-lg shadow-sm p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name, description, or keywords..."
            className="pl-10"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <Button
            variant={currentFilter === "all" ? "default" : "secondary"}
            size="sm"
            onClick={() => onFilterChange("all")}
          >
            All
          </Button>
          <Button
            variant={currentFilter === "pdf" ? "default" : "secondary"}
            size="sm"
            onClick={() => onFilterChange("pdf")}
          >
            PDF
          </Button>
          <Button
            variant={currentFilter === "pptx" ? "default" : "secondary"}
            size="sm"
            onClick={() => onFilterChange("pptx")}
          >
            PPTX
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, X, FileText, CheckCircle2 } from "lucide-react";
import {
  uploadDocumentSchema,
  type UploadDocumentFormData,
} from "@/lib/validations";
import { formatFileSize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UploadFormProps {
  onSuccess?: () => void;
}

export function UploadForm({ onSuccess }: UploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UploadDocumentFormData>({
    resolver: zodResolver(uploadDocumentSchema),
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValue("file", file);

      // Pre-fill document name from filename
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setValue("documentName", nameWithoutExt);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValue("file", undefined as any);
  };

  const onSubmit = async (data: UploadDocumentFormData) => {
    setIsUploading(true);

    try {
      // TODO: Replace with actual API call
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("documentName", data.documentName);
      if (data.description) {
        formData.append("description", data.description);
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // const response = await fetch("/api/documents/upload", {
      //   method: "POST",
      //   body: formData,
      // });

      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        handleReset();
        onSuccess?.();
      }, 3000);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    reset();
    setSelectedFile(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload New Document</CardTitle>
      </CardHeader>
      <CardContent>
        {uploadSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-green-800 dark:text-green-200">
              Document uploaded successfully!
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* File Upload */}
          {!selectedFile ? (
            <div>
              <Label htmlFor="file-upload">Document File</Label>
              <label
                htmlFor="file-upload"
                className="mt-2 block cursor-pointer"
              >
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    PDF or PPTX files only (Max 50MB)
                  </p>
                </div>
              </label>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.pptx"
                onChange={handleFileSelect}
              />
              {errors.file && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.file.message}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected File Display */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Document Name */}
              <div>
                <Label htmlFor="documentName">
                  Document Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="documentName"
                  {...register("documentName")}
                  placeholder="e.g., Product Orientation 2024"
                  className="mt-2"
                />
                {errors.documentName && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.documentName.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Brief description of the document content..."
                  rows={3}
                  className="mt-2"
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

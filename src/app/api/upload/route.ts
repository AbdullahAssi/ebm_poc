import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const descriptions = formData.getAll("descriptions") as string[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Validate file sizes (e.g., max 10MB per file)
    const maxSize = 15 * 1024 * 1024; // 15MB
    for (const file of files) {
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 15MB limit` },
          { status: 400 }
        );
      }
    }

    // Create form data for backend with multiple files and descriptions
    const backendFormData = new FormData();

    files.forEach((file, index) => {
      backendFormData.append("files", file);
      // Use provided description or default to filename
      const description = descriptions[index] || `${file.name} document`;
      backendFormData.append("descriptions", description);
    });

    // Forward to backend upload endpoint
    const response = await fetch(`${BACKEND_URL}/upload`, {
      method: "POST",
      body: backendFormData,
      signal: AbortSignal.timeout(60000), // 60 second timeout for uploads
    });

    if (!response.ok) {
      let errorMessage = "Upload failed";
      try {
        const errorData = await response.json();
        errorMessage =
          errorData.detail || errorData.message || JSON.stringify(errorData);
      } catch {
        errorMessage = await response.text();
      }
      console.error("Backend upload error:", errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log("Upload successful, backend response:", result);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Upload proxy error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to upload file",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.UPLOAD_API_URL || "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  console.log("=== Upload API Route Started ===");
  console.log("Backend URL:", BACKEND_URL);

  try {
    console.log("Reading formData from request...");
    const formData = await request.formData();

    const files = formData.getAll("files") as File[];
    const descriptions = formData.getAll("descriptions") as string[];

    console.log("Files received:", files.length);
    console.log("Descriptions received:", descriptions.length);
    console.log(
      "File details:",
      files.map((f) => ({ name: f.name, size: f.size, type: f.type }))
    );
    console.log("Descriptions:", descriptions);

    if (!files || files.length === 0) {
      console.error("ERROR: No files provided");
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Allowed file types
    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
      ".txt",
      ".ppt",
      ".pptx",
    ];
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    // Validate file types
    for (const file of files) {
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
      const isValidExtension = allowedExtensions.includes(fileExtension);
      const isValidMimeType = allowedMimeTypes.includes(file.type);

      if (!isValidExtension && !isValidMimeType) {
        console.error(
          `ERROR: File ${file.name} has unsupported format. Extension: ${fileExtension}, MIME: ${file.type}`
        );
        return NextResponse.json(
          {
            error: `File format not supported: ${file.name}. Allowed formats: PDF, DOC, DOCX, TXT, PPT, PPTX`,
          },
          { status: 400 }
        );
      }
    }

    // Validate file sizes (e.g., max 100MB per file)
    const maxSize = 100 * 1024 * 1024; // 100MB
    for (const file of files) {
      if (file.size > maxSize) {
        console.error(
          `ERROR: File ${file.name} exceeds 100MB limit (${file.size} bytes)`
        );
        return NextResponse.json(
          { error: `File ${file.name} exceeds 100MB limit` },
          { status: 400 }
        );
      }
    }

    // Create form data for backend with multiple files and descriptions
    const backendFormData = new FormData();
    console.log("Creating backend FormData...");

    // Process files with their buffers to avoid "Body already read" error
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      console.log(`Processing file ${index + 1}/${files.length}: ${file.name}`);

      const fileBuffer = await file.arrayBuffer();
      console.log(`File buffer size: ${fileBuffer.byteLength} bytes`);

      const blob = new Blob([fileBuffer], { type: file.type });
      console.log(`Created blob with type: ${file.type}`);

      backendFormData.append("files", blob, file.name);

      // Use provided description or default to filename
      const description = descriptions[index] || `${file.name} document`;
      backendFormData.append("descriptions", description);
      console.log(`Added description: ${description}`);
    }

    console.log(
      "Sending request to FastAPI backend:",
      `${BACKEND_URL}/upload_docs`
    );

    // Forward to backend upload endpoint
    const response = await fetch(`${BACKEND_URL}/upload_docs`, {
      method: "POST",
      body: backendFormData,
      signal: AbortSignal.timeout(60000), // 60 second timeout for uploads
    });

    console.log("FastAPI Response Status:", response.status);
    console.log("FastAPI Response OK:", response.ok);

    if (!response.ok) {
      console.error("FastAPI returned error status:", response.status);
      let errorMessage = "Upload failed";

      // Clone the response to read it multiple times
      const responseClone = response.clone();

      try {
        const errorData = await response.json();
        console.error("FastAPI error data:", errorData);
        errorMessage =
          errorData.detail || errorData.message || JSON.stringify(errorData);
      } catch (parseError) {
        console.error("Failed to parse error response as JSON:", parseError);
        try {
          const errorText = await responseClone.text();
          console.error(
            "FastAPI error text (first 500 chars):",
            errorText.substring(0, 500)
          );

          // Special handling for 413 error
          if (response.status === 413) {
            errorMessage =
              "File size exceeds server limit. Please reduce file size or contact administrator to increase server upload limit.";
          } else {
            errorMessage = errorText.includes("<html>")
              ? `Server error (${response.status}): ${response.statusText}`
              : errorText;
          }
        } catch (textError) {
          console.error("Failed to read error as text:", textError);
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
      }
      console.error("Final error message:", errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    console.log("FastAPI upload successful! Reading response...");
    const result = await response.json();
    console.log("Upload successful, backend response:", result);
    console.log("=== Upload API Route Completed Successfully ===");
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("=== CRITICAL ERROR in Upload API Route ===");
    console.error("Error type:", error?.constructor?.name);
    console.error(
      "Error message:",
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    console.error("Full error object:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to upload file",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://192.168.121.4:8080";
const OLD_BACKEND_URL = "http://192.168.121.4:6000";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const docPath = searchParams.get("path");

    if (!docPath) {
      return NextResponse.json(
        { error: "Document path is required" },
        { status: 400 }
      );
    }

    // Handle if the backend returns full URLs with old port 6000
    let documentUrl: string;
    if (docPath.startsWith("http://") || docPath.startsWith("https://")) {
      // Replace old port 6000 with correct port 8080
      documentUrl = docPath.replace(OLD_BACKEND_URL, BACKEND_URL);
    } else {
      // If it's just a path, append to backend URL
      documentUrl = `${BACKEND_URL}${
        docPath.startsWith("/") ? docPath : "/" + docPath
      }`;
    }

    // Fetch the document from the backend
    const response = await fetch(documentUrl, {
      method: "GET",
      signal: AbortSignal.timeout(30000), // 30 second timeout for documents
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch document" },
        { status: response.status }
      );
    }

    // Get the content type from the backend response
    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    const buffer = await response.arrayBuffer();

    // Return the document with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${docPath.split("/").pop()}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Document proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

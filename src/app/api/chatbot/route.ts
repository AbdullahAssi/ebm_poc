import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.CHATBOT_API_URL || "http://192.168.121.4:8080/query_response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Chatbot proxy error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to connect to chatbot",
      },
      { status: 500 }
    );
  }
}

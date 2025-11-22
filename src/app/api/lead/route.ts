import { NextRequest, NextResponse } from "next/server";

const LEAD_API_URL =
  process.env.LEAD_API_URL || "http://192.168.121.4:8080/generate_lead";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { name, email, phone, subject, message } = body;
    if (!name || !email || !phone || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const response = await fetch(LEAD_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        subject,
        message,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Lead API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      message: data.message || "Lead submitted successfully",
      data,
    });
  } catch (error) {
    console.error("Lead submission proxy error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to submit lead",
      },
      { status: 500 }
    );
  }
}

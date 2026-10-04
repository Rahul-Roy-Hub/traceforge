import { NextResponse } from "next/server";

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": process.env.CORS_ORIGIN?.trim() || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

export function optionsResponse(): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export function jsonOk(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status, headers: corsHeaders() });
}

export function jsonError(
  message: string,
  status = 400,
  extra?: Record<string, unknown>,
): NextResponse {
  return NextResponse.json(
    { error: message, ...extra },
    { status, headers: corsHeaders() },
  );
}

export function binaryResponse(
  body: Buffer,
  headers: Record<string, string>,
): NextResponse {
  return new NextResponse(new Uint8Array(body), {
    status: 200,
    headers: {
      ...corsHeaders(),
      ...headers,
    },
  });
}

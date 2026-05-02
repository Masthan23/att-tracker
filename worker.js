/**
 * Cloudflare Worker proxy for AttendPro
 *
 * Configure a secret/env variable:
 *   GAS_URL = https://script.google.com/macros/s/.../exec
 *
 * Optional:
 *   ALLOWED_ORIGIN = https://your-site.example
 */

const DEFAULT_ALLOWED_ORIGINS = [
  "https://masthan23.github.io",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://127.0.0.1:8787",
  "http://localhost:8787",
];

function getAllowedOrigin(origin, envAllowedOrigin) {
  if (!origin) {
    return DEFAULT_ALLOWED_ORIGINS[0];
  }

  const configuredOrigins = (envAllowedOrigin || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const allowedOrigins = configuredOrigins.length
    ? configuredOrigins
    : DEFAULT_ALLOWED_ORIGINS;

  return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
}

function buildCorsHeaders(origin, allowedOrigin) {
  const allowOrigin = getAllowedOrigin(origin, allowedOrigin);
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const corsHeaders = buildCorsHeaders(origin, env.ALLOWED_ORIGIN);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const gasUrl = env.GAS_URL;
    if (!gasUrl) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing GAS_URL secret" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    try {
      const incomingUrl = new URL(request.url);
      const targetUrl = new URL(gasUrl);
      targetUrl.search = incomingUrl.search;

      const init = {
        method: request.method,
        headers: {
          "Content-Type": request.headers.get("Content-Type") || "application/json",
        },
      };

      if (request.method !== "GET" && request.method !== "HEAD") {
        init.body = await request.text();
      }

      const upstream = await fetch(targetUrl.toString(), init);
      const text = await upstream.text();

      return new Response(text, {
        status: upstream.status,
        headers: {
          "Content-Type": upstream.headers.get("Content-Type") || "application/json; charset=utf-8",
          ...corsHeaders,
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Proxy request failed",
          error: String(error?.message || error),
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
  },
};

import * as admin from "firebase-admin";
import {Request, Response} from "express";
import {v4 as uuidv4} from "uuid";
import {B2bApiKey, B2bApiResponse} from "../@types";

const db = admin.firestore();

export interface B2bAuthenticatedRequest extends Request {
  apiKey: B2bApiKey;
  requestId: string;
}

export type B2bHandler = (
  req: B2bAuthenticatedRequest,
  res: Response
) => Promise<void>;

function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  requestId: string
): void {
  const response: B2bApiResponse<never> = {
    success: false,
    error: {code, message},
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
      cached: false,
      rateLimit: {remaining: 0, limit: 0, resetAt: ""},
    },
  };
  res.status(statusCode).json(response);
}

function checkPermission(permissions: string[], endpoint: string): boolean {
  return permissions.some((perm: string) => {
    if (perm === "*") return true;
    const pattern = perm.replace(/\./g, "\\.").replace(/\*/g, ".*");
    return new RegExp(`^${pattern}$`).test(endpoint);
  });
}

export function getEndpointPermission(functionName: string): string {
  const stripped = functionName.replace(/^b2b(Get|Create|Revoke)?/, "");
  const parts = stripped.replace(/([A-Z])/g, ".$1").toLowerCase().split(".");
  const filtered = parts.filter((p: string) => p.length > 0);
  if (filtered.length === 0) return "management";
  if (filtered[0] === "fpl") return `fpl.${filtered.slice(1).join("_") || "general"}`;
  if (filtered[0] === "f1") return `f1.${filtered.slice(1).join("_") || "general"}`;
  return `football.${filtered.join("_") || "general"}`;
}

export function withB2bAuth(
  handler: B2bHandler,
  functionName: string
): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response): Promise<void> => {
    const requestId = uuidv4();

    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, x-api-key");
    res.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    const apiKeyHeader = req.headers["x-api-key"];
    if (!apiKeyHeader || typeof apiKeyHeader !== "string") {
      sendError(res, 401, "MISSING_API_KEY", "x-api-key header is required", requestId);
      return;
    }

    const keyDoc = await db.collection("api-keys").doc(apiKeyHeader).get();
    if (!keyDoc.exists) {
      sendError(res, 401, "INVALID_API_KEY", "API key not found", requestId);
      return;
    }

    const apiKey = keyDoc.data() as B2bApiKey;

    if (apiKey.status !== "active") {
      sendError(res, 401, "KEY_INACTIVE", `API key is ${apiKey.status}`, requestId);
      return;
    }

    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      sendError(res, 401, "KEY_EXPIRED", "API key has expired", requestId);
      return;
    }

    const endpoint = getEndpointPermission(functionName);
    if (!checkPermission(apiKey.permissions, endpoint)) {
      sendError(res, 403, "INSUFFICIENT_PERMISSIONS", `No permission for ${endpoint}`, requestId);
      return;
    }

    // Check rate limits
    const now = new Date();
    const lastRequest = apiKey.usage.lastRequestAt ? new Date(apiKey.usage.lastRequestAt) : null;
    let currentMinute = apiKey.usage.thisMinute;
    if (lastRequest && now.getTime() - lastRequest.getTime() > 60000) currentMinute = 0;
    let currentDay = apiKey.usage.today;
    if (lastRequest && now.toISOString().slice(0, 10) !== lastRequest.toISOString().slice(0, 10)) currentDay = 0;

    const minuteResetAt = new Date(now.getTime() + 60000).toISOString();

    if (currentMinute >= apiKey.rateLimits.requestsPerMinute) {
      res.set("X-RateLimit-Remaining", "0");
      res.set("X-RateLimit-Limit", String(apiKey.rateLimits.requestsPerMinute));
      res.set("X-RateLimit-Reset", minuteResetAt);
      res.set("Retry-After", "60");
      sendError(res, 429, "RATE_LIMIT_EXCEEDED", "Rate limit exceeded", requestId);
      return;
    }

    if (currentDay >= apiKey.rateLimits.requestsPerDay) {
      const tomorrow = new Date(now);
      tomorrow.setUTCHours(24, 0, 0, 0);
      res.set("X-RateLimit-Remaining", "0");
      res.set("X-RateLimit-Limit", String(apiKey.rateLimits.requestsPerDay));
      res.set("X-RateLimit-Reset", tomorrow.toISOString());
      sendError(res, 429, "RATE_LIMIT_EXCEEDED", "Daily rate limit exceeded", requestId);
      return;
    }

    const remaining = apiKey.rateLimits.requestsPerMinute - currentMinute - 1;

    await db.collection("api-keys").doc(apiKeyHeader).update({
      "usage.today": admin.firestore.FieldValue.increment(1),
      "usage.thisMinute": admin.firestore.FieldValue.increment(1),
      "usage.lastRequestAt": now.toISOString(),
    });

    res.set("X-RateLimit-Remaining", String(remaining));
    res.set("X-RateLimit-Limit", String(apiKey.rateLimits.requestsPerMinute));
    res.set("X-RateLimit-Reset", minuteResetAt);
    res.set("X-Request-Id", requestId);

    const authenticatedReq = req as B2bAuthenticatedRequest;
    authenticatedReq.apiKey = apiKey;
    authenticatedReq.requestId = requestId;

    await handler(authenticatedReq, res);
  };
}

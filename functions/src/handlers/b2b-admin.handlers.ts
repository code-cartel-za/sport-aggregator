import {onRequest} from "firebase-functions/https";
import * as admin from "firebase-admin";
import {Request, Response} from "express";
import {v4 as uuidv4} from "uuid";
import {B2bApiKey, B2bApiResponse, B2bTier, TIER_LIMITS} from "../@types";
import {withB2bAuth, B2bAuthenticatedRequest} from "../middleware/b2b-auth.middleware";

const db = admin.firestore();
const ADMIN_SECRET = process.env["B2B_ADMIN_SECRET"] || "";

interface CreateKeyBody {
  name: string;
  email: string;
  tier: B2bTier;
  permissions: string[];
  expiresAt?: string | null;
}

interface RevokeKeyBody {
  key: string;
}

function sendAdminResponse<T>(res: Response, data: T): void {
  const response: B2bApiResponse<T> = {
    success: true,
    data,
    meta: {
      requestId: uuidv4(),
      timestamp: new Date().toISOString(),
      cached: false,
      rateLimit: {remaining: 0, limit: 0, resetAt: ""},
    },
  };
  res.json(response);
}

function sendAdminError(res: Response, statusCode: number, code: string, message: string): void {
  const response: B2bApiResponse<never> = {
    success: false,
    error: {code, message},
    meta: {
      requestId: uuidv4(),
      timestamp: new Date().toISOString(),
      cached: false,
      rateLimit: {remaining: 0, limit: 0, resetAt: ""},
    },
  };
  res.status(statusCode).json(response);
}

function validateAdminSecret(req: Request): boolean {
  const secret = req.headers["x-admin-secret"] as string | undefined;
  return !!ADMIN_SECRET && secret === ADMIN_SECRET;
}

export const b2bCreateApiKey = onRequest(async (req: Request, res: Response): Promise<void> => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type, x-admin-secret");
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (!validateAdminSecret(req)) {
    sendAdminError(res, 401, "UNAUTHORIZED", "Invalid admin secret");
    return;
  }

  const body = req.body as CreateKeyBody;
  if (!body.name || !body.email || !body.tier) {
    sendAdminError(res, 400, "MISSING_FIELDS", "name, email, and tier are required");
    return;
  }

  const validTiers: B2bTier[] = ["starter", "growth", "enterprise"];
  if (!validTiers.includes(body.tier)) {
    sendAdminError(res, 400, "INVALID_TIER", "tier must be starter, growth, or enterprise");
    return;
  }

  const key = `sk_${body.tier}_${uuidv4().replace(/-/g, "")}`;
  const apiKey: B2bApiKey = {
    key,
    name: body.name,
    email: body.email,
    tier: body.tier,
    status: "active",
    rateLimits: TIER_LIMITS[body.tier],
    usage: {today: 0, thisMinute: 0, lastRequestAt: null},
    permissions: body.permissions || ["*"],
    createdAt: new Date().toISOString(),
    expiresAt: body.expiresAt || null,
  };

  await db.collection("api-keys").doc(key).set(apiKey);
  sendAdminResponse(res, apiKey);
});

export const b2bRevokeApiKey = onRequest(async (req: Request, res: Response): Promise<void> => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type, x-admin-secret");
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (!validateAdminSecret(req)) {
    sendAdminError(res, 401, "UNAUTHORIZED", "Invalid admin secret");
    return;
  }

  const body = req.body as RevokeKeyBody;
  if (!body.key) {
    sendAdminError(res, 400, "MISSING_FIELDS", "key is required");
    return;
  }

  const docRef = db.collection("api-keys").doc(body.key);
  const snap = await docRef.get();
  if (!snap.exists) {
    sendAdminError(res, 404, "NOT_FOUND", "API key not found");
    return;
  }

  await docRef.update({status: "revoked"});
  sendAdminResponse(res, {key: body.key, status: "revoked" as const});
});

export const b2bGetApiKeyUsage = onRequest(
  withB2bAuth(async (req: B2bAuthenticatedRequest, res: Response): Promise<void> => {
    const usage = {
      key: req.apiKey.key,
      name: req.apiKey.name,
      tier: req.apiKey.tier,
      usage: req.apiKey.usage,
      rateLimits: req.apiKey.rateLimits,
      status: req.apiKey.status,
    };
    const remaining = parseInt(res.getHeader("X-RateLimit-Remaining") as string || "0", 10);
    const limit = parseInt(res.getHeader("X-RateLimit-Limit") as string || "0", 10);
    const resetAt = (res.getHeader("X-RateLimit-Reset") as string) || "";
    const response: B2bApiResponse<typeof usage> = {
      success: true,
      data: usage,
      meta: {
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
        cached: false,
        rateLimit: {remaining, limit, resetAt},
      },
    };
    res.json(response);
  }, "b2bGetApiKeyUsage")
);

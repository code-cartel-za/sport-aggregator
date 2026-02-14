import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import {handleError} from "../utils/error-handler";
import {ApiResponse, CacheDoc, CacheStatusEntry} from "../@types";

const db = admin.firestore();

export const getCacheStatus = onRequest(async (_req, res) => {
  try {
    logger.info("Fetching cache status");

    const snapshot: FirebaseFirestore.QuerySnapshot = await db
      .collection("cache")
      .get();
    const now: number = Date.now();

    const entries: CacheStatusEntry[] = snapshot.docs.map(
      (doc: FirebaseFirestore.QueryDocumentSnapshot): CacheStatusEntry => {
        const data = doc.data() as CacheDoc<unknown>;
        return {
          key: data.key,
          createdAt: new Date(data.createdAt).toISOString(),
          expiresAt: new Date(data.expiresAt).toISOString(),
          ttlMs: data.ttlMs,
          isStale: now > data.expiresAt,
          ageMs: now - data.createdAt,
        };
      }
    );

    const apiResponse: ApiResponse<{
      totalEntries: number;
      entries: CacheStatusEntry[];
    }> = {
      success: true,
      data: {totalEntries: entries.length, entries},
      timestamp: new Date().toISOString(),
    };
    res.json(apiResponse);
  } catch (error: unknown) {
    handleError(error, res);
  }
});

export const clearCache = onRequest(async (req, res) => {
  try {
    const key: string | undefined = req.query.key as string | undefined;

    if (key) {
      logger.info(`Clearing cache key: ${key}`);
      await db.collection("cache").doc(key).delete();

      const apiResponse: ApiResponse<{cleared: string}> = {
        success: true,
        data: {cleared: key},
        timestamp: new Date().toISOString(),
      };
      res.json(apiResponse);
    } else {
      logger.info("Clearing all cache entries");

      const snapshot: FirebaseFirestore.QuerySnapshot = await db
        .collection("cache")
        .get();
      const batch: FirebaseFirestore.WriteBatch = db.batch();
      let count: number = 0;

      snapshot.docs.forEach(
        (doc: FirebaseFirestore.QueryDocumentSnapshot): void => {
          batch.delete(doc.ref);
          count++;
        }
      );

      await batch.commit();

      const apiResponse: ApiResponse<{clearedCount: number}> = {
        success: true,
        data: {clearedCount: count},
        timestamp: new Date().toISOString(),
      };
      res.json(apiResponse);
    }
  } catch (error: unknown) {
    handleError(error, res);
  }
});

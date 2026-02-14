import * as admin from "firebase-admin";
import {CacheDoc} from "../@types";

export interface CacheOptions {
  ttlMs: number;
  collection?: string;
}

const db = admin.firestore();

function getCollection(options: CacheOptions): string {
  return options.collection || "cache";
}

export async function getCached<T>(
  key: string,
  options: CacheOptions
): Promise<T | null> {
  const docRef: FirebaseFirestore.DocumentReference = db
    .collection(getCollection(options))
    .doc(key);
  const snapshot: FirebaseFirestore.DocumentSnapshot = await docRef.get();

  if (!snapshot.exists) return null;

  const doc = snapshot.data() as CacheDoc<T>;
  const now: number = Date.now();

  if (now > doc.expiresAt) return null;

  return doc.data;
}

export async function setCache<T>(
  key: string,
  data: T,
  options: CacheOptions
): Promise<void> {
  const now: number = Date.now();
  const doc: CacheDoc<T> = {
    key,
    data,
    createdAt: now,
    expiresAt: now + options.ttlMs,
    ttlMs: options.ttlMs,
  };

  await db
    .collection(getCollection(options))
    .doc(key)
    .set(doc);
}

export async function getOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions
): Promise<{data: T; fromCache: boolean}> {
  const cached: T | null = await getCached<T>(key, options);
  if (cached !== null) {
    return {data: cached, fromCache: true};
  }

  const data: T = await fetcher();
  await setCache<T>(key, data, options);
  return {data, fromCache: false};
}

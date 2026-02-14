import { onRequest } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

const db = admin.firestore();

interface UserDataBundle {
  uid: string;
  exportedAt: string;
  profile: FirebaseFirestore.DocumentData | null;
  subscription: FirebaseFirestore.DocumentData | null;
  watchlist: FirebaseFirestore.DocumentData[];
  preferences: FirebaseFirestore.DocumentData | null;
  usage: FirebaseFirestore.DocumentData[];
}

async function verifyAuth(authHeader: string | undefined): Promise<string> {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }
  const token: string = authHeader.slice(7);
  const decoded: admin.auth.DecodedIdToken = await admin.auth().verifyIdToken(token);
  return decoded.uid;
}

async function getDocData(
  docRef: FirebaseFirestore.DocumentReference
): Promise<FirebaseFirestore.DocumentData | null> {
  const snap: FirebaseFirestore.DocumentSnapshot = await docRef.get();
  return snap.exists ? (snap.data() ?? null) : null;
}

async function getCollectionData(
  collectionRef: FirebaseFirestore.CollectionReference
): Promise<FirebaseFirestore.DocumentData[]> {
  const snap: FirebaseFirestore.QuerySnapshot = await collectionRef.get();
  return snap.docs.map(
    (doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
    })
  );
}

export const exportUserData = onRequest(async (req, res) => {
  try {
    const uid: string = await verifyAuth(req.headers.authorization);
    logger.info("Exporting user data", { uid });

    const userRef: FirebaseFirestore.DocumentReference = db.doc(`users/${uid}`);

    const bundle: UserDataBundle = {
      uid,
      exportedAt: new Date().toISOString(),
      profile: await getDocData(userRef),
      subscription: await getDocData(db.doc(`users/${uid}/subscription/current`)),
      watchlist: await getCollectionData(db.collection(`users/${uid}/watchlist`)),
      preferences: await getDocData(db.doc(`users/${uid}/preferences/settings`)),
      usage: await getCollectionData(db.collection(`users/${uid}/usage`)),
    };

    res.status(200).json({ success: true, data: bundle });
  } catch (err: unknown) {
    const message: string = err instanceof Error ? err.message : "Export failed";
    logger.error("Export user data failed", { error: message });
    res.status(err instanceof Error && message.includes("Authorization") ? 401 : 500)
      .json({ success: false, error: message });
  }
});

export const deleteUserData = onRequest(async (req, res) => {
  try {
    const uid: string = await verifyAuth(req.headers.authorization);
    logger.info("Deleting user data", { uid });

    const batch: FirebaseFirestore.WriteBatch = db.batch();

    // Delete subcollections
    const subcollections: string[] = ["subscription", "watchlist", "preferences", "usage"];
    for (const sub of subcollections) {
      const snap: FirebaseFirestore.QuerySnapshot = await db
        .collection(`users/${uid}/${sub}`)
        .get();
      snap.docs.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
        batch.delete(doc.ref);
      });
    }

    // Delete user doc
    batch.delete(db.doc(`users/${uid}`));
    await batch.commit();

    // Mark for auth deletion
    try {
      await admin.auth().deleteUser(uid);
      logger.info("Firebase Auth user deleted", { uid });
    } catch (authErr: unknown) {
      const authMessage: string = authErr instanceof Error ? authErr.message : "Auth deletion failed";
      logger.warn("Could not delete auth user, may need manual cleanup", { uid, error: authMessage });
    }

    res.status(200).json({ success: true, message: "All user data deleted" });
  } catch (err: unknown) {
    const message: string = err instanceof Error ? err.message : "Deletion failed";
    logger.error("Delete user data failed", { error: message });
    res.status(err instanceof Error && message.includes("Authorization") ? 401 : 500)
      .json({ success: false, error: message });
  }
});

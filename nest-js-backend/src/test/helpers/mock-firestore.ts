/**
 * In-memory Firestore mock for unit tests.
 * Supports: collection().doc().get(), collection().doc().set(), collection().doc().update(),
 * collection().where().orderBy().get(), collection().get()
 */

interface MockDocSnapshot {
  exists: boolean;
  data: () => Record<string, unknown> | undefined;
  id: string;
}

interface WhereClause {
  field: string;
  op: string;
  value: unknown;
}

type CollectionData = Record<string, Record<string, unknown>>;

export function createMockFirestore(
  initialData: Record<string, CollectionData> = {},
): Record<string, unknown> {
  const store: Record<string, CollectionData> = {};

  // Deep copy initial data
  for (const [col, docs] of Object.entries(initialData)) {
    store[col] = {};
    for (const [docId, docData] of Object.entries(docs)) {
      store[col][docId] = { ...docData };
    }
  }

  function getOrCreateCollection(name: string): CollectionData {
    if (!store[name]) store[name] = {};
    return store[name];
  }

  function matchesWhere(doc: Record<string, unknown>, clauses: WhereClause[]): boolean {
    return clauses.every(({ field, op, value }) => {
      const docVal = doc[field];
      switch (op) {
        case '==': return docVal === value;
        case '!=': return docVal !== value;
        case '>=': return typeof docVal === 'string' && typeof value === 'string' ? docVal >= value : Number(docVal) >= Number(value);
        case '<=': return typeof docVal === 'string' && typeof value === 'string' ? docVal <= value : Number(docVal) <= Number(value);
        case '>': return typeof docVal === 'string' && typeof value === 'string' ? docVal > value : Number(docVal) > Number(value);
        case '<': return typeof docVal === 'string' && typeof value === 'string' ? docVal < value : Number(docVal) < Number(value);
        case 'in': return Array.isArray(value) && value.includes(docVal);
        default: return false;
      }
    });
  }

  function createQueryBuilder(collectionName: string, subcollectionPath?: string[]): Record<string, unknown> {
    const whereClauses: WhereClause[] = [];

    const resolveCollection = (): CollectionData => {
      if (subcollectionPath && subcollectionPath.length >= 2) {
        const fullPath = [collectionName, ...subcollectionPath].join('/');
        return getOrCreateCollection(fullPath);
      }
      return getOrCreateCollection(collectionName);
    };

    const queryObj: Record<string, unknown> = {
      where: (field: string, op: string, value: unknown) => {
        whereClauses.push({ field, op, value });
        return queryObj;
      },
      orderBy: () => queryObj,
      limit: () => queryObj,
      get: async (): Promise<{ docs: MockDocSnapshot[]; empty: boolean }> => {
        const col = resolveCollection();
        const docs = Object.entries(col)
          .filter(([, data]) => matchesWhere(data, whereClauses))
          .map(([id, data]): MockDocSnapshot => ({
            exists: true,
            data: () => ({ ...data }),
            id,
          }));
        return { docs, empty: docs.length === 0 };
      },
      doc: (docId: string) => createDocRef(collectionName, docId, subcollectionPath),
    };

    return queryObj;
  }

  function createDocRef(
    collectionName: string,
    docId: string,
    parentSubcollectionPath?: string[],
  ): Record<string, unknown> {
    const fullCollectionPath = parentSubcollectionPath
      ? [collectionName, ...parentSubcollectionPath].join('/')
      : collectionName;

    return {
      get: async (): Promise<MockDocSnapshot> => {
        const col = getOrCreateCollection(fullCollectionPath);
        const data = col[docId];
        return {
          exists: !!data,
          data: () => (data ? { ...data } : undefined),
          id: docId,
        };
      },
      set: async (data: Record<string, unknown>, options?: { merge?: boolean }) => {
        const col = getOrCreateCollection(fullCollectionPath);
        if (options?.merge && col[docId]) {
          col[docId] = { ...col[docId], ...data };
        } else {
          col[docId] = { ...data };
        }
      },
      update: async (data: Record<string, unknown>) => {
        const col = getOrCreateCollection(fullCollectionPath);
        if (col[docId]) {
          col[docId] = { ...col[docId], ...data };
        }
      },
      collection: (subName: string) => {
        const subPath = parentSubcollectionPath
          ? [...parentSubcollectionPath, docId, subName]
          : [docId, subName];
        return createQueryBuilder(collectionName, subPath);
      },
    };
  }

  return {
    collection: (name: string) => createQueryBuilder(name),
    _store: store, // exposed for test assertions
  };
}

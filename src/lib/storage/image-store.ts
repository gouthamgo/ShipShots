'use client';

const DB_NAME = 'screenforge-assets';
const STORE_NAME = 'screenshots';
const DB_VERSION = 1;

interface ScreenshotRecord {
  id: string;
  imageData: string;
  updatedAt: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function hasIndexedDb(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

function openDb(): Promise<IDBDatabase> {
  if (!hasIndexedDb()) {
    return Promise.reject(new Error('IndexedDB is unavailable'));
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
  });

  return dbPromise;
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const request = fn(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
  });
}

export async function saveScreenshotImage(id: string, imageData: string): Promise<void> {
  if (!hasIndexedDb()) return;

  const record: ScreenshotRecord = {
    id,
    imageData,
    updatedAt: Date.now(),
  };

  await withStore('readwrite', (store) => store.put(record));
}

export async function getScreenshotImage(id: string): Promise<string | null> {
  if (!hasIndexedDb()) return null;

  const record = await withStore<ScreenshotRecord | undefined>('readonly', (store) => store.get(id));
  return record?.imageData ?? null;
}

export async function deleteScreenshotImage(id: string): Promise<void> {
  if (!hasIndexedDb()) return;
  await withStore('readwrite', (store) => store.delete(id));
}

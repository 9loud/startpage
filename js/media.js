/**
 * Artwork storage.
 *
 * Uploaded images and GIFs are much larger than localStorage allows, so they
 * live in IndexedDB as Blobs. The rest of the app only ever sees an object URL,
 * created and revoked by js/main.js.
 */

const DB_NAME = 'startpage.media';
const STORE_NAME = 'assets';
const HERO_KEY = 'hero';

/** @type {Promise<IDBDatabase> | null} */
let connection = null;

function openDatabase() {
  if (!('indexedDB' in window)) {
    return Promise.reject(new Error('This browser does not support IndexedDB.'));
  }
  if (!connection) {
    connection = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(request.error ?? new Error('Could not open artwork storage.'));
    });
  }
  return connection;
}

/**
 * @param {IDBMode} mode
 * @param {(store: IDBObjectStore) => IDBRequest} run
 */
async function withStore(mode, run) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const request = run(transaction.objectStore(STORE_NAME));
    transaction.oncomplete = () => resolve(request.result);
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('Artwork storage failed.'));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error('Artwork storage was cancelled.'));
  });
}

/** @param {Blob} blob */
export function saveHeroImage(blob) {
  return withStore('readwrite', (store) => store.put(blob, HERO_KEY));
}

/** @returns {Promise<Blob | null>} */
export async function loadHeroImage() {
  try {
    const value = await withStore('readonly', (store) => store.get(HERO_KEY));
    return value instanceof Blob ? value : null;
  } catch {
    return null;
  }
}

export async function clearHeroImage() {
  try {
    await withStore('readwrite', (store) => store.delete(HERO_KEY));
  } catch {
    /* nothing to clear */
  }
}

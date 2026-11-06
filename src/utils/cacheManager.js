const DB_NAME = "taxa_identifair_db";
const STORE_NAME = "identification_cache";
const DB_VERSION = 1;

// Helper per verificare l'effettiva disponibilità di IndexedDB
function isIndexedDBSupported() {
  try {
    return typeof window !== "undefined" && "indexedDB" in window && window.indexedDB !== null;
  } catch (e) {
    return false;
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBSupported()) {
      return reject(new Error("IndexedDB non supportato"));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const cacheManager = {
  async get(key) {
    // 1. Prova IndexedDB
    if (isIndexedDBSupported()) {
      try {
        const db = await openDB();
        const data = await new Promise((resolve) => {
          const tx = db.transaction(STORE_NAME, "readonly");
          const store = tx.objectStore(STORE_NAME);
          const req = store.get(key);
          req.onsuccess = () => resolve(req.result ?? null);
          req.onerror = () => resolve(null);
        });
        if (data !== null) return data;
      } catch (e) {
        console.warn("IndexedDB fallito, provo localStorage...", e);
      }
    }

    // 2. Fallback su localStorage
    try {
      const raw = localStorage.getItem(`taxa_${key}`);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn("localStorage get fallito", e);
      return null;
    }
  },

  async set(key, value) {
    // 1. Prova IndexedDB
    if (isIndexedDBSupported()) {
      try {
        const db = await openDB();
        await new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);
          const req = store.put(value, key);
          req.onsuccess = () => resolve(true);
          req.onerror = () => reject(req.error);
        });
        return;
      } catch (e) {
        console.warn("IndexedDB set fallito, provo localStorage...", e);
      }
    }

    // 2. Fallback su localStorage
    try {
      localStorage.setItem(`taxa_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn("localStorage set fallito", e);
    }
  }
};

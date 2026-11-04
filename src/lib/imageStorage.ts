/**
 * curator_images - IndexedDB storage for offline reference images
 * Zero-dependency native IndexedDB abstraction for storing and retrieving high-res image Blobs.
 */

const DB_NAME = 'curator_db';
const DB_VERSION = 1;
const STORE_NAME = 'curator_images';

interface StoredImageRecord {
  id: string;
  blob: Blob;
  mimeType: string;
  createdAt: string;
}

// In-memory cache for Object URLs to prevent repeated URL.createObjectURL calls
const objectUrlCache = new Map<string, string>();

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB não está disponível neste navegador.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Erro ao inicializar banco de imagens local.'));
    };
  });

  return dbPromise;
}

/**
 * Persists an image Blob into IndexedDB and registers an Object URL in cache.
 */
export async function saveImageBlob(id: string, fileOrBlob: Blob): Promise<string> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const record: StoredImageRecord = {
      id,
      blob: fileOrBlob,
      mimeType: fileOrBlob.type || 'image/png',
      createdAt: new Date().toISOString(),
    };

    const request = store.put(record);

    request.onsuccess = () => {
      // Revoke any previous url for this id
      const prevUrl = objectUrlCache.get(id);
      if (prevUrl) URL.revokeObjectURL(prevUrl);

      const objectUrl = URL.createObjectURL(fileOrBlob);
      objectUrlCache.set(id, objectUrl);
      resolve(objectUrl);
    };

    request.onerror = () => {
      reject(request.error || new Error('Falha ao salvar imagem no IndexedDB.'));
    };
  });
}

/**
 * Retrieves the raw Blob for a given image id.
 */
export async function getImageBlob(id: string): Promise<Blob | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      const record = request.result as StoredImageRecord | undefined;
      resolve(record ? record.blob : null);
    };

    request.onerror = () => {
      reject(request.error || new Error('Falha ao obter imagem do IndexedDB.'));
    };
  });
}

/**
 * Returns an active object URL for an image id.
 * Returns from memory cache if available, or fetches from IndexedDB.
 */
export async function getImageUrl(id: string): Promise<string | null> {
  if (objectUrlCache.has(id)) {
    return objectUrlCache.get(id)!;
  }

  const blob = await getImageBlob(id);
  if (!blob) return null;

  const url = URL.createObjectURL(blob);
  objectUrlCache.set(id, url);
  return url;
}

/**
 * Deletes an image from IndexedDB and revokes object URL.
 */
export async function deleteImageBlob(id: string): Promise<void> {
  const prevUrl = objectUrlCache.get(id);
  if (prevUrl) {
    URL.revokeObjectURL(prevUrl);
    objectUrlCache.delete(id);
  }

  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error || new Error('Falha ao remover imagem.'));
  });
}

/**
 * Hydrates an array of reference image IDs on app launch.
 * Returns a map of imageStorageId -> objectUrl.
 */
export async function hydrateImageStorage(
  storageIds: string[]
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  if (!storageIds || storageIds.length === 0) return result;

  try {
    const db = await getDB();
    await Promise.all(
      storageIds.map((id) => {
        return new Promise<void>((resolve) => {
          if (objectUrlCache.has(id)) {
            result[id] = objectUrlCache.get(id)!;
            resolve();
            return;
          }

          const transaction = db.transaction(STORE_NAME, 'readonly');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.get(id);

          request.onsuccess = () => {
            const record = request.result as StoredImageRecord | undefined;
            if (record && record.blob) {
              const url = URL.createObjectURL(record.blob);
              objectUrlCache.set(id, url);
              result[id] = url;
            }
            resolve();
          };

          request.onerror = () => {
            // Non-fatal: if one image fails to load, don't break others
            resolve();
          };
        });
      })
    );
  } catch (err) {
    console.warn('Erro ao restaurar imagens locais do IndexedDB:', err);
  }

  return result;
}

/**
 * Reads a File/Blob and converts it to an optimized, lightweight Data URL.
 * Automatically downsamples images larger than maxDimension to keep database payload small.
 */
export async function readFileAsOptimizedDataUrl(
  file: File | Blob,
  maxDimension = 1600,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve) => {
    // If not in a browser environment or file is SVG / GIF, read as plain data URL
    if (typeof window === 'undefined' || file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    // If already under 350KB, preserve original bytes
    if (file.size > 0 && file.size < 350 * 1024) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width <= maxDimension && height <= maxDimension && file.size < 500 * 1024) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
        return;
      }

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      try {
        const webp = canvas.toDataURL('image/webp', quality);
        if (webp.startsWith('data:image/webp')) {
          resolve(webp);
          return;
        }
      } catch {}

      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}

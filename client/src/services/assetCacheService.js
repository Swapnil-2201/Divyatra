/**
 * @file assetCacheService.js
 * @description High-performance client-side Cache API service for 3D GLB models and textures.
 * Stores binary assets in the browser Cache API for instantaneous (<40ms) subsequent loads.
 */

const CACHE_NAME = 'divyatra-3d-cache-v1.0';

class AssetCacheService {
  constructor() {
    this.cacheAvailable = typeof window !== 'undefined' && 'caches' in window;
    this.activeBlobUrls = new Set();
  }

  /**
   * Retrieves a binary asset from cache or downloads and caches it.
   * @param {string} url - Target URL of the 3D model asset
   * @param {function} [onProgress] - Optional progress callback ({ loaded, total, percent })
   * @returns {Promise<{ blobUrl: string, fromCache: boolean, size: number }>}
   */
  async fetchWithCache(url, onProgress) {
    if (!this.cacheAvailable) {
      return { blobUrl: url, fromCache: false, size: 0 };
    }

    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(url);

      if (cachedResponse) {
        const blob = await cachedResponse.blob();
        const blobUrl = URL.createObjectURL(blob);
        this.activeBlobUrls.add(blobUrl);
        if (onProgress) onProgress({ loaded: blob.size, total: blob.size, percent: 100 });
        return { blobUrl, fromCache: true, size: blob.size };
      }

      // Cache miss: Stream download and capture progress
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch 3D asset ${url}: HTTP ${response.status}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;

      // Clone response for cache storage
      const responseToCache = response.clone();

      let blob;
      if (response.body && total > 0 && onProgress) {
        const reader = response.body.getReader();
        let loaded = 0;
        const chunks = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          loaded += value.length;
          const percent = total > 0 ? Math.round((loaded / total) * 100) : 0;
          onProgress({ loaded, total, percent });
        }

        blob = new Blob(chunks, { type: response.headers.get('content-type') || 'model/gltf-binary' });
      } else {
        blob = await response.blob();
        if (onProgress) onProgress({ loaded: blob.size, total: blob.size, percent: 100 });
      }

      // Store in browser Cache API asynchronously without blocking execution
      cache.put(url, responseToCache).catch((err) => {
        console.warn('[AssetCache] Cache write error:', err);
      });

      const blobUrl = URL.createObjectURL(blob);
      this.activeBlobUrls.add(blobUrl);
      return { blobUrl, fromCache: false, size: blob.size };
    } catch (err) {
      console.warn('[AssetCache] Falling back to direct URL due to:', err);
      return { blobUrl: url, fromCache: false, size: 0 };
    }
  }

  /**
   * Intelligently preloads an asset when the browser is idle
   * @param {string} url - Target asset URL
   */
  preloadWhenIdle(url) {
    if (!this.cacheAvailable || !url) return;

    const doPreload = () => {
      this.fetchWithCache(url).catch(() => {
        // Silently catch background preload errors
      });
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => doPreload(), { timeout: 4000 });
    } else {
      setTimeout(doPreload, 1500);
    }
  }

  /**
   * Revokes an allocated blob URL to prevent browser memory leaks
   * @param {string} blobUrl
   */
  revokeBlobUrl(blobUrl) {
    if (blobUrl && blobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(blobUrl);
      this.activeBlobUrls.delete(blobUrl);
    }
  }

  /**
   * Cleans up all currently allocated blob URLs
   */
  disposeAllBlobUrls() {
    for (const url of this.activeBlobUrls) {
      URL.revokeObjectURL(url);
    }
    this.activeBlobUrls.clear();
  }

  /**
   * Clears old cache data
   */
  async clearCache() {
    if (!this.cacheAvailable) return;
    try {
      await caches.delete(CACHE_NAME);
    } catch (e) {
      console.warn('[AssetCache] Cache clear notice:', e);
    }
  }
}

export const assetCacheService = new AssetCacheService();
export default assetCacheService;

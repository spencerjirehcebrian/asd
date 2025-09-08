import { CacheEntry, CacheConfig, ServicesConfig } from '../types';

// Default cache configuration
const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttl: 4 * 60 * 60 * 1000, // 4 hours in milliseconds
  key: 'asd_services_cache',
  enableSessionStorage: true,
  enableMemoryCache: true,
};

// In-memory cache for current session
let memoryCache: CacheEntry | null = null;

export class CacheManager {
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
  }

  /**
   * Check if cache entry is still valid
   */
  private isValidCache(entry: CacheEntry): boolean {
    const now = Date.now();
    return (now - entry.timestamp) < entry.ttl;
  }

  /**
   * Get cached data from memory cache (fastest)
   */
  private getFromMemory(): CacheEntry | null {
    if (!this.config.enableMemoryCache || !memoryCache) {
      return null;
    }

    if (this.isValidCache(memoryCache)) {
      return memoryCache;
    }

    // Clear invalid memory cache
    memoryCache = null;
    return null;
  }

  /**
   * Get cached data from localStorage
   */
  private getFromLocalStorage(): CacheEntry | null {
    try {
      const cached = localStorage.getItem(this.config.key);
      if (!cached) return null;

      const entry: CacheEntry = JSON.parse(cached);
      
      if (this.isValidCache(entry)) {
        // Update memory cache
        if (this.config.enableMemoryCache) {
          memoryCache = entry;
        }
        return entry;
      }

      // Clear invalid cache
      localStorage.removeItem(this.config.key);
      return null;
    } catch (error) {
      console.warn('Failed to read from localStorage cache:', error);
      return null;
    }
  }

  /**
   * Get cached data from sessionStorage (fallback)
   */
  private getFromSessionStorage(): CacheEntry | null {
    if (!this.config.enableSessionStorage) return null;

    try {
      const cached = sessionStorage.getItem(this.config.key);
      if (!cached) return null;

      const entry: CacheEntry = JSON.parse(cached);
      
      if (this.isValidCache(entry)) {
        return entry;
      }

      // Clear invalid cache
      sessionStorage.removeItem(this.config.key);
      return null;
    } catch (error) {
      console.warn('Failed to read from sessionStorage cache:', error);
      return null;
    }
  }

  /**
   * Get cached data from any available cache layer
   */
  public get(): CacheEntry | null {
    // Try memory cache first (fastest)
    const memoryData = this.getFromMemory();
    if (memoryData) {
      return memoryData;
    }

    // Try localStorage (persists across browser restarts)
    const localStorageData = this.getFromLocalStorage();
    if (localStorageData) {
      return localStorageData;
    }

    // Try sessionStorage (fallback)
    const sessionStorageData = this.getFromSessionStorage();
    if (sessionStorageData) {
      return sessionStorageData;
    }

    return null;
  }

  /**
   * Set data in all enabled cache layers
   */
  public set(data: ServicesConfig, source: CacheEntry['source'], etag?: string): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      etag,
      source,
      ttl: this.config.ttl,
    };

    // Store in memory cache
    if (this.config.enableMemoryCache) {
      memoryCache = entry;
    }

    // Store in localStorage
    try {
      localStorage.setItem(this.config.key, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to save to localStorage cache:', error);
    }

    // Store in sessionStorage
    if (this.config.enableSessionStorage) {
      try {
        sessionStorage.setItem(this.config.key, JSON.stringify(entry));
      } catch (error) {
        console.warn('Failed to save to sessionStorage cache:', error);
      }
    }
  }

  /**
   * Clear all cache layers
   */
  public clear(): void {
    // Clear memory cache
    memoryCache = null;

    // Clear localStorage
    try {
      localStorage.removeItem(this.config.key);
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error);
    }

    // Clear sessionStorage
    try {
      sessionStorage.removeItem(this.config.key);
    } catch (error) {
      console.warn('Failed to clear sessionStorage cache:', error);
    }
  }

  /**
   * Check if cache is close to expiring (within 30 minutes)
   */
  public isNearExpiry(): boolean {
    const cached = this.get();
    if (!cached) return false;

    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000;
    const timeUntilExpiry = (cached.timestamp + cached.ttl) - now;
    
    return timeUntilExpiry <= thirtyMinutes;
  }

  /**
   * Get cache statistics for debugging
   */
  public getStats(): {
    hasMemoryCache: boolean;
    hasLocalStorageCache: boolean;
    hasSessionStorageCache: boolean;
    cacheAge?: number;
    source?: string;
    etag?: string;
  } {
    const cached = this.get();
    
    return {
      hasMemoryCache: memoryCache !== null && this.isValidCache(memoryCache),
      hasLocalStorageCache: this.getFromLocalStorage() !== null,
      hasSessionStorageCache: this.getFromSessionStorage() !== null,
      cacheAge: cached ? Date.now() - cached.timestamp : undefined,
      source: cached?.source,
      etag: cached?.etag,
    };
  }
}

// Export default cache manager instance
export const cacheManager = new CacheManager();
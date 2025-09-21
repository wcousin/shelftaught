interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class Cache {
  private storage: Map<string, CacheItem<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes default

  set<T>(key: string, data: T, ttl?: number): void {
    const expiry = ttl || this.defaultTTL;
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + expiry
    };
    
    this.storage.set(key, item);
  }

  get<T>(key: string): T | null {
    const item = this.storage.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expiry) {
      this.storage.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.storage.get(key);
    
    if (!item) {
      return false;
    }
    
    if (Date.now() > item.expiry) {
      this.storage.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.storage.entries()) {
      if (now > item.expiry) {
        this.storage.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.storage.size,
      keys: Array.from(this.storage.keys())
    };
  }
}

// Create a singleton instance
export const cache = new Cache();

// Set up periodic cleanup (every 10 minutes)
setInterval(() => {
  cache.cleanup();
}, 10 * 60 * 1000);

export default cache;
import { CacheEntry, QueryCacheType } from "./types";

export class QueryCache implements QueryCacheType {
  private queries: Map<string, CacheEntry> = new Map();
  private isMounted = false;

  public get(key: string): CacheEntry | null {
    const entry = this.queries.get(key);
    return entry?.mounted ? entry : null;
  }

  public build(key: string, value: CacheEntry) {
    if (!key || typeof key !== 'string') {
      throw new Error('Invalid cache key');
    }
    if (!value || typeof value !== 'object') {
      throw new Error('Invalid cache value');
    }

    this.queries.set(key, value);
    if (this.isMounted) {
      value.mounted = true;
    }
  }

  public remove(key: string): boolean {
    return this.queries.delete(key);
  }

  public clear() {
    this.queries.clear();
  }

  public getAll() {
    return new Map(this.queries);
  }

  public size(): number {
    return this.queries.size;
  }

  public mount() {
    if (!this.isMounted) {
      this.isMounted = true;
      this.queries.forEach(entry => {
        entry.mounted = true;
      });
    }
  }

  public unmount() {
    if (this.isMounted) {
      this.isMounted = false;
      this.queries.forEach(entry => {
        entry.mounted = false;
      });
    }
  }
}

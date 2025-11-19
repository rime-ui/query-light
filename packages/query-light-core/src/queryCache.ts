import { CacheEntry, QueryCacheType } from "./types.js";

export class QueryCache implements QueryCacheType {
  private queries: Map<string, CacheEntry<unknown>> = new Map();
  private isMounted = false;
  private subscribers: Map<string, Set<(entry: CacheEntry<any> | null) => void>> = new Map();

  private notify(key: string, entry: CacheEntry<any> | null) {
    const listeners = this.subscribers.get(key);
    if (!listeners || !listeners.size) return;
    listeners.forEach((listener) => listener(entry));
  }

  public get<T = unknown>(key: string): CacheEntry<T> | null {
    const entry = this.queries.get(key) as CacheEntry<T> | undefined;
    return entry?.mounted ? entry : null;
  }

  public build<T = unknown>(key: string, value: CacheEntry<T>): void {
    if (!key || typeof key !== "string") {
      throw new Error("Invalid cache key");
    }
    if (!value || typeof value !== "object") {
      throw new Error("Invalid cache value");
    }

    const stored = value as unknown as CacheEntry<unknown>;
    if (this.isMounted) {
      stored.mounted = true;
    }

    this.queries.set(key, stored);
    this.notify(key, value as CacheEntry<any>);
  }

  public remove(key: string): boolean {
    const existed = this.queries.delete(key);
    if (existed) {
      this.notify(key, null);
    }
    return existed;
  }

  public clear(): void {
    this.queries.forEach((_, key) => {
      this.notify(key, null);
    });
    this.queries.clear();
  }

  public getAll(): Map<string, CacheEntry<unknown>> {
    return new Map(this.queries);
  }

  public size(): number {
    return this.queries.size;
  }

  public mount(): void {
    if (!this.isMounted) {
      this.isMounted = true;
      this.queries.forEach((entry, key) => {
        entry.mounted = true;
        this.notify(key, entry as CacheEntry<any>);
      });
    }
  }

  public unmount(): void {
    if (this.isMounted) {
      this.isMounted = false;
      this.queries.forEach((entry, key) => {
        entry.mounted = false;
        this.notify(key, null);
      });
    }
  }

  public subscribe<T = unknown>(
    key: string,
    listener: (entry: CacheEntry<T> | null) => void,
  ): () => void {
    const wrapped = listener as (entry: CacheEntry<any> | null) => void;
    let listeners = this.subscribers.get(key);
    if (!listeners) {
      listeners = new Set();
      this.subscribers.set(key, listeners);
    }

    listeners.add(wrapped);

    const current = this.get<T>(key);
    if (current) {
      listener(current);
    }

    return () => {
      const active = this.subscribers.get(key);
      if (!active) return;
      active.delete(wrapped);
      if (!active.size) {
        this.subscribers.delete(key);
      }
    };
  }
}

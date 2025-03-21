/* eslint-disable @typescript-eslint/no-explicit-any */


export class QueryCache implements QueryCacheType {
    private queries: Map<string, CacheEntry> = new Map();

    public get(key: string): CacheEntry | null {
        return this.queries.get(key) || null;
    }

    public build(key: string, value: CacheEntry) {
        this.queries.set(key, value);
    }

    public remove(key: string) {
        const entry = this.queries.get(key);
        if (entry) {
            this.queries.delete(key);
        }
    }

    public clear() {
        this.queries.clear();
    }

    public getAll() {
        console.log(this.queries)
    }
}
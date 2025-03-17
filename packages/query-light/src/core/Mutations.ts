

interface MutationsType {
    get(key: string): any
    set(key: string, value: any): void
    remove(key: string): void
    clear(): void
}


class Mutations implements MutationsType {
    private mutations = new Map<string, any>()
    public get(key: string) {
        return this.mutations.get(key)
    }
    public set(key: string, value: any) {
        this.mutations.set(key, value)
    }

    public remove(key: string) {
        this.mutations.delete(key)
    }

    public clear() {
        this.mutations.clear()
    }
}
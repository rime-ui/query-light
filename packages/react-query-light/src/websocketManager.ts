export type WebSocketStatus = "connecting" | "open" | "closed" | "reconnecting" | "error";

type MessageHandler = (event: MessageEvent) => void;

interface WebSocketOptions {
    retry: number;
    retryDelay: number;
}

interface WebSocketRecord {
    url: string;
    socket: WebSocket | null;
    handlers: Set<MessageHandler>;
    retry: number;
    retryDelay: number;
    retries: number;
}

class WebSocketManager {
    private records = new Map<string, WebSocketRecord>();

    subscribe(url: string, handler: MessageHandler, options?: Partial<WebSocketOptions>): () => void {
        const record = this.getOrCreateRecord(url, options);
        record.handlers.add(handler);

        if (!record.socket) {
            this.connect(record);
        }

        return () => {
            const current = this.records.get(url);
            if (!current) return;

            current.handlers.delete(handler);
            if (!current.handlers.size) {
                if (current.socket) {
                    current.socket.close();
                }
                this.records.delete(url);
            }
        };
    }

    private getOrCreateRecord(url: string, options?: Partial<WebSocketOptions>): WebSocketRecord {
        const existing = this.records.get(url);
        if (existing) {
            if (options?.retry !== undefined) {
                existing.retry = options.retry;
            }
            if (options?.retryDelay !== undefined) {
                existing.retryDelay = options.retryDelay;
            }
            return existing;
        }

        const record: WebSocketRecord = {
            url,
            socket: null,
            handlers: new Set(),
            retry: options?.retry ?? 3,
            retryDelay: options?.retryDelay ?? 2000,
            retries: 0,
        };

        this.records.set(url, record);
        return record;
    }

    private connect(record: WebSocketRecord) {
        const socket = new WebSocket(record.url);
        record.socket = socket;

        socket.onopen = () => {
            record.retries = 0;
        };

        socket.onmessage = (event) => {
            record.handlers.forEach((handler) => handler(event));
        };

        socket.onerror = () => {
        };

        socket.onclose = () => {
            record.socket = null;

            if (!record.handlers.size) {
                this.records.delete(record.url);
                return;
            }

            if (record.retries < record.retry) {
                record.retries += 1;
                const delay = record.retryDelay * record.retries;

                setTimeout(() => {
                    if (!record.handlers.size) {
                        this.records.delete(record.url);
                        return;
                    }
                    this.connect(record);
                }, delay);
            } else {
                this.records.delete(record.url);
            }
        };
    }
}

let defaultManager: WebSocketManager | null = null;

export function getWebSocketManager(): WebSocketManager {
    if (!defaultManager) {
        defaultManager = new WebSocketManager();
    }
    return defaultManager;
}



interface RetryerOptions {
    error: any;
    retry: number;
    retries: number;
    set: (value: any) => void;
    handler: () => void;
    retryDelay: number;
    retryIntervalId: NodeJS.Timeout | null
}


export function initRetryer({ error, handler, retries, retry, set, retryDelay, retryIntervalId }: RetryerOptions) {
    if (error && retry > 0 && retries < retry) {
        if (retryIntervalId) {
            retryIntervalId = setInterval(() => {
                handler();
                set((prev: number) => prev + 1);
            }, retryDelay);
        }
    } else if (retries >= retry && retryIntervalId) {
        clearInterval(retryIntervalId);
    }
}
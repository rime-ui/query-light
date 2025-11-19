export type QueryStatus = "idle" | "loading" | "success" | "error";

export interface QueryState<T> {
    status: QueryStatus;
    data: T | null;
    error: unknown;
}

export type QueryEvent<T> =
    | { type: "FETCH" }
    | { type: "RESOLVE"; data: T }
    | { type: "MERGE"; updater: (previous: T | null) => T }
    | { type: "REJECT"; error: unknown }
    | { type: "RESET"; initialData: T | null }
    | { type: "INVALIDATE"; initialData: T | null };

export function createInitialQueryState<T>(initialData: T | null, enabled: boolean): QueryState<T> {
    return {
        status: enabled ? "loading" : "idle",
        data: initialData,
        error: null,
    };
}

export function queryReducer<T>(state: QueryState<T>, event: QueryEvent<T>): QueryState<T> {
    switch (event.type) {
        case "FETCH": {
            return {
                ...state,
                status: "loading",
                error: null,
            };
        }
        case "RESOLVE": {
            return {
                status: "success",
                data: event.data,
                error: null,
            };
        }
        case "MERGE": {
            return {
                status: "success",
                data: event.updater(state.data),
                error: null,
            };
        }
        case "REJECT": {
            return {
                ...state,
                status: "error",
                error: event.error,
            };
        }
        case "RESET":
        case "INVALIDATE": {
            return {
                status: "idle",
                data: event.initialData,
                error: null,
            };
        }
        default: {
            return state;
        }
    }
}

export type MutationStatus = "idle" | "loading" | "success" | "error";

export interface MutationState<T> {
    status: MutationStatus;
    data: T | null;
    error: unknown;
}

export type MutationEvent<T> =
    | { type: "EXECUTE" }
    | { type: "RESOLVE"; data: T }
    | { type: "REJECT"; error: unknown }
    | { type: "RESET" };

export function createInitialMutationState<T>(): MutationState<T> {
    return {
        status: "idle",
        data: null,
        error: null,
    };
}

export function mutationReducer<T>(state: MutationState<T>, event: MutationEvent<T>): MutationState<T> {
    switch (event.type) {
        case "EXECUTE": {
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
        case "REJECT": {
            return {
                ...state,
                status: "error",
                error: event.error,
            };
        }
        case "RESET": {
            return {
                status: "idle",
                data: null,
                error: null,
            };
        }
        default: {
            return state;
        }
    }
}

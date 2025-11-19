import { useCallback, useReducer } from "react";
import {
    createInitialMutationState,
    mutationReducer,
    type MutationStatus,
} from "./mutationStateMachine";

interface UseMutationOptions<TData, TVariables> {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: unknown, variables: TVariables) => void;
}

interface UseMutationLightReturn<TData, TVariables> {
    data: TData | null;
    error: unknown;
    status: MutationStatus;
    isLoading: boolean;
    isError: boolean;
    mutate: (variables: TVariables) => void;
    mutateAsync: (variables: TVariables) => Promise<TData>;
    reset: () => void;
}

export function useMutationLight<TMutationFn extends (variables: any) => Promise<any>,>(
    mutationFn: TMutationFn,
    options?: UseMutationOptions<
        Awaited<ReturnType<TMutationFn>>,
        Parameters<TMutationFn>[0]
    >,
): UseMutationLightReturn<
    Awaited<ReturnType<TMutationFn>>,
    Parameters<TMutationFn>[0]
> {
    type TData = Awaited<ReturnType<TMutationFn>>;
    type TVariables = Parameters<TMutationFn>[0];

    const [state, dispatch] = useReducer(
        mutationReducer<TData>,
        undefined,
        () => createInitialMutationState<TData>(),
    );

    const { data, error, status } = state;
    const isLoading = status === "loading";
    const isError = status === "error";

    const mutateAsync = useCallback(
        async (variables: TVariables): Promise<TData> => {
            dispatch({ type: "EXECUTE" });
            try {
                const result = (await mutationFn(variables)) as TData;
                dispatch({ type: "RESOLVE", data: result });
                options?.onSuccess?.(result, variables);
                return result;
            } catch (err) {
                dispatch({ type: "REJECT", error: err });
                options?.onError?.(err, variables);
                throw err;
            }
        },
        [mutationFn, options],
    );

    const mutate = useCallback(
        (variables: TVariables) => {
            void mutateAsync(variables);
        },
        [mutateAsync],
    );

    const reset = useCallback(() => {
        dispatch({ type: "RESET" });
    }, []);

    return {
        data,
        error,
        status,
        isLoading,
        isError,
        mutate,
        mutateAsync,
        reset,
    };
}

import { print, type DocumentNode } from "graphql";

export interface GraphQLRequestOptions {
  endpoint: string;
  headers?: Record<string, string>;
  fetchFn?: typeof fetch;
}

// Local copy of the TypedDocumentNode shape used by GraphQL Code Generator.
// This allows Query Light to work with generated documents without depending
// directly on a specific typed-document implementation.
export interface TypedDocumentNode<
  TData = { [key: string]: any },
  TVariables = Record<string, unknown>,
> extends DocumentNode {
  /** Type marker for the result shape */
  __resultType?: TData;
  /** Type marker for the variables shape */
  __variablesType?: TVariables;
}

interface GraphQLResponse<TData> {
  data?: TData;
  errors?: { message: string }[];
}

export function createGraphQLQuery<TData, TVariables = Record<string, unknown>>(
  options: GraphQLRequestOptions,
  query: string,
  variables?: TVariables,
): () => Promise<TData> {
  const { endpoint, headers, fetchFn } = options;

  return async () => {
    const fn = fetchFn ?? fetch;

    const response = await fn(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
    }

    const json = (await response.json()) as GraphQLResponse<TData>;

    if (json.errors && json.errors.length) {
      const message = json.errors.map((e) => e.message).join(", ");
      throw new Error(message);
    }

    if (!json.data) {
      throw new Error("GraphQL response missing data");
    }

    return json.data;
  };
}

export function createGraphQLTypedQuery<
  TData = unknown,
  TVariables = Record<string, unknown>,
>(
  options: GraphQLRequestOptions,
  document: TypedDocumentNode<TData, TVariables>,
  variables?: TVariables,
): () => Promise<TData> {
  const query = print(document);
  return createGraphQLQuery<TData, TVariables>(options, query, variables);
}

export function createGraphQLTypedMutation<
  TData = unknown,
  TVariables = Record<string, unknown>,
>(
  options: GraphQLRequestOptions,
  document: TypedDocumentNode<TData, TVariables>,
): (variables: TVariables) => Promise<TData> {
  const query = print(document);
  return createGraphQLMutation<TData, TVariables>(options, query);
}

export function createGraphQLMutation<TData, TVariables = Record<string, unknown>>(
  options: GraphQLRequestOptions,
  query: string,
): (variables: TVariables) => Promise<TData> {
  const { endpoint, headers, fetchFn } = options;

  return async (variables: TVariables) => {
    const fn = fetchFn ?? fetch;

    const response = await fn(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
    }

    const json = (await response.json()) as GraphQLResponse<TData>;

    if (json.errors && json.errors.length) {
      const message = json.errors.map((e) => e.message).join(", ");
      throw new Error(message);
    }

    if (!json.data) {
      throw new Error("GraphQL response missing data");
    }

    return json.data;
  };
}

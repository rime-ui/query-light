# Query Light

## Overview

Query Light is a minimalistic, finite‑state‑machine‑driven library for:

- **Data fetching** with caching and retry logic.
- **Real-time updates** via WebSockets.
- **Mutations** with a light, promise‑based API.
- A small, focused surface area (simple config, explicit states).

It is split into:

- `@rime-ui/query-light-main-core` – framework‑agnostic cache, retryer, and utilities.
- `@rime-ui/react-query-light` – React bindings (`QueryLightProvider`, `useQueryLight`).

## Installation

```sh
npm install query-light
# or
pnpm add query-light
```

## Features

- Simple GET-style query handling
- Query & mutation state driven by a small **finite state machine**
- Query cache with stale‑time based invalidation
- WebSocket connection management & streaming
- Promise-based API
- TypeScript support with **type inference from your query / mutation functions**

---

## React usage

### 1. Wrap your app

```tsx
import { QueryLightProvider } from "@rime-ui/react-query-light";

function App() {
  return (
    <QueryLightProvider>
      {/* your routes / components */}
    </QueryLightProvider>
  );
}
```

### 2. Basic query (finite state machine)

```tsx
import { useQueryLight } from "@rime-ui/react-query-light";

type Todo = { id: number; title: string; completed: boolean };

export function TodoDetails({ id }: { id: number }) {
  const { data, isLoading, isError, error, status, refetch, invalidateCurrentQuery } =
    useQueryLight(
      ["todo", id],
      async () => {
        const res = await fetch(
          `https://jsonplaceholder.typicode.com/todos/${id}`,
        );
        return (await res.json()) as Todo;
      },
      {
        enabled: true, // set to false to disable auto-run and call refetch() manually
        staleTime: 0,
        retry: 0,
        retryDelay: 2000,
        initialData: null,
      },
    );

  // status is one of: "idle" | "loading" | "success" | "error"

  if (isLoading) return <p>Loading…</p>;
  if (isError) return <p>Error: {String(error)}</p>;

  return (
    <div>
      <h1>{data?.title}</h1>
      <button onClick={refetch}>Refetch</button>
      <button onClick={invalidateCurrentQuery}>Invalidate cache</button>
    </div>
  );
}
```

### 3. WebSocket streaming

`useQueryLight` can also consume data from a WebSocket and append incoming messages to the current `data`.

```tsx
import { useQueryLight } from "@rime-ui/react-query-light";

interface Message {
  id: number;
  text: string;
}

export function LiveFeed() {
  const { data: messages } = useQueryLight<Message[]>(
    ["live-feed"],
    async () => [], // initial fetch; can be any Promise<Message[]>
    {
      enabled: false, // no automatic HTTP fetch
      isWebSocket: true,
      socketUrl: "wss://echo.websocket.org",
      staleTime: 0,
      retry: 0,
      retryDelay: 2000,
      initialData: [],
    },
  );

  return (
    <ul>
      {messages?.map((m) => (
        <li key={m.id}>{m.text}</li>
      ))}
    </ul>
  );
}
```

Incoming WebSocket messages are parsed as JSON and merged onto the existing `data` array for that query key and cached.

---

### 4. Mutations

`useMutationLight` gives you a tiny, FSM‑driven mutation primitive. The data type is inferred from your mutation function and the variables type from its argument.

```tsx
import { useMutationLight } from "@rime-ui/react-query-light";

interface NewTodo {
  title: string;
  completed?: boolean;
}

interface CreatedTodo extends NewTodo {
  id: number;
}

export function CreateTodo() {
  const { mutate, isLoading, isError, error, status, data } = useMutationLight(
    async (todo: NewTodo) => {
      const res = await fetch("https://jsonplaceholder.typicode.com/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todo),
      });
      return (await res.json()) as CreatedTodo;
    },
  );

  // status is one of: "idle" | "loading" | "success" | "error"

  return (
    <div>
      <button
        onClick={() => mutate({ title: "Example", completed: false })}
        disabled={isLoading}
      >
        Create todo
      </button>
      {isError && <p>Error: {String(error)}</p>}
      {status === "success" && <p>Created: {data?.id}</p>}
    </div>
  );
}
```

---

## GraphQL helpers

The core package exposes small GraphQL helpers that return Promise‑based functions which plug directly into `useQueryLight` / `useMutationLight`.

- `createGraphQLQuery` – returns `() => Promise<TData>`
- `createGraphQLMutation` – returns `(variables: TVariables) => Promise<TData>`

Because `useQueryLight` and `useMutationLight` infer their types from the **query / mutation function**, you usually do **not** need to pass a generic to the hook – the type flows from the GraphQL helper.

```tsx
import { useQueryLight, createGraphQLQuery } from "@rime-ui/react-query-light";

interface Country {
  code: string;
  name: string;
  emoji: string;
}

interface CountriesResponse {
  countries: Country[];
}

const countriesQuery = createGraphQLQuery<CountriesResponse>(
  {
    endpoint: "https://countries.trevorblades.com/graphql",
  },
  `
    query Countries {
      countries {
        code
        name
        emoji
      }
    }
  `,
);

export function Countries() {
  const { data, isLoading, isError, error } = useQueryLight(
    ["countries"],
    countriesQuery,
    { enabled: true },
  );

  // data is inferred as CountriesResponse

  if (isLoading) return <p>Loading…</p>;
  if (isError) return <p>Error: {String(error)}</p>;

  return (
    <ul>
      {data?.countries.map((c) => (
        <li key={c.code}>
          {c.emoji} {c.name}
        </li>
      ))}
    </ul>
  );
}
```

---

## Core utilities

You can also use the core package directly if you are not in React. The main exported pieces are:

- `QueryCache` – in‑memory cache with subscribe/notify.
- `initRetryer` – simple retry loop driven by error state.
- `createGraphQLQuery` / `createGraphQLMutation` – small helpers around `fetch` for GraphQL APIs.

Most users should use the React bindings, but the core is useful for custom integrations.


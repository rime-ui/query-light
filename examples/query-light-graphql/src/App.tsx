import {
  QueryLightProvider,
  QueryCache,
  useQueryLight,
  createGraphQLQuery,
} from "@rime-ui/react-query-light";

type Country = {
  code: string;
  name: string;
  emoji: string;
};

type CountriesQuery = {
  countries: Country[];
};

const cache = new QueryCache();

const countriesQuery = createGraphQLQuery<CountriesQuery>(
  { endpoint: "https://countries.trevorblades.com/graphql" },
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

function Countries() {
  const { data, isLoading, isError, error } = useQueryLight<CountriesQuery>(
    ["countries"],
    countriesQuery,
    { enabled: true },
  );

  if (isLoading) return <h1>Loading countries...</h1>;
  if (isError) return <h1>{String(error)}</h1>;

  return (
    <ul>
      {data?.countries.map((country) => (
        <li key={country.code}>
          {country.emoji} {country.name}
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  return (
    <QueryLightProvider cache={cache}>
      <main style={{ maxWidth: 640, margin: "2rem auto", fontFamily: "system-ui, sans-serif" }}>
        <h1>Query Light – GraphQL Example</h1>
        <p>
          This example uses <code>createGraphQLQuery</code> to execute a typed GraphQL request with
          <code>useQueryLight</code>.
        </p>
        <Countries />
      </main>
    </QueryLightProvider>
  );
}

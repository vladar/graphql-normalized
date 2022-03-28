import { NiceBenchmark } from "./nice-benchmark";
import { InMemoryCache } from "../src/apollo/cache/inmemory/inMemoryCache"

import {
  ApolloClient,
  ApolloLink,
  Observable,
  gql,
} from "@apollo/client";

const query = gql`
  {
    items {
      id
      foo
    }
  }
`;

let lastResult: any

async function prepareBenchmark(
  itemCount: number,
  normalized: boolean
) {
  function generateResult() {
    const items = [];
    for (let i = 0; i < itemCount; i++) {
      items.push({ __typename: `Item`, id: String(i), foo: `foo-${i}` });
    }
    return {
      data: {
        items,
      },
    };
  }

  function generateNormalizedResult() {
    const entities = [];
    const refs = [];
    for (let i = 0; i < itemCount; i++) {
      const item = { __typename: `Item`, id: String(i), foo: `foo-${i}` }
      const id = `${item.__typename}:${item.id}`
      entities.push([id, item])
      refs.push({ __ref: id })
    }
    entities.push([`ROOT_QUERY`, { __typename: `Query`, items: refs }])
    return {
      data: { __normalized: entities },
    };
  }

  const client = new ApolloClient({
    link: createPreExecutedLink(normalized ? generateNormalizedResult() : generateResult()),
    // @ts-ignore
    cache: new InMemoryCache(),
  });

  // let i = 1

  return async function runQuery() {
    // console.log(`Query ${i++}`)
    lastResult = await client.query({
      query: query,
      // variables: { i },
      fetchPolicy: "network-only",
    });
    return lastResult
  };
}

function createPreExecutedLink(result: any) {
  return new ApolloLink((operation) => {
    return new Observable((observer) => {
      try {
        if (!observer.closed) {
          observer.next({ ...result });
          observer.complete();
        }
      } catch (error) {
        if (!observer.closed) {
          observer.error(error);
        }
      }
    });
  });
}

async function main() {
  const currentCache = new NiceBenchmark("Current cache");
  currentCache.add("100 items", await prepareBenchmark(100, false));
  currentCache.add("1000 items", await prepareBenchmark(1000, false));
  currentCache.add("10000 items", await prepareBenchmark(10000, false));

  const newCache = new NiceBenchmark("Pre-normalized cache");
  newCache.add("100 items", await prepareBenchmark(100, true));
  newCache.add("1000 items", await prepareBenchmark(1000, true));
  newCache.add("10000 items", await prepareBenchmark(10000, true));

  await currentCache.run({ async: true });
  // console.log(`lastResult`, (await lastResult).data)
  await newCache.run({ async: true });
  // console.log(`lastResult`, (await lastResult).data)
}

main().catch(console.error);

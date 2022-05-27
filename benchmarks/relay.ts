import { NiceBenchmark } from "./nice-benchmark";
import {
  Environment,
  Network,
  RecordSource,
  Store,
  fetchQuery,
} from "relay-runtime";

// Query generated from "relay-query.ts" after running "yarn relay:compile"
import query from "./__generated__/relayQueryMyQuery.graphql";

let lastResult: any;

async function prepareBenchmark(itemCount: number, normalized: boolean) {
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
      const item = {
        __id: String(i),
        __typename: `Item`,
        id: String(i),
        foo: `foo-${i}`,
      };
      // const id = `${item.__typename}:${item.id}`;
      entities.push([item.id, item]);
      refs.push(item.id);
    }
    entities.push([
      `client:root`,
      { __id: "client:root", __typename: `__Root`, items: { __refs: refs } },
    ]);
    return {
      data: { __normalized: entities },
    };
  }

  // Export a singleton instance of Relay Environment configured with our network function:
  const env = new Environment({
    network: Network.create(() =>
      normalized ? generateNormalizedResult() : generateResult()
    ),
    store: new Store(new RecordSource()),
  });

  // let i = 1

  return async function runQuery() {
    // console.log(`Query ${i++}`)

    lastResult = fetchQuery(
      env,
      query,
      {},
      { fetchPolicy: "network-only" }
    ).toPromise();

    return lastResult;
  };
}

// @ts-ignore
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
  // console.log(`lastResult`, (await lastResult))
  await newCache.run({ async: true });
  // console.log(`lastResult`, (await lastResult))
}

// prepareBenchmark(10, true)
//   .then((run) => run())
//   .then(console.log)
//   .catch(console.error);

main().catch(console.error);

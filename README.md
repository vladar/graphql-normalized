# Experiment: GraphQL clients with pre-normalized cache

GraphQL clients (including Apollo and Relay) transform the data that comes from GraphQL server into
a normalized shape before saving it in the cache (or local store).

For example, let's imagine our client sends the following GraphQL query:

```graphql
  query {
    items {
      __typename
      id
      foo
    }
  }
```

And receives the following result from the server:
```js
// Step 1
{
  data: {
    items: [
      {
        __typename: `Item`,
        id: `1`,
        foo: `foo-1`,
      },
      // ...
      {
        __typename: `Item`,
        id: `10`,
        foo: `foo-10`,
      },
    ]
  }
}
```

Before saving this data the client has to go through all the results and transform them to a _normalized_
structure. Different clients use slightly different structures but the idea is the same. For example
Apollo will transform the result to this object:

```js
// Step 2
const data = {
  "Item:1": {
    __typename: `Item`,
    id: `1`,
    foo: `foo-1`,
  },
  // ...
  "Item:10": {
    __typename: `Item`,
    id: `10`,
    foo: `foo-10`,
  },
  "ROOT_QUERY": {
    items: [
      { __ref: "Item:1" },
      // ...
      { __ref: "Item:10" },
    ]
  }
}
```

And during the next step, the client basically re-constructs the original result shape from this
local store. So the final result that is passed to React is the original one:

```js
// Step 3
{
  data: {
    items: [
      {
        __typename: `Item`,
        id: `1`,
        foo: `foo-1`,
      },
      // ...
      {
        __typename: `Item`,
        id: `10`,
        foo: `foo-10`,
      },
    ]
  }
}
```

Clients additionally preserve referential integrity when doing so. Another obvious reason is to keep local state
consistent and up-to-date when multiple queries fetch parts of the same data.

## Idea: send pre-normalized results to the client

What happens if we move data normalization to GraphQL execution (i.e. move it to the server)?
How much does it affect the client performance?

First results for Apollo are rather promising and warrant at least some additional research:

```
Current cache
100 items x 568 ops/sec ±12.83% (49 runs sampled)
1000 items x 45.50 ops/sec ±22.58% (52 runs sampled)
10000 items x 6.86 ops/sec ±31.48% (43 runs sampled)

Pre-normalized cache
100 items x 7,246 ops/sec ±4.93% (58 runs sampled)
1000 items x 1,516 ops/sec ±7.05% (57 runs sampled)
10000 items x 65.74 ops/sec ±103.87% (53 runs sampled)
```

Relay benchmarks are TBD

## Try it
To run the benchmark, clone the repo install dependencies with `yarn install` and run:

```shell
yarn bench-apollo
```

## Caveats for Apollo

- Apollo local resolvers won't work out of the box. It is possible to fix them but the fix will have to live in the Apollo core (or patch)
- `read` function of field policies won't be supported because they basically have to be moved to the server (otherwise the feature doesn't make much sense)
- `key fields` must be defined at the schema level, not the client level

In general, this change moves some complexity off the main JS thread to the server (or worker for client-side JS).

## Status

This project is an **early experiment** to evaluate the potential impact on performance of GraphQL clients. Future steps may include:

- [ ] Do a sanity-check with some actual JS profile (numbers seem to be too good)
- [ ] Add a separate benchmark for Relay
- [ ] Build a proof-of-concept GraphQL executor capable to produce normalized results (e.g. as a feature in [supermassive](https://github.com/microsoft/graphitation/tree/main/packages/supermassive))
- [ ] Integrate it to a real-world project and explore the constraints of this approach

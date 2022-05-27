import { graphql } from "relay-runtime";

graphql`
  query relayQueryMyQuery {
    items {
      id
      foo
    }
  }
`;

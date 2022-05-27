/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";

export type relayQueryMyQueryVariables = {};
export type relayQueryMyQueryResponse = {
    readonly items: ReadonlyArray<{
        readonly id: string;
        readonly foo: string;
    }>;
};
export type relayQueryMyQuery = {
    readonly response: relayQueryMyQueryResponse;
    readonly variables: relayQueryMyQueryVariables;
};



/*
query relayQueryMyQuery {
  items {
    id
    foo
  }
}
*/

const node: ConcreteRequest = (function () {
    var v0 = [
        {
            "alias": null,
            "args": null,
            "concreteType": "Item",
            "kind": "LinkedField",
            "name": "items",
            "plural": true,
            "selections": [
                {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "id",
                    "storageKey": null
                },
                {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "foo",
                    "storageKey": null
                }
            ],
            "storageKey": null
        } as any
    ];
    return {
        "fragment": {
            "argumentDefinitions": [],
            "kind": "Fragment",
            "metadata": null,
            "name": "relayQueryMyQuery",
            "selections": (v0 /*: any*/),
            "type": "Query",
            "abstractKey": null
        },
        "kind": "Request",
        "operation": {
            "argumentDefinitions": [],
            "kind": "Operation",
            "name": "relayQueryMyQuery",
            "selections": (v0 /*: any*/)
        },
        "params": {
            "cacheID": "cdd79b0fda019d14367481ff559ded3f",
            "id": null,
            "metadata": {},
            "name": "relayQueryMyQuery",
            "operationKind": "query",
            "text": "query relayQueryMyQuery {\n  items {\n    id\n    foo\n  }\n}\n"
        }
    } as any;
})();
(node as any).hash = 'd3bac1930f6ad3e81d23d710b06c6a76';
export default node;

import { ExecutionResult } from 'graphql';

export function graphQLResultHasError(result: ExecutionResult<unknown>): boolean {
  return (result.errors && result.errors.length > 0) || false;
}

/**
 * Functional Result pattern for clean error handling
 */
export type Result<T, E = string> = 
  | { success: true; data: T }
  | { success: false; error: E; code?: string };

export const Success = <T>(data: T): Result<T, never> => ({
  success: true,
  data
});

export const Failure = <E>(error: E, code?: string): Result<never, E> => ({
  success: false,
  error,
  code
});

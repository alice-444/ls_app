export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

export const success = <T>(data: T): Result<T> => ({
  ok: true,
  data,
});

export const failure = (error: string, status?: number): Result<never> => ({
  ok: false,
  error,
  status,
});

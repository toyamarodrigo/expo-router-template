import type { z } from "zod";

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, url: string) {
    super(`Request failed with status ${status}: ${url}`);
    this.name = "HttpError";
    this.status = status;
  }
}

// Fetches JSON and validates it against a Zod schema. Schema errors surface as query errors.
export async function getJson<T>(url: string, schema: z.ZodType<T>): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new HttpError(response.status, url);
  }

  return schema.parse(await response.json());
}

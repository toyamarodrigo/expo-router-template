import type { z } from "zod";

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, url: string) {
    super(`Request failed with status ${status}: ${url}`);
    this.name = "HttpError";
    this.status = status;
  }
}

const DEFAULT_TIMEOUT_MS = 15_000;

// Fetches JSON and validates it against a Zod schema. Schema errors surface as query errors.
// One deadline covers the request and the body parse, so a hung request rejects instead of staying pending.
export async function getJson<T>(url: string, schema: z.ZodType<T>, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new HttpError(response.status, url);
    }

    return schema.parse(await response.json());
  } finally {
    clearTimeout(timeout);
  }
}

import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { z } from "zod";

import { getJson } from "./http";

const originalFetch = globalThis.fetch;
const fetchMock = jest.fn<typeof fetch>();

// A request that never settles on its own and rejects only when its signal aborts.
function hangUntilAborted() {
  fetchMock.mockImplementationOnce(
    (_url, init) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(init.signal?.reason));
      }),
  );
}

describe("getJson", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    jest.useRealTimers();
    fetchMock.mockReset();
    globalThis.fetch = originalFetch;
  });

  it("rejects when the request passes the deadline", async () => {
    hangUntilAborted();

    const request = getJson("https://example.com/slow", z.object({}), 1_000);
    const assertion = expect(request).rejects.toMatchObject({ name: "AbortError" });

    jest.advanceTimersByTime(1_000);

    await assertion;
  });

  it("clears the deadline after a response", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ id: 1 }) } as Response);

    await expect(getJson("https://example.com/fast", z.object({ id: z.number() }))).resolves.toEqual({ id: 1 });
    expect(jest.getTimerCount()).toBe(0);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Config } from "../config.js";
import {
	AuthenticationError,
	ForbiddenError,
	NotFoundError,
	RateLimitError,
} from "../utils/errors.js";

// Allow per-test control of withRetry behavior
let usePassthroughRetry = false;

vi.mock("../utils/retry.js", async (importOriginal) => {
	const original = await importOriginal<typeof import("../utils/retry.js")>();
	return {
		...original,
		withRetry: (fn: () => Promise<unknown>) => {
			if (usePassthroughRetry) {
				return fn();
			}
			return original.withRetry(fn);
		},
	};
});

// Import MetabaseClient after vi.mock so the mock is applied
const { MetabaseClient } = await import("./metabase-client.js");

function makeConfig(overrides: Partial<Config> = {}): Config {
	return {
		url: "https://metabase.test",
		authMethod: "api-key",
		apiKey: "test-key",
		readOnly: false,
		...overrides,
	};
}

function mockFetchResponse(body: unknown, status = 200) {
	return vi.fn().mockResolvedValue({
		ok: status >= 200 && status < 300,
		status,
		json: () => Promise.resolve(body),
	});
}

describe("MetabaseClient", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		usePassthroughRetry = false;
	});

	it("sets x-api-key header for API key auth", async () => {
		const fetchMock = mockFetchResponse({ data: "test" });
		vi.stubGlobal("fetch", fetchMock);
		const client = new MetabaseClient(makeConfig());

		await client.get("/api/card");

		expect(fetchMock).toHaveBeenCalledWith(
			"https://metabase.test/api/card",
			expect.objectContaining({
				headers: expect.objectContaining({ "x-api-key": "test-key" }),
			}),
		);
	});

	it("sets X-Metabase-Session for session token auth", async () => {
		const fetchMock = mockFetchResponse({ data: "test" });
		vi.stubGlobal("fetch", fetchMock);
		const client = new MetabaseClient(
			makeConfig({
				authMethod: "session-token",
				sessionToken: "sess-123",
				apiKey: undefined,
			}),
		);

		await client.get("/api/card");

		expect(fetchMock).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				headers: expect.objectContaining({ "X-Metabase-Session": "sess-123" }),
			}),
		);
	});

	it("authenticates with email/password on first request", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: () => Promise.resolve({ id: "session-from-login" }),
			})
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: () => Promise.resolve({ result: "ok" }),
			});
		vi.stubGlobal("fetch", fetchMock);

		const client = new MetabaseClient(
			makeConfig({
				authMethod: "email-password",
				email: "user@test.com",
				password: "pass",
				apiKey: undefined,
			}),
		);

		await client.get("/api/card");

		// First call: POST /api/session
		expect(fetchMock.mock.calls[0][0]).toBe("https://metabase.test/api/session");
		// Second call: GET /api/card with session header
		expect(fetchMock.mock.calls[1][1].headers["X-Metabase-Session"]).toBe("session-from-login");
	});

	it("appends query params to GET URL", async () => {
		const fetchMock = mockFetchResponse([]);
		vi.stubGlobal("fetch", fetchMock);
		const client = new MetabaseClient(makeConfig());

		await client.get("/api/card", { f: "mine", limit: 10 });

		expect(fetchMock).toHaveBeenCalledWith(
			"https://metabase.test/api/card?f=mine&limit=10",
			expect.any(Object),
		);
	});

	it("sends JSON body on POST", async () => {
		const fetchMock = mockFetchResponse({ id: 1 });
		vi.stubGlobal("fetch", fetchMock);
		const client = new MetabaseClient(makeConfig());

		await client.post("/api/card", { name: "Test Card" });

		expect(fetchMock).toHaveBeenCalledWith(
			"https://metabase.test/api/card",
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify({ name: "Test Card" }),
			}),
		);
	});

	it("sends JSON body on PUT", async () => {
		const fetchMock = mockFetchResponse({ id: 1 });
		vi.stubGlobal("fetch", fetchMock);
		const client = new MetabaseClient(makeConfig());

		await client.put("/api/card/1", { name: "Updated" });

		expect(fetchMock).toHaveBeenCalledWith(
			"https://metabase.test/api/card/1",
			expect.objectContaining({
				method: "PUT",
				body: JSON.stringify({ name: "Updated" }),
			}),
		);
	});

	it("throws NotFoundError on 404", async () => {
		vi.stubGlobal("fetch", mockFetchResponse({ message: "Not found" }, 404));
		const client = new MetabaseClient(makeConfig());
		await expect(client.get("/api/card/999")).rejects.toThrow(NotFoundError);
	});

	it("throws ForbiddenError on 403", async () => {
		vi.stubGlobal("fetch", mockFetchResponse({ message: "Forbidden" }, 403));
		const client = new MetabaseClient(makeConfig());
		await expect(client.get("/api/card/1")).rejects.toThrow(ForbiddenError);
	});

	it("throws RateLimitError on 429", async () => {
		// Bypass retry delays to avoid timer/unhandled-rejection complications
		usePassthroughRetry = true;
		vi.stubGlobal("fetch", mockFetchResponse({ message: "Too many requests" }, 429));
		const client = new MetabaseClient(makeConfig());

		await expect(client.get("/api/card/1")).rejects.toThrow(RateLimitError);
	});

	it("re-authenticates once on 401 for email-password auth", async () => {
		const fetchMock = vi
			.fn()
			// First: authenticate (initial login)
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: () => Promise.resolve({ id: "token-1" }),
			})
			// Second: actual request returns 401
			.mockResolvedValueOnce({
				ok: false,
				status: 401,
				json: () => Promise.resolve({ message: "Expired" }),
			})
			// Third: re-authenticate
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: () => Promise.resolve({ id: "token-2" }),
			})
			// Fourth: retry the request succeeds
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: () => Promise.resolve({ result: "ok" }),
			});
		vi.stubGlobal("fetch", fetchMock);

		const client = new MetabaseClient(
			makeConfig({
				authMethod: "email-password",
				email: "u@t.com",
				password: "p",
				apiKey: undefined,
			}),
		);

		const result = await client.get("/api/card/1");
		expect(result).toEqual({ result: "ok" });
		expect(fetchMock).toHaveBeenCalledTimes(4);
	});

	it("does not loop infinitely on 401 re-auth failure", async () => {
		const fetchMock = vi
			.fn()
			// First: authenticate (initial login)
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: () => Promise.resolve({ id: "token-1" }),
			})
			// Second: actual request returns 401
			.mockResolvedValueOnce({
				ok: false,
				status: 401,
				json: () => Promise.resolve({ message: "Expired" }),
			})
			// Third: re-authenticate succeeds
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: () => Promise.resolve({ id: "token-2" }),
			})
			// Fourth: retry still returns 401 (isRetryAfterAuth = true, no more re-auth)
			.mockResolvedValueOnce({
				ok: false,
				status: 401,
				json: () => Promise.resolve({ message: "Still expired" }),
			});
		vi.stubGlobal("fetch", fetchMock);

		const client = new MetabaseClient(
			makeConfig({
				authMethod: "email-password",
				email: "u@t.com",
				password: "p",
				apiKey: undefined,
			}),
		);

		await expect(client.get("/api/card/1")).rejects.toThrow(AuthenticationError);
		// Should not have made more than 4 fetch calls (no infinite loop)
		expect(fetchMock).toHaveBeenCalledTimes(4);
	});

	it("returns undefined for 204 No Content", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				status: 204,
				json: () => Promise.reject(new Error("no body")),
			}),
		);
		const client = new MetabaseClient(makeConfig());
		const result = await client.delete_("/api/card/1");
		expect(result).toBeUndefined();
	});
});

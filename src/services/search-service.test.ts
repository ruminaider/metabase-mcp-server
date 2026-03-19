import { describe, it, expect, vi, beforeEach } from "vitest";
import { SearchService } from "./search-service.js";
import type { MetabaseClient } from "./metabase-client.js";

vi.mock("../utils/read-only-guard.js", () => ({
	assertWriteEnabled: vi.fn(),
}));

function mockClient(): MetabaseClient {
	return {
		get: vi.fn().mockResolvedValue({ data: [] }),
		post: vi.fn().mockResolvedValue({ ok: true }),
		put: vi.fn(),
		delete_: vi.fn(),
	} as unknown as MetabaseClient;
}

describe("SearchService", () => {
	let client: MetabaseClient;
	let service: SearchService;

	beforeEach(() => {
		client = mockClient();
		service = new SearchService(client);
	});

	it("search calls GET /api/search with query", async () => {
		await service.search({ q: "revenue" });
		expect(client.get).toHaveBeenCalledWith("/api/search", { q: "revenue" });
	});

	it("search passes limit and offset", async () => {
		await service.search({ q: "test", limit: 10, offset: 5 });
		expect(client.get).toHaveBeenCalledWith("/api/search", { q: "test", limit: "10", offset: "5" });
	});

	it("getRecentViews calls GET /api/activity/recents", async () => {
		await service.getRecentViews();
		expect(client.get).toHaveBeenCalledWith("/api/activity/recents");
	});

	it("getCurrentUser calls GET /api/user/current", async () => {
		await service.getCurrentUser();
		expect(client.get).toHaveBeenCalledWith("/api/user/current");
	});

	it("invalidateCache calls POST /api/cache/invalidate", async () => {
		await service.invalidateCache({ database: 5 });
		expect(client.post).toHaveBeenCalledWith("/api/cache/invalidate", { db: "5" });
	});
});

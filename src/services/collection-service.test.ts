import { beforeEach, describe, expect, it, vi } from "vitest";
import { CollectionService } from "./collection-service.js";
import type { MetabaseClient } from "./metabase-client.js";

vi.mock("../utils/read-only-guard.js", () => ({
	assertWriteEnabled: vi.fn(),
}));

function mockClient(): MetabaseClient {
	return {
		get: vi.fn().mockResolvedValue([]),
		post: vi.fn().mockResolvedValue({ id: 1 }),
		put: vi.fn().mockResolvedValue({ id: 1 }),
		delete_: vi.fn(),
	} as unknown as MetabaseClient;
}

describe("CollectionService", () => {
	let client: MetabaseClient;
	let service: CollectionService;

	beforeEach(() => {
		client = mockClient();
		service = new CollectionService(client);
	});

	it("listCollections calls GET /api/collection", async () => {
		await service.listCollections();
		expect(client.get).toHaveBeenCalledWith("/api/collection", {});
	});

	it("getCollection calls correct path", async () => {
		await service.getCollection(5);
		expect(client.get).toHaveBeenCalledWith("/api/collection/5");
	});

	it("getCollection handles root", async () => {
		await service.getCollection("root");
		expect(client.get).toHaveBeenCalledWith("/api/collection/root");
	});

	it("getCollectionItems calls correct path with params", async () => {
		await service.getCollectionItems(5, { limit: 10, offset: 0 });
		expect(client.get).toHaveBeenCalledWith("/api/collection/5/items", {
			limit: "10",
			offset: "0",
		});
	});

	it("getCollectionTree calls GET /api/collection/tree", async () => {
		await service.getCollectionTree();
		expect(client.get).toHaveBeenCalledWith("/api/collection/tree");
	});

	it("createCollection calls POST /api/collection", async () => {
		await service.createCollection({ name: "Test", description: "A test" });
		expect(client.post).toHaveBeenCalledWith("/api/collection", {
			name: "Test",
			description: "A test",
		});
	});

	it("updateCollection calls PUT with updates", async () => {
		await service.updateCollection(5, { name: "Updated" });
		expect(client.put).toHaveBeenCalledWith("/api/collection/5", { name: "Updated" });
	});
});

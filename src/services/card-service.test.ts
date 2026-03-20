import { beforeEach, describe, expect, it, vi } from "vitest";
import { CardService } from "./card-service.js";
import type { MetabaseClient } from "./metabase-client.js";

vi.mock("../utils/read-only-guard.js", () => ({
	assertWriteEnabled: vi.fn(),
}));

function mockClient(): MetabaseClient {
	return {
		get: vi.fn().mockResolvedValue({ data: [] }),
		post: vi.fn().mockResolvedValue({ id: 1 }),
		put: vi.fn().mockResolvedValue({ id: 1 }),
		delete_: vi.fn(),
	} as unknown as MetabaseClient;
}

describe("CardService", () => {
	let client: MetabaseClient;
	let service: CardService;

	beforeEach(() => {
		client = mockClient();
		service = new CardService(client);
	});

	it("listCards calls GET /api/card", async () => {
		await service.listCards();
		expect(client.get).toHaveBeenCalledWith("/api/card", {});
	});

	it("listCards passes filter", async () => {
		await service.listCards({ f: "mine" });
		expect(client.get).toHaveBeenCalledWith("/api/card", { f: "mine" });
	});

	it("getCard calls correct path", async () => {
		await service.getCard(42);
		expect(client.get).toHaveBeenCalledWith("/api/card/42");
	});

	it("createCard calls POST /api/card", async () => {
		const params = { name: "Test", dataset_query: { database: 1 }, display: "table" };
		await service.createCard(params);
		expect(client.post).toHaveBeenCalledWith("/api/card", params);
	});

	it("updateCard calls PUT /api/card/:id", async () => {
		await service.updateCard(42, { name: "Updated" });
		expect(client.put).toHaveBeenCalledWith("/api/card/42", { name: "Updated" });
	});

	it("copyCard calls POST /api/card/:id/copy", async () => {
		await service.copyCard(42);
		expect(client.post).toHaveBeenCalledWith("/api/card/42/copy");
	});

	it("executeCard calls POST /api/card/:id/query", async () => {
		await service.executeCard(42);
		expect(client.post).toHaveBeenCalledWith("/api/card/42/query", {});
	});

	it("executeCard passes parameters and ignore_cache", async () => {
		await service.executeCard(42, [{ id: "p1", value: "v1" }], true);
		expect(client.post).toHaveBeenCalledWith("/api/card/42/query", {
			parameters: [{ id: "p1", value: "v1" }],
			ignore_cache: true,
		});
	});

	it("exportCardResults calls correct format endpoint", async () => {
		await service.exportCardResults(42, "csv");
		expect(client.post).toHaveBeenCalledWith("/api/card/42/query/csv");
	});

	it("getCardMetadata calls correct path", async () => {
		await service.getCardMetadata(42);
		expect(client.get).toHaveBeenCalledWith("/api/card/42/query_metadata");
	});

	it("listCardDashboards calls correct path", async () => {
		await service.listCardDashboards(42);
		expect(client.get).toHaveBeenCalledWith("/api/card/42/dashboards");
	});

	it("archiveCard calls PUT with archived: true", async () => {
		await service.archiveCard(42);
		expect(client.put).toHaveBeenCalledWith("/api/card/42", { archived: true });
	});
});

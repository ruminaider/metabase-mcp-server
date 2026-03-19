import { describe, it, expect, vi, beforeEach } from "vitest";
import { DatabaseService } from "./database-service.js";
import type { MetabaseClient } from "./metabase-client.js";

function mockClient(): MetabaseClient {
	return {
		get: vi.fn().mockResolvedValue({ data: [] }),
		post: vi.fn(),
		put: vi.fn(),
		delete_: vi.fn(),
	} as unknown as MetabaseClient;
}

describe("DatabaseService", () => {
	let client: MetabaseClient;
	let service: DatabaseService;

	beforeEach(() => {
		client = mockClient();
		service = new DatabaseService(client);
	});

	it("listDatabases calls GET /api/database", async () => {
		await service.listDatabases();
		expect(client.get).toHaveBeenCalledWith("/api/database", {});
	});

	it("listDatabases passes include_cards param", async () => {
		await service.listDatabases(true);
		expect(client.get).toHaveBeenCalledWith("/api/database", { include_cards: "true" });
	});

	it("getDatabase calls correct path", async () => {
		await service.getDatabase(5);
		expect(client.get).toHaveBeenCalledWith("/api/database/5");
	});

	it("getDatabaseMetadata calls correct path", async () => {
		await service.getDatabaseMetadata(5);
		expect(client.get).toHaveBeenCalledWith("/api/database/5/metadata");
	});

	it("listDatabaseSchemas calls correct path", async () => {
		await service.listDatabaseSchemas(5);
		expect(client.get).toHaveBeenCalledWith("/api/database/5/schemas");
	});

	it("listSchemaTables encodes schema name", async () => {
		await service.listSchemaTables(5, "public schema");
		expect(client.get).toHaveBeenCalledWith("/api/database/5/schema/public%20schema");
	});
});

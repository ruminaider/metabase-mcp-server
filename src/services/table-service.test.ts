import { describe, it, expect, vi, beforeEach } from "vitest";
import { TableService } from "./table-service.js";
import type { MetabaseClient } from "./metabase-client.js";

vi.mock("../utils/read-only-guard.js", () => ({
	assertWriteEnabled: vi.fn(),
}));

function mockClient(): MetabaseClient {
	return {
		get: vi.fn().mockResolvedValue({ data: [] }),
		post: vi.fn(),
		put: vi.fn().mockResolvedValue({ id: 1 }),
		delete_: vi.fn(),
	} as unknown as MetabaseClient;
}

describe("TableService", () => {
	let client: MetabaseClient;
	let service: TableService;

	beforeEach(() => {
		client = mockClient();
		service = new TableService(client);
	});

	it("listTables calls GET /api/table", async () => {
		await service.listTables();
		expect(client.get).toHaveBeenCalledWith("/api/table");
	});

	it("getTable calls correct path", async () => {
		await service.getTable(42);
		expect(client.get).toHaveBeenCalledWith("/api/table/42");
	});

	it("getTableMetadata calls correct path", async () => {
		await service.getTableMetadata(42);
		expect(client.get).toHaveBeenCalledWith("/api/table/42/query_metadata", {});
	});

	it("getTableFks calls correct path", async () => {
		await service.getTableFks(42);
		expect(client.get).toHaveBeenCalledWith("/api/table/42/fks");
	});

	it("getField calls correct path", async () => {
		await service.getField(100);
		expect(client.get).toHaveBeenCalledWith("/api/field/100");
	});

	it("getFieldValues calls correct path", async () => {
		await service.getFieldValues(100);
		expect(client.get).toHaveBeenCalledWith("/api/field/100/values");
	});

	it("updateField calls PUT with updates", async () => {
		await service.updateField(100, { display_name: "New Name" });
		expect(client.put).toHaveBeenCalledWith("/api/field/100", { display_name: "New Name" });
	});
});

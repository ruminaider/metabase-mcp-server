import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryService } from "./query-service.js";
import type { MetabaseClient } from "./metabase-client.js";

function mockClient(): MetabaseClient {
	return {
		get: vi.fn(),
		post: vi.fn().mockResolvedValue({ data: { rows: [] } }),
		put: vi.fn(),
		delete_: vi.fn(),
	} as unknown as MetabaseClient;
}

describe("QueryService", () => {
	let client: MetabaseClient;
	let service: QueryService;

	beforeEach(() => {
		client = mockClient();
		service = new QueryService(client);
	});

	it("executeQuery sends correct dataset query", async () => {
		await service.executeQuery(1, "SELECT 1");
		expect(client.post).toHaveBeenCalledWith("/api/dataset", {
			database: 1,
			type: "native",
			native: { query: "SELECT 1", "template-tags": {} },
		});
	});

	it("executeQuery passes template tags", async () => {
		await service.executeQuery(1, "SELECT {{col}}", { col: { type: "text", name: "col" } });
		expect(client.post).toHaveBeenCalledWith("/api/dataset", {
			database: 1,
			type: "native",
			native: {
				query: "SELECT {{col}}",
				"template-tags": { col: { type: "text", name: "col" } },
			},
		});
	});

	it("exportQueryResults uses correct format endpoint", async () => {
		await service.exportQueryResults(1, "SELECT 1", "csv");
		expect(client.post).toHaveBeenCalledWith("/api/dataset/csv", expect.any(Object));
	});

	it("convertToNativeSql sends dataset query", async () => {
		const mbql = { database: 1, type: "query", query: { "source-table": 5 } };
		await service.convertToNativeSql(mbql);
		expect(client.post).toHaveBeenCalledWith("/api/dataset/native", { query: mbql });
	});
});

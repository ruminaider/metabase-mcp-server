import { describe, expect, it } from "vitest";
import { formatResponse, optimizeDetail, optimizeList, optimizeQueryResult } from "./response.js";

describe("optimizeDetail", () => {
	it("strips global bloat fields", () => {
		const input = {
			id: 1,
			name: "Test",
			result_metadata: [{ base_type: "type/Integer", fingerprint: { global: {} } }],
			metabase_version: "v0.50",
			enable_embedding: false,
			dataset_query: { database: 1, type: "native", native: { query: "SELECT 1" } },
		};
		const parsed = JSON.parse(optimizeDetail(input));
		expect(parsed.id).toBe(1);
		expect(parsed.name).toBe("Test");
		expect(parsed.dataset_query).toBeDefined();
		expect(parsed.result_metadata).toBeUndefined();
		expect(parsed.metabase_version).toBeUndefined();
		expect(parsed.enable_embedding).toBeUndefined();
	});

	it("returns compact JSON (no whitespace)", () => {
		const result = optimizeDetail({ id: 1, name: "Test" });
		expect(result).not.toContain("\n");
		expect(result).toBe('{"id":1,"name":"Test"}');
	});
});

describe("optimizeList", () => {
	it("strips list-specific fields in addition to global fields", () => {
		const input = [
			{
				id: 1,
				name: "Card",
				visualization_settings: { "graph.dimensions": ["x"] },
				dataset_query: { database: 1 },
				creator: { id: 1, email: "a@b.com" },
				view_count: 42,
			},
		];
		const parsed = JSON.parse(optimizeList(input));
		expect(parsed[0].id).toBe(1);
		expect(parsed[0].name).toBe("Card");
		expect(parsed[0].visualization_settings).toBeUndefined();
		expect(parsed[0].dataset_query).toBeUndefined();
		expect(parsed[0].creator).toBeUndefined();
		expect(parsed[0].view_count).toBeUndefined();
	});
});

describe("optimizeQueryResult", () => {
	it("converts rows+cols to array of objects", () => {
		const input = {
			status: "completed",
			row_count: 2,
			data: {
				rows: [
					[1, "Alice"],
					[2, "Bob"],
				],
				cols: [{ name: "id" }, { name: "name" }],
			},
		};
		const parsed = JSON.parse(optimizeQueryResult(input));
		expect(parsed.row_count).toBe(2);
		expect(parsed.status).toBe("completed");
		expect(parsed.rows).toEqual([
			{ id: 1, name: "Alice" },
			{ id: 2, name: "Bob" },
		]);
	});

	it("falls back to compact JSON for non-dataset responses", () => {
		const input = { message: "ok" };
		const result = optimizeQueryResult(input);
		expect(result).toBe('{"message":"ok"}');
	});
});

describe("formatResponse", () => {
	it("returns compact JSON", () => {
		expect(formatResponse({ a: 1 })).toBe('{"a":1}');
	});
});

import { Cache } from "../utils/cache.js";
import { assertWriteEnabled } from "../utils/read-only-guard.js";
import type { MetabaseClient } from "./metabase-client.js";

const tableListCache = new Cache<unknown>("table-list");
const tableCache = new Cache<unknown>("table");
const tableMetadataCache = new Cache<unknown>("table-metadata");
const tableFksCache = new Cache<unknown>("table-fks");
const fieldCache = new Cache<unknown>("field");
const fieldValuesCache = new Cache<unknown>("field-values");

export class TableService {
	constructor(private client: MetabaseClient) {}

	async listTables(): Promise<unknown> {
		const cached = tableListCache.get("all");
		if (cached) return cached;
		const result = await this.client.get("/api/table");
		tableListCache.set("all", result);
		return result;
	}

	async getTable(id: number): Promise<unknown> {
		const cacheKey = String(id);
		const cached = tableCache.get(cacheKey);
		if (cached) return cached;
		const result = await this.client.get(`/api/table/${id}`);
		tableCache.set(cacheKey, result);
		return result;
	}

	async getTableMetadata(id: number, includeSensitiveFields = false): Promise<unknown> {
		const cacheKey = `${id}:${includeSensitiveFields}`;
		const cached = tableMetadataCache.get(cacheKey);
		if (cached) return cached;
		const params: Record<string, string> = {};
		if (includeSensitiveFields) params.include_sensitive_fields = "true";
		const result = await this.client.get(`/api/table/${id}/query_metadata`, params);
		tableMetadataCache.set(cacheKey, result);
		return result;
	}

	async getTableFks(id: number): Promise<unknown> {
		const cacheKey = String(id);
		const cached = tableFksCache.get(cacheKey);
		if (cached) return cached;
		const result = await this.client.get(`/api/table/${id}/fks`);
		tableFksCache.set(cacheKey, result);
		return result;
	}

	async getField(id: number): Promise<unknown> {
		const cacheKey = String(id);
		const cached = fieldCache.get(cacheKey);
		if (cached) return cached;
		const result = await this.client.get(`/api/field/${id}`);
		fieldCache.set(cacheKey, result);
		return result;
	}

	async getFieldValues(id: number): Promise<unknown> {
		const cacheKey = String(id);
		const cached = fieldValuesCache.get(cacheKey);
		if (cached) return cached;
		const result = await this.client.get(`/api/field/${id}/values`);
		fieldValuesCache.set(cacheKey, result);
		return result;
	}

	async updateField(id: number, updates: Record<string, unknown>): Promise<unknown> {
		assertWriteEnabled();
		// Invalidate field cache on write
		fieldCache.invalidate(String(id));
		fieldValuesCache.invalidate(String(id));
		return this.client.put(`/api/field/${id}`, updates);
	}

	async getTables(ids: number[]): Promise<unknown[]> {
		const { batchProcess } = await import("../utils/batch.js");
		const results = await batchProcess(ids, (id) => this.getTable(id));
		return results;
	}
}

import type { MetabaseClient } from "./metabase-client.js";
import { assertWriteEnabled } from "../utils/read-only-guard.js";

export class TableService {
	constructor(private client: MetabaseClient) {}

	async listTables(): Promise<unknown> {
		return this.client.get("/api/table");
	}

	async getTable(id: number): Promise<unknown> {
		return this.client.get(`/api/table/${id}`);
	}

	async getTableMetadata(id: number, includeSensitiveFields = false): Promise<unknown> {
		const params: Record<string, string> = {};
		if (includeSensitiveFields) params.include_sensitive_fields = "true";
		return this.client.get(`/api/table/${id}/query_metadata`, params);
	}

	async getTableFks(id: number): Promise<unknown> {
		return this.client.get(`/api/table/${id}/fks`);
	}

	async getField(id: number): Promise<unknown> {
		return this.client.get(`/api/field/${id}`);
	}

	async getFieldValues(id: number): Promise<unknown> {
		return this.client.get(`/api/field/${id}/values`);
	}

	async updateField(id: number, updates: Record<string, unknown>): Promise<unknown> {
		assertWriteEnabled();
		return this.client.put(`/api/field/${id}`, updates);
	}
}

import type { MetabaseClient } from "./metabase-client.js";

export class DatabaseService {
	constructor(private client: MetabaseClient) {}

	async listDatabases(includeCards = false): Promise<unknown> {
		const params: Record<string, string> = {};
		if (includeCards) params.include_cards = "true";
		return this.client.get("/api/database", params);
	}

	async getDatabase(id: number): Promise<unknown> {
		return this.client.get(`/api/database/${id}`);
	}

	async getDatabaseMetadata(id: number): Promise<unknown> {
		return this.client.get(`/api/database/${id}/metadata`);
	}

	async listDatabaseSchemas(id: number): Promise<unknown> {
		return this.client.get(`/api/database/${id}/schemas`);
	}

	async listSchemaTables(databaseId: number, schema: string): Promise<unknown> {
		return this.client.get(`/api/database/${databaseId}/schema/${encodeURIComponent(schema)}`);
	}
}

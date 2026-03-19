import type { MetabaseClient } from "./metabase-client.js";
import { Cache } from "../utils/cache.js";

const databaseListCache = new Cache<unknown>("database-list");
const databaseCache = new Cache<unknown>("database");
const databaseMetadataCache = new Cache<unknown>("database-metadata");
const schemaCache = new Cache<unknown>("schemas");
const schemaTablesCache = new Cache<unknown>("schema-tables");

export class DatabaseService {
	constructor(private client: MetabaseClient) {}

	async listDatabases(includeCards = false): Promise<unknown> {
		const cacheKey = `list:${includeCards}`;
		const cached = databaseListCache.get(cacheKey);
		if (cached) return cached;
		const result = await this.client.get("/api/database", includeCards ? { include_cards: "true" } : {});
		databaseListCache.set(cacheKey, result);
		return result;
	}

	async getDatabase(id: number): Promise<unknown> {
		const cacheKey = String(id);
		const cached = databaseCache.get(cacheKey);
		if (cached) return cached;
		const result = await this.client.get(`/api/database/${id}`);
		databaseCache.set(cacheKey, result);
		return result;
	}

	async getDatabaseMetadata(id: number): Promise<unknown> {
		const cacheKey = String(id);
		const cached = databaseMetadataCache.get(cacheKey);
		if (cached) return cached;
		const result = await this.client.get(`/api/database/${id}/metadata`);
		databaseMetadataCache.set(cacheKey, result);
		return result;
	}

	async listDatabaseSchemas(id: number): Promise<unknown> {
		const cacheKey = String(id);
		const cached = schemaCache.get(cacheKey);
		if (cached) return cached;
		const result = await this.client.get(`/api/database/${id}/schemas`);
		schemaCache.set(cacheKey, result);
		return result;
	}

	async listSchemaTables(databaseId: number, schema: string): Promise<unknown> {
		const cacheKey = `${databaseId}:${schema}`;
		const cached = schemaTablesCache.get(cacheKey);
		if (cached) return cached;
		const result = await this.client.get(`/api/database/${databaseId}/schema/${encodeURIComponent(schema)}`);
		schemaTablesCache.set(cacheKey, result);
		return result;
	}
}

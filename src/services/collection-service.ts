import { Cache } from "../utils/cache.js";
import { assertWriteEnabled } from "../utils/read-only-guard.js";
import type { MetabaseClient } from "./metabase-client.js";

const collectionTreeCache = new Cache<unknown>("collection-tree");

export class CollectionService {
	constructor(private client: MetabaseClient) {}

	async listCollections(archived = false): Promise<unknown> {
		const params: Record<string, string> = {};
		if (archived) params.archived = "true";
		return this.client.get("/api/collection", params);
	}

	async getCollection(id: number | "root"): Promise<unknown> {
		return this.client.get(`/api/collection/${id}`);
	}

	async getCollectionItems(
		id: number | "root",
		options?: { models?: string[]; limit?: number; offset?: number },
	): Promise<unknown> {
		const params: Record<string, string> = {};
		if (options?.models) {
			for (const model of options.models) {
				params.models = model;
			}
		}
		if (options?.limit) params.limit = String(options.limit);
		if (options?.offset !== undefined && options?.offset !== null)
			params.offset = String(options.offset);
		return this.client.get(`/api/collection/${id}/items`, params);
	}

	async getCollectionTree(): Promise<unknown> {
		const cached = collectionTreeCache.get("tree");
		if (cached) return cached;
		const result = await this.client.get("/api/collection/tree");
		collectionTreeCache.set("tree", result);
		return result;
	}

	async createCollection(params: {
		name: string;
		description?: string;
		parent_id?: number;
		color?: string;
	}): Promise<unknown> {
		assertWriteEnabled();
		const result = await this.client.post("/api/collection", params);
		collectionTreeCache.invalidate();
		return result;
	}

	async updateCollection(id: number, updates: Record<string, unknown>): Promise<unknown> {
		assertWriteEnabled();
		const result = await this.client.put(`/api/collection/${id}`, updates);
		collectionTreeCache.invalidate();
		return result;
	}
}

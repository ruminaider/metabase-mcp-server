import type { MetabaseClient } from "./metabase-client.js";
import { assertWriteEnabled } from "../utils/read-only-guard.js";

export class SearchService {
	constructor(private client: MetabaseClient) {}

	async search(options: {
		q?: string;
		models?: string[];
		archived?: boolean;
		limit?: number;
		offset?: number;
	}): Promise<unknown> {
		const params: Record<string, string> = {};
		if (options.q) params.q = options.q;
		if (options.models) {
			for (const model of options.models) {
				params.models = model; // Metabase uses repeated params
			}
		}
		if (options.archived) params.archived = "true";
		if (options.limit) params.limit = String(options.limit);
		if (options.offset) params.offset = String(options.offset);
		return this.client.get("/api/search", params);
	}

	async getRecentViews(): Promise<unknown> {
		return this.client.get("/api/activity/recents");
	}

	async getCurrentUser(): Promise<unknown> {
		return this.client.get("/api/user/current");
	}

	async invalidateCache(options?: {
		database?: number;
		dashboard?: number;
	}): Promise<unknown> {
		assertWriteEnabled();
		const params: Record<string, string> = {};
		if (options?.database) params.db = String(options.database);
		if (options?.dashboard) params.dashboard = String(options.dashboard);
		return this.client.post("/api/cache/invalidate", params);
	}
}

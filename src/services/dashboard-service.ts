import type { MetabaseClient } from "./metabase-client.js";
import { assertWriteEnabled } from "../utils/read-only-guard.js";

export class DashboardService {
	constructor(private client: MetabaseClient) {}

	async listDashboards(f?: "all" | "mine" | "archived"): Promise<unknown> {
		const params: Record<string, string> = {};
		if (f) params.f = f;
		return this.client.get("/api/dashboard", params);
	}

	async getDashboard(id: number): Promise<unknown> {
		return this.client.get(`/api/dashboard/${id}`);
	}

	async createDashboard(params: {
		name: string;
		description?: string;
		collection_id?: number;
		parameters?: Record<string, unknown>[];
	}): Promise<unknown> {
		assertWriteEnabled();
		return this.client.post("/api/dashboard", params);
	}

	async updateDashboard(id: number, updates: Record<string, unknown>): Promise<unknown> {
		assertWriteEnabled();
		return this.client.put(`/api/dashboard/${id}`, updates);
	}

	async copyDashboard(
		id: number,
		options?: { name?: string; description?: string; collection_id?: number },
	): Promise<unknown> {
		assertWriteEnabled();
		return this.client.post(`/api/dashboard/${id}/copy`, options ?? {});
	}

	async updateDashboardCards(
		id: number,
		cards: Record<string, unknown>[],
	): Promise<unknown> {
		assertWriteEnabled();
		return this.client.put(`/api/dashboard/${id}/cards`, { cards });
	}

	async archiveDashboard(id: number): Promise<unknown> {
		assertWriteEnabled();
		return this.client.put(`/api/dashboard/${id}`, { archived: true });
	}

	async getDashboardMetadata(id: number): Promise<unknown> {
		return this.client.get(`/api/dashboard/${id}/query_metadata`);
	}

	async getDashboards(ids: number[]): Promise<unknown[]> {
		const { batchProcess } = await import("../utils/batch.js");
		const results = await batchProcess(ids, (id) => this.getDashboard(id));
		return results;
	}
}

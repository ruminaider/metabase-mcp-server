import type { MetabaseClient } from "./metabase-client.js";
import { assertWriteEnabled } from "../utils/read-only-guard.js";

export class CardService {
	constructor(private client: MetabaseClient) {}

	async listCards(options?: {
		f?: "all" | "archived" | "mine" | "popular" | "recent";
		model_id?: number;
	}): Promise<unknown> {
		const params: Record<string, string> = {};
		if (options?.f) params.f = options.f;
		if (options?.model_id) params.model_id = String(options.model_id);
		return this.client.get("/api/card", params);
	}

	async getCard(id: number): Promise<unknown> {
		return this.client.get(`/api/card/${id}`);
	}

	async createCard(params: {
		name: string;
		dataset_query: Record<string, unknown>;
		display: string;
		description?: string;
		collection_id?: number;
		visualization_settings?: Record<string, unknown>;
	}): Promise<unknown> {
		assertWriteEnabled();
		return this.client.post("/api/card", params);
	}

	async updateCard(id: number, updates: Record<string, unknown>): Promise<unknown> {
		assertWriteEnabled();
		return this.client.put(`/api/card/${id}`, updates);
	}

	async copyCard(id: number): Promise<unknown> {
		assertWriteEnabled();
		return this.client.post(`/api/card/${id}/copy`);
	}

	async executeCard(
		id: number,
		parameters?: Record<string, unknown>[],
		ignoreCache?: boolean,
	): Promise<unknown> {
		const body: Record<string, unknown> = {};
		if (parameters) body.parameters = parameters;
		if (ignoreCache) body.ignore_cache = true;
		return this.client.post(`/api/card/${id}/query`, body);
	}

	async exportCardResults(
		id: number,
		format: "csv" | "json" | "xlsx",
	): Promise<unknown> {
		return this.client.post(`/api/card/${id}/query/${format}`);
	}

	async getCardMetadata(id: number): Promise<unknown> {
		return this.client.get(`/api/card/${id}/query_metadata`);
	}

	async listCardDashboards(id: number): Promise<unknown> {
		return this.client.get(`/api/card/${id}/dashboards`);
	}

	async archiveCard(id: number): Promise<unknown> {
		assertWriteEnabled();
		return this.client.put(`/api/card/${id}`, { archived: true });
	}
}

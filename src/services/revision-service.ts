import type { MetabaseClient } from "./metabase-client.js";
import { assertWriteEnabled } from "../utils/read-only-guard.js";

export class RevisionService {
	constructor(private client: MetabaseClient) {}

	async getRevisions(entity: "card" | "dashboard", id: number): Promise<unknown> {
		return this.client.get(`/api/revision`, { entity, id: String(id) });
	}

	async revertRevision(params: {
		entity: "card" | "dashboard";
		id: number;
		revision_id: number;
	}): Promise<unknown> {
		assertWriteEnabled();
		return this.client.post("/api/revision/revert", params);
	}

	async toggleBookmark(
		model: "card" | "dashboard" | "collection",
		id: number,
		action: "create" | "delete",
	): Promise<unknown> {
		assertWriteEnabled();
		if (action === "create") {
			return this.client.post(`/api/bookmark/${model}/${id}`);
		}
		return this.client.delete_(`/api/bookmark/${model}/${id}`);
	}
}

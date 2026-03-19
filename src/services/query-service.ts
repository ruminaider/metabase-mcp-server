import type { MetabaseClient } from "./metabase-client.js";

export class QueryService {
	constructor(private client: MetabaseClient) {}

	async executeQuery(
		databaseId: number,
		query: string,
		templateTags?: Record<string, unknown>,
	): Promise<unknown> {
		const datasetQuery: Record<string, unknown> = {
			database: databaseId,
			type: "native",
			native: { query, "template-tags": templateTags ?? {} },
		};
		return this.client.post("/api/dataset", datasetQuery);
	}

	async exportQueryResults(
		databaseId: number,
		query: string,
		format: "csv" | "json" | "xlsx",
	): Promise<unknown> {
		const datasetQuery: Record<string, unknown> = {
			database: databaseId,
			type: "native",
			native: { query },
		};
		return this.client.post(`/api/dataset/${format}`, datasetQuery);
	}

	async convertToNativeSql(datasetQuery: Record<string, unknown>): Promise<unknown> {
		return this.client.post("/api/dataset/native", { query: datasetQuery });
	}
}

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { QueryService } from "../services/query-service.js";
import type { MetabaseClient } from "../services/metabase-client.js";
import { optimizeQueryResult, formatResponse } from "../utils/response.js";

export function registerQueryTools(server: McpServer, client: MetabaseClient): number {
	const service = new QueryService(client);

	server.tool(
		"execute_query",
		"Execute a native SQL query against a Metabase database. Returns rows as JSON. Max 2000 rows — use export_query_results for larger datasets.",
		{
			database_id: z.number().describe("Database ID to query"),
			query: z.string().describe("SQL query to execute"),
			template_tags: z
				.record(z.unknown())
				.optional()
				.describe("Template tag values for parameterized queries"),
		},
		async ({ database_id, query, template_tags }) => {
			try {
				const result = await service.executeQuery(database_id, query, template_tags);
				return { content: [{ type: "text", text: optimizeQueryResult(result) }] };
			} catch (error) {
				return {
					content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
					isError: true,
				};
			}
		},
	);

	server.tool(
		"export_query_results",
		"Execute a SQL query and export results in CSV, JSON, or XLSX format. Supports up to 1M rows.",
		{
			database_id: z.number().describe("Database ID to query"),
			query: z.string().describe("SQL query to execute"),
			format: z.enum(["csv", "json", "xlsx"]).describe("Export format"),
		},
		async ({ database_id, query, format }) => {
			try {
				const result = await service.exportQueryResults(database_id, query, format);
				return { content: [{ type: "text", text: formatResponse(result) }] };
			} catch (error) {
				return {
					content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
					isError: true,
				};
			}
		},
	);

	server.tool(
		"convert_to_native_sql",
		"Convert an MBQL (Metabase Query Language) query to native SQL. Useful for debugging or understanding MBQL queries.",
		{
			dataset_query: z
				.object({
					database: z.number(),
					type: z.string(),
					query: z.record(z.unknown()),
				})
				.describe("MBQL dataset query to convert"),
		},
		async ({ dataset_query }) => {
			try {
				const result = await service.convertToNativeSql(dataset_query);
				return { content: [{ type: "text", text: formatResponse(result) }] };
			} catch (error) {
				return {
					content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
					isError: true,
				};
			}
		},
	);

	return 3;
}

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SearchService } from "../services/search-service.js";
import type { MetabaseClient } from "../services/metabase-client.js";
import { optimizeList, formatResponse } from "../utils/response.js";

export function registerSearchTools(server: McpServer, client: MetabaseClient): number {
	const service = new SearchService(client);

	server.tool(
		"search",
		"Search across all Metabase content — cards, dashboards, collections, tables, databases.",
		{
			q: z.string().optional().describe("Search query string"),
			models: z.array(z.enum(["card", "dashboard", "collection", "table", "database", "pulse", "segment"])).optional().describe("Filter by model types"),
			archived: z.boolean().optional().describe("Search archived items"),
			limit: z.number().optional().describe("Max results"),
			offset: z.number().optional().describe("Pagination offset"),
		},
		async (params) => {
			try {
				const result = await service.search(params);
				return { content: [{ type: "text", text: optimizeList(result) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	server.tool(
		"get_recent_views",
		"Get recently viewed items for the current user.",
		{},
		async () => {
			try {
				const result = await service.getRecentViews();
				return { content: [{ type: "text", text: optimizeList(result) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	server.tool(
		"get_current_user",
		"Get details about the currently authenticated Metabase user.",
		{},
		async () => {
			try {
				const result = await service.getCurrentUser();
				return { content: [{ type: "text", text: formatResponse(result) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	server.tool(
		"invalidate_cache",
		"Invalidate cached query results. Can target a specific database or dashboard. Requires write access.",
		{
			database: z.number().optional().describe("Invalidate cache for this database ID"),
			dashboard: z.number().optional().describe("Invalidate cache for this dashboard ID"),
		},
		async (params) => {
			try {
				const result = await service.invalidateCache(params);
				return { content: [{ type: "text", text: formatResponse(result) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	return 4;
}

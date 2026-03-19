import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CollectionService } from "../services/collection-service.js";
import type { MetabaseClient } from "../services/metabase-client.js";
import { optimizeList, optimizeDetail } from "../utils/response.js";

export function registerCollectionTools(server: McpServer, client: MetabaseClient): number {
	const service = new CollectionService(client);

	server.tool(
		"list_collections",
		"List all collections (folders) in Metabase.",
		{ archived: z.boolean().optional().describe("Include archived collections") },
		async ({ archived }) => {
			try {
				const result = await service.listCollections(archived);
				return { content: [{ type: "text", text: optimizeList(result) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	server.tool(
		"get_collection",
		"Get details for a specific collection. Use 'root' for the root collection.",
		{ id: z.union([z.number(), z.literal("root")]).describe("Collection ID or 'root'") },
		async ({ id }) => {
			try {
				const result = await service.getCollection(id);
				return { content: [{ type: "text", text: optimizeDetail(result) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	server.tool(
		"get_collection_items",
		"List items inside a collection. Supports filtering by model type and pagination.",
		{
			id: z.union([z.number(), z.literal("root")]).describe("Collection ID or 'root'"),
			models: z.array(z.enum(["card", "dashboard", "collection", "pulse"])).optional().describe("Filter by model type"),
			limit: z.number().optional().describe("Max items to return"),
			offset: z.number().optional().describe("Pagination offset"),
		},
		async ({ id, models, limit, offset }) => {
			try {
				const result = await service.getCollectionItems(id, { models, limit, offset });
				return { content: [{ type: "text", text: optimizeList(result) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	server.tool(
		"get_collection_tree",
		"Get the full collection hierarchy as a tree structure.",
		{},
		async () => {
			try {
				const result = await service.getCollectionTree();
				return { content: [{ type: "text", text: optimizeList(result) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	server.tool(
		"create_collection",
		"Create a new collection (folder). Requires write access.",
		{
			name: z.string().describe("Collection name"),
			description: z.string().optional().describe("Collection description"),
			parent_id: z.number().optional().describe("Parent collection ID (omit for root)"),
			color: z.string().optional().describe("Collection color hex code"),
		},
		async (params) => {
			try {
				const result = await service.createCollection(params);
				return { content: [{ type: "text", text: optimizeDetail(result) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	server.tool(
		"update_collection",
		"Update a collection's name, description, color, or archived status. Requires write access.",
		{
			id: z.number().describe("Collection ID"),
			name: z.string().optional().describe("New name"),
			description: z.string().optional().describe("New description"),
			color: z.string().optional().describe("New color hex code"),
			archived: z.boolean().optional().describe("Archive/unarchive the collection"),
			parent_id: z.number().optional().describe("Move to a different parent collection"),
		},
		async ({ id, ...updates }) => {
			try {
				const result = await service.updateCollection(id, updates);
				return { content: [{ type: "text", text: optimizeDetail(result) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	return 6;
}

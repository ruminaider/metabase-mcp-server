import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { MetabaseClient } from "../services/metabase-client.js";
import { RevisionService } from "../services/revision-service.js";
import { formatResponse, optimizeList } from "../utils/response.js";

export function registerRevisionTools(server: McpServer, client: MetabaseClient): number {
	const service = new RevisionService(client);

	server.tool(
		"get_revisions",
		"Get the revision history for a card or dashboard. Shows who changed what and when.",
		{
			entity: z.enum(["card", "dashboard"]).describe("Entity type"),
			id: z.number().describe("Entity ID"),
		},
		async ({ entity, id }) => {
			try {
				const result = await service.getRevisions(entity, id);
				return { content: [{ type: "text", text: optimizeList(result) }] };
			} catch (error) {
				return {
					content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
					isError: true,
				};
			}
		},
	);

	server.tool(
		"revert_revision",
		"Revert a card or dashboard to a previous revision. Requires write access.",
		{
			entity: z.enum(["card", "dashboard"]).describe("Entity type"),
			id: z.number().describe("Entity ID"),
			revision_id: z.number().describe("Revision ID to revert to"),
		},
		async (params) => {
			try {
				const result = await service.revertRevision(params);
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
		"toggle_bookmark",
		"Add or remove a bookmark on a card, dashboard, or collection. Requires write access.",
		{
			model: z.enum(["card", "dashboard", "collection"]).describe("Item type to bookmark"),
			id: z.number().describe("Item ID"),
			action: z.enum(["create", "delete"]).describe("Add or remove the bookmark"),
		},
		async ({ model, id, action }) => {
			try {
				const result = await service.toggleBookmark(model, id, action);
				return { content: [{ type: "text", text: formatResponse(result ?? "OK") }] };
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

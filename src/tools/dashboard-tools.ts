import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DashboardService } from "../services/dashboard-service.js";
import type { MetabaseClient } from "../services/metabase-client.js";
import { optimizeDetail, optimizeList } from "../utils/response.js";

export function registerDashboardTools(server: McpServer, client: MetabaseClient): number {
	const service = new DashboardService(client);

	server.tool(
		"list_dashboards",
		"List all dashboards in Metabase.",
		{ f: z.enum(["all", "mine", "archived"]).optional().describe("Filter category") },
		async ({ f }) => {
			try {
				const result = await service.listDashboards(f);
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
		"get_dashboard",
		"Get a dashboard by ID, including all its cards, parameters, and layout.",
		{
			id: z
				.union([z.number(), z.array(z.number())])
				.describe("Dashboard ID or array of Dashboard IDs for batch retrieval"),
		},
		async ({ id }) => {
			try {
				if (Array.isArray(id)) {
					const results = await service.getDashboards(id);
					return { content: [{ type: "text", text: optimizeDetail(results) }] };
				}
				const result = await service.getDashboard(id);
				return { content: [{ type: "text", text: optimizeDetail(result) }] };
			} catch (error) {
				return {
					content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
					isError: true,
				};
			}
		},
	);

	server.tool(
		"create_dashboard",
		"Create a new dashboard. Requires write access.",
		{
			name: z.string().describe("Dashboard name"),
			description: z.string().optional().describe("Dashboard description"),
			collection_id: z.number().optional().describe("Collection to save the dashboard in"),
			parameters: z.array(z.record(z.unknown())).optional().describe("Dashboard filter parameters"),
		},
		async (params) => {
			try {
				const result = await service.createDashboard(params);
				return { content: [{ type: "text", text: optimizeDetail(result) }] };
			} catch (error) {
				return {
					content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
					isError: true,
				};
			}
		},
	);

	server.tool(
		"update_dashboard",
		"Update a dashboard's name, description, parameters, or collection. Requires write access.",
		{
			id: z.number().describe("Dashboard ID"),
			name: z.string().optional().describe("New name"),
			description: z.string().optional().describe("New description"),
			collection_id: z.number().optional().describe("Move to a different collection"),
			parameters: z.array(z.record(z.unknown())).optional().describe("Updated filter parameters"),
		},
		async ({ id, ...updates }) => {
			try {
				const result = await service.updateDashboard(id, updates);
				return { content: [{ type: "text", text: optimizeDetail(result) }] };
			} catch (error) {
				return {
					content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
					isError: true,
				};
			}
		},
	);

	server.tool(
		"copy_dashboard",
		"Duplicate a dashboard and optionally move the copy to a different collection. Requires write access.",
		{
			id: z.number().describe("Dashboard ID to copy"),
			name: z.string().optional().describe("Name for the copy"),
			description: z.string().optional().describe("Description for the copy"),
			collection_id: z.number().optional().describe("Collection for the copy"),
		},
		async ({ id, ...options }) => {
			try {
				const result = await service.copyDashboard(id, options);
				return { content: [{ type: "text", text: optimizeDetail(result) }] };
			} catch (error) {
				return {
					content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
					isError: true,
				};
			}
		},
	);

	server.tool(
		"update_dashboard_cards",
		"Set the full list of cards on a dashboard — add, remove, reposition, or resize cards in one call. Requires write access.",
		{
			id: z.number().describe("Dashboard ID"),
			cards: z
				.array(z.record(z.unknown()))
				.describe(
					"Array of card objects with id, card_id, row, col, size_x, size_y, parameter_mappings, etc.",
				),
		},
		async ({ id, cards }) => {
			try {
				const result = await service.updateDashboardCards(id, cards);
				return { content: [{ type: "text", text: optimizeDetail(result) }] };
			} catch (error) {
				return {
					content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
					isError: true,
				};
			}
		},
	);

	server.tool(
		"archive_dashboard",
		"Archive (soft-delete) a dashboard. Moves it to the Trash collection. Requires write access.",
		{ id: z.number().describe("Dashboard ID to archive") },
		async ({ id }) => {
			try {
				const result = await service.archiveDashboard(id);
				return { content: [{ type: "text", text: optimizeDetail(result) }] };
			} catch (error) {
				return {
					content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
					isError: true,
				};
			}
		},
	);

	server.tool(
		"get_dashboard_metadata",
		"Get consolidated query metadata for all cards on a dashboard.",
		{ id: z.number().describe("Dashboard ID") },
		async ({ id }) => {
			try {
				const result = await service.getDashboardMetadata(id);
				return { content: [{ type: "text", text: optimizeDetail(result) }] };
			} catch (error) {
				return {
					content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
					isError: true,
				};
			}
		},
	);

	return 8;
}

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CardService } from "../services/card-service.js";
import type { MetabaseClient } from "../services/metabase-client.js";

export function registerCardTools(server: McpServer, client: MetabaseClient): number {
	const service = new CardService(client);

	server.tool(
		"list_cards",
		"List saved questions/cards in Metabase. Filter by category.",
		{
			f: z.enum(["all", "archived", "mine", "popular", "recent"]).optional().describe("Filter category"),
			model_id: z.number().optional().describe("Filter by model ID"),
		},
		async (params) => {
			try {
				const result = await service.listCards(params);
				return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	server.tool(
		"get_card",
		"Get a saved question/card by ID, including its query definition and visualization settings.",
		{ id: z.number().describe("Card ID") },
		async ({ id }) => {
			try {
				const result = await service.getCard(id);
				return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	server.tool(
		"create_card",
		"Create a new saved question/card. Requires write access.",
		{
			name: z.string().describe("Card name"),
			dataset_query: z.record(z.unknown()).describe("Query definition (native SQL or MBQL)"),
			display: z.string().describe("Visualization type (e.g. table, bar, line, scalar, pie)"),
			description: z.string().optional().describe("Card description"),
			collection_id: z.number().optional().describe("Collection to save the card in"),
			visualization_settings: z.record(z.unknown()).optional().describe("Visualization config"),
		},
		async (params) => {
			try {
				const result = await service.createCard(params);
				return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	server.tool(
		"update_card",
		"Update a saved question/card — name, description, query, display, collection, or visualization settings. Requires write access.",
		{
			id: z.number().describe("Card ID"),
			name: z.string().optional().describe("New name"),
			description: z.string().optional().describe("New description"),
			dataset_query: z.record(z.unknown()).optional().describe("New query definition"),
			display: z.string().optional().describe("New visualization type"),
			collection_id: z.number().optional().describe("Move to a different collection"),
			visualization_settings: z.record(z.unknown()).optional().describe("New visualization config"),
		},
		async ({ id, ...updates }) => {
			try {
				const result = await service.updateCard(id, updates);
				return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	server.tool(
		"copy_card",
		"Duplicate a saved question/card. Requires write access.",
		{ id: z.number().describe("Card ID to copy") },
		async ({ id }) => {
			try {
				const result = await service.copyCard(id);
				return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	server.tool(
		"execute_card",
		"Execute a saved question/card and return results. Max 2000 rows — use export_card_results for larger datasets.",
		{
			id: z.number().describe("Card ID"),
			parameters: z.array(z.record(z.unknown())).optional().describe("Filter parameter values"),
			ignore_cache: z.boolean().optional().describe("Bypass cached results"),
		},
		async ({ id, parameters, ignore_cache }) => {
			try {
				const result = await service.executeCard(id, parameters, ignore_cache);
				return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	server.tool(
		"export_card_results",
		"Execute a saved question/card and export results as CSV, JSON, or XLSX. Supports up to 1M rows.",
		{
			id: z.number().describe("Card ID"),
			format: z.enum(["csv", "json", "xlsx"]).describe("Export format"),
		},
		async ({ id, format }) => {
			try {
				const result = await service.exportCardResults(id, format);
				return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	server.tool(
		"get_card_metadata",
		"Get consolidated field, database, and table metadata for a card's query.",
		{ id: z.number().describe("Card ID") },
		async ({ id }) => {
			try {
				const result = await service.getCardMetadata(id);
				return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	server.tool(
		"list_card_dashboards",
		"List all dashboards that contain a specific card.",
		{ id: z.number().describe("Card ID") },
		async ({ id }) => {
			try {
				const result = await service.listCardDashboards(id);
				return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	server.tool(
		"archive_card",
		"Archive (soft-delete) a saved question/card. Moves it to the Trash collection. Requires write access.",
		{ id: z.number().describe("Card ID to archive") },
		async ({ id }) => {
			try {
				const result = await service.archiveCard(id);
				return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	return 10;
}

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TableService } from "../services/table-service.js";
import type { MetabaseClient } from "../services/metabase-client.js";

export function registerTableTools(server: McpServer, client: MetabaseClient): number {
	const service = new TableService(client);

	server.tool(
		"list_tables",
		"List all tables across all databases in Metabase.",
		{},
		async () => {
			try {
				const result = await service.listTables();
				return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	server.tool(
		"get_table",
		"Get details for a specific table by ID.",
		{
			id: z.union([z.number(), z.array(z.number())]).describe("Table ID or array of Table IDs for batch retrieval"),
		},
		async ({ id }) => {
			try {
				if (Array.isArray(id)) {
					const results = await service.getTables(id);
					return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
				}
				const result = await service.getTable(id);
				return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	server.tool(
		"get_table_metadata",
		"Get full metadata for a table including all fields, foreign keys, and field values.",
		{
			id: z.number().describe("Table ID"),
			include_sensitive_fields: z.boolean().optional().describe("Include sensitive fields in response"),
		},
		async ({ id, include_sensitive_fields }) => {
			try {
				const result = await service.getTableMetadata(id, include_sensitive_fields);
				return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	server.tool(
		"get_table_fks",
		"Get all foreign key relationships for a table.",
		{ id: z.number().describe("Table ID") },
		async ({ id }) => {
			try {
				const result = await service.getTableFks(id);
				return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	server.tool(
		"get_field",
		"Get details for a specific field by ID.",
		{ id: z.number().describe("Field ID") },
		async ({ id }) => {
			try {
				const result = await service.getField(id);
				return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	server.tool(
		"get_field_values",
		"Get distinct values for a field. Only works for fields with has_field_values='list'.",
		{ id: z.number().describe("Field ID") },
		async ({ id }) => {
			try {
				const result = await service.getFieldValues(id);
				return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	server.tool(
		"update_field",
		"Update a field's metadata (display name, description, semantic type, visibility). Requires write access.",
		{
			id: z.number().describe("Field ID"),
			display_name: z.string().optional().describe("New display name"),
			description: z.string().optional().describe("New description"),
			semantic_type: z.string().optional().describe("Semantic type (e.g. type/FK, type/Category)"),
			visibility_type: z.enum(["normal", "details-only", "hidden", "sensitive"]).optional().describe("Visibility"),
			has_field_values: z.enum(["none", "list", "search"]).optional().describe("How field values are fetched"),
		},
		async ({ id, ...updates }) => {
			try {
				const result = await service.updateField(id, updates);
				return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }], isError: true };
			}
		},
	);

	return 7;
}

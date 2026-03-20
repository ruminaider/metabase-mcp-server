import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DatabaseService } from "../services/database-service.js";
import type { MetabaseClient } from "../services/metabase-client.js";
import { optimizeDetail, optimizeList } from "../utils/response.js";

export function registerDatabaseTools(server: McpServer, client: MetabaseClient): number {
	const service = new DatabaseService(client);

	server.tool(
		"list_databases",
		"List all databases connected to Metabase.",
		{
			include_cards: z.boolean().optional().describe("Include saved questions as virtual tables"),
		},
		async ({ include_cards }) => {
			try {
				const result = await service.listDatabases(include_cards);
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
		"get_database",
		"Get details for a specific database by ID.",
		{ id: z.number().describe("Database ID") },
		async ({ id }) => {
			try {
				const result = await service.getDatabase(id);
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
		"get_database_metadata",
		"Get full metadata for a database including all tables, fields, and foreign keys.",
		{ id: z.number().describe("Database ID") },
		async ({ id }) => {
			try {
				const result = await service.getDatabaseMetadata(id);
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
		"list_database_schemas",
		"List all schemas in a database.",
		{ id: z.number().describe("Database ID") },
		async ({ id }) => {
			try {
				const result = await service.listDatabaseSchemas(id);
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
		"list_schema_tables",
		"List all tables in a specific database schema.",
		{
			database_id: z.number().describe("Database ID"),
			schema: z.string().describe("Schema name"),
		},
		async ({ database_id, schema }) => {
			try {
				const result = await service.listSchemaTables(database_id, schema);
				return { content: [{ type: "text", text: optimizeDetail(result) }] };
			} catch (error) {
				return {
					content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
					isError: true,
				};
			}
		},
	);

	return 5;
}

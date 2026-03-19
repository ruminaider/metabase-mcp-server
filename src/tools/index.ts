import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../services/metabase-client.js";
import { registerQueryTools } from "./query-tools.js";

export function registerAllTools(server: McpServer, client: MetabaseClient): number {
	let count = 0;
	count += registerQueryTools(server, client);
	return count;
}

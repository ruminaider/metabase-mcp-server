import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "./services/metabase-client.js";
import { registerAllTools } from "./tools/index.js";
import { logger } from "./utils/logger.js";

export function createServer(client: MetabaseClient): McpServer {
	const server = new McpServer({
		name: "metabase-mcp-server",
		version: "0.1.0",
	});

	const toolCount = registerAllTools(server, client);
	logger.info(`Registered ${toolCount} tools`);

	return server;
}

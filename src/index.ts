#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { createServer } from "./server.js";
import { MetabaseClient } from "./services/metabase-client.js";
import { initReadOnlyGuard } from "./utils/read-only-guard.js";
import { logger } from "./utils/logger.js";

async function main() {
	const config = loadConfig();
	logger.info(
		`Connecting to ${config.url} (auth: ${config.authMethod}, read-only: ${config.readOnly})`,
	);

	initReadOnlyGuard(config);
	const client = new MetabaseClient(config);
	const server = createServer(client);
	const transport = new StdioServerTransport();
	await server.connect(transport);

	logger.info("Metabase MCP server running on stdio");
}

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

main().catch((error) => {
	logger.error("Fatal error:", error);
	process.exit(1);
});

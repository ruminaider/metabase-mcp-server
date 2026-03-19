import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../services/metabase-client.js";
import { registerCardTools } from "./card-tools.js";
import { registerCollectionTools } from "./collection-tools.js";
import { registerDashboardTools } from "./dashboard-tools.js";
import { registerDatabaseTools } from "./database-tools.js";
import { registerQueryTools } from "./query-tools.js";
import { registerRevisionTools } from "./revision-tools.js";
import { registerSearchTools } from "./search-tools.js";
import { registerTableTools } from "./table-tools.js";

export function registerAllTools(server: McpServer, client: MetabaseClient): number {
	let count = 0;
	count += registerQueryTools(server, client);
	count += registerDatabaseTools(server, client);
	count += registerTableTools(server, client);
	count += registerCollectionTools(server, client);
	count += registerSearchTools(server, client);
	count += registerCardTools(server, client);
	count += registerDashboardTools(server, client);
	count += registerRevisionTools(server, client);
	return count;
}

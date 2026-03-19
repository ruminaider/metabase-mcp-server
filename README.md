# metabase-mcp-server

A comprehensive MCP server for Metabase with full read/write support -- 46 tools for cards, dashboards, databases, collections, queries, and more.

[![npm version](https://img.shields.io/npm/v/@ruminaider/metabase-mcp-server)](https://www.npmjs.com/package/@ruminaider/metabase-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Quick Start

### Using npx

Add to your `.mcp.json`:

```json
{
  "mcpServers": {
    "metabase": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@ruminaider/metabase-mcp-server"],
      "env": {
        "METABASE_URL": "https://your-instance.metabaseapp.com",
        "METABASE_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Using Docker

```bash
docker build -t metabase-mcp-server .
```

```json
{
  "mcpServers": {
    "metabase": {
      "type": "stdio",
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "METABASE_URL", "-e", "METABASE_API_KEY", "metabase-mcp-server"],
      "env": {
        "METABASE_URL": "https://your-instance.metabaseapp.com",
        "METABASE_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Authentication

The server supports three authentication methods, tried in priority order:

| Priority | Method | Environment Variables | Notes |
|----------|--------|-----------------------|-------|
| 1 | API Key | `METABASE_API_KEY` | Recommended. Create one in Metabase Admin > Settings > Authentication > API Keys. |
| 2 | Session Token | `METABASE_SESSION_TOKEN` | Short-lived token from the Metabase API (`POST /api/session`). |
| 3 | Email + Password | `METABASE_USER_EMAIL` + `METABASE_PASSWORD` | The server exchanges credentials for a session token on startup. |

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `METABASE_URL` | Yes | Metabase instance URL (e.g. `https://analytics.example.com`) |
| `METABASE_API_KEY` | * | API key for authentication |
| `METABASE_SESSION_TOKEN` | * | Session token for authentication |
| `METABASE_USER_EMAIL` | * | Email for email/password authentication |
| `METABASE_PASSWORD` | * | Password (required when `METABASE_USER_EMAIL` is set) |
| `METABASE_READ_ONLY` | No | Set to `true` to block all write operations (default: `false`) |

\* At least one authentication method is required.

## Read-Only Mode

Set `METABASE_READ_ONLY=true` to block all write operations. The server will reject any tool call that would create, update, archive, or delete content, returning a clear error message. This is useful for providing safe, read-only access to your Metabase instance.

Write-protected tools include: `create_card`, `update_card`, `archive_card`, `copy_card`, `create_dashboard`, `update_dashboard`, `archive_dashboard`, `copy_dashboard`, `update_dashboard_cards`, `create_collection`, `update_collection`, `update_field`, `revert_revision`, `toggle_bookmark`, and `invalidate_cache`.

## Tools

### Cards (Saved Questions) -- 10 tools

| Tool | Description |
|------|-------------|
| `list_cards` | List saved questions/cards, with optional category filter |
| `get_card` | Get a card by ID, including query definition and visualization settings |
| `create_card` | Create a new saved question/card |
| `update_card` | Update a card's name, description, query, display, or collection |
| `copy_card` | Duplicate a saved question/card |
| `execute_card` | Execute a saved question and return results (max 2000 rows) |
| `export_card_results` | Execute a card and export results as CSV, JSON, or XLSX (up to 1M rows) |
| `get_card_metadata` | Get field, database, and table metadata for a card's query |
| `list_card_dashboards` | List all dashboards that contain a specific card |
| `archive_card` | Archive (soft-delete) a card |

### Dashboards -- 8 tools

| Tool | Description |
|------|-------------|
| `list_dashboards` | List all dashboards, with optional category filter |
| `get_dashboard` | Get a dashboard by ID, including cards, parameters, and layout |
| `create_dashboard` | Create a new dashboard |
| `update_dashboard` | Update a dashboard's name, description, parameters, or collection |
| `copy_dashboard` | Duplicate a dashboard, optionally to a different collection |
| `update_dashboard_cards` | Set the full list of cards on a dashboard (add, remove, reposition, resize) |
| `archive_dashboard` | Archive (soft-delete) a dashboard |
| `get_dashboard_metadata` | Get consolidated query metadata for all cards on a dashboard |

### Databases -- 5 tools

| Tool | Description |
|------|-------------|
| `list_databases` | List all connected databases |
| `get_database` | Get details for a specific database |
| `get_database_metadata` | Get full metadata including all tables, fields, and foreign keys |
| `list_database_schemas` | List all schemas in a database |
| `list_schema_tables` | List all tables in a specific schema |

### Tables & Fields -- 7 tools

| Tool | Description |
|------|-------------|
| `list_tables` | List all tables across all databases |
| `get_table` | Get details for a specific table |
| `get_table_metadata` | Get full metadata including fields, foreign keys, and field values |
| `get_table_fks` | Get all foreign key relationships for a table |
| `get_field` | Get details for a specific field |
| `get_field_values` | Get distinct values for a field |
| `update_field` | Update a field's display name, description, semantic type, or visibility |

### Queries -- 3 tools

| Tool | Description |
|------|-------------|
| `execute_query` | Execute a native SQL query (max 2000 rows) |
| `export_query_results` | Execute a SQL query and export as CSV, JSON, or XLSX (up to 1M rows) |
| `convert_to_native_sql` | Convert an MBQL query to native SQL |

### Collections -- 6 tools

| Tool | Description |
|------|-------------|
| `list_collections` | List all collections (folders) |
| `get_collection` | Get details for a collection (use `"root"` for the root collection) |
| `get_collection_items` | List items in a collection, with type filtering and pagination |
| `get_collection_tree` | Get the full collection hierarchy as a tree |
| `create_collection` | Create a new collection |
| `update_collection` | Update a collection's name, description, color, or archived status |

### Search & Activity -- 4 tools

| Tool | Description |
|------|-------------|
| `search` | Search across all content types (cards, dashboards, collections, tables, databases) |
| `get_recent_views` | Get recently viewed items for the current user |
| `get_current_user` | Get details about the currently authenticated user |
| `invalidate_cache` | Invalidate cached query results for a database or dashboard |

### Revisions & Bookmarks -- 3 tools

| Tool | Description |
|------|-------------|
| `get_revisions` | Get the revision history for a card or dashboard |
| `revert_revision` | Revert a card or dashboard to a previous revision |
| `toggle_bookmark` | Add or remove a bookmark on a card, dashboard, or collection |

## Development

```bash
pnpm install       # install dependencies
pnpm build         # compile TypeScript
pnpm test          # run tests
pnpm dev           # watch mode (recompile on change)
pnpm lint          # lint with Biome
pnpm lint:fix      # auto-fix lint issues
pnpm typecheck     # type-check without emitting
```

### Project Structure

```
src/
  index.ts                   # Entry point (stdio transport)
  server.ts                  # MCP server creation and tool registration
  config.ts                  # Environment variable parsing and auth detection
  services/
    metabase-client.ts       # HTTP client with auth, retry, and error handling
    card-service.ts          # Card (saved question) CRUD and execution
    collection-service.ts    # Collection CRUD and tree navigation
    dashboard-service.ts     # Dashboard CRUD and card management
    database-service.ts      # Database and schema introspection
    query-service.ts         # Raw SQL execution and export
    revision-service.ts      # Revision history, revert, and bookmarks
    search-service.ts        # Cross-content search and activity
    table-service.ts         # Table/field introspection and metadata
    *.test.ts                # Unit tests for each service
  tools/
    index.ts                 # Wires all tool categories into the MCP server
    card-tools.ts            # Card tool definitions
    collection-tools.ts      # Collection tool definitions
    dashboard-tools.ts       # Dashboard tool definitions
    database-tools.ts        # Database tool definitions
    query-tools.ts           # Query tool definitions
    revision-tools.ts        # Revision/bookmark tool definitions
    search-tools.ts          # Search/activity tool definitions
    table-tools.ts           # Table/field tool definitions
  utils/
    errors.ts                # Custom error types (ReadOnlyError, etc.)
    logger.ts                # Structured logging
    read-only-guard.ts       # Write-operation guard for read-only mode
    retry.ts                 # Retry logic for transient failures
```

### Adding a New Tool

1. Add or extend a service method in `src/services/`
2. Register the tool in the appropriate `src/tools/*-tools.ts` file using `server.tool()`
3. Increment the return count in the registration function
4. If adding a new tool category, import and call the registration function in `src/tools/index.ts`
5. Run `pnpm build && pnpm test` to verify

## License

MIT

/**
 * Response optimization for MCP tool outputs.
 * Strips heavy metadata fields and uses compact JSON to reduce token usage.
 */

// Fields to always strip from any Metabase API response
const GLOBAL_STRIP_FIELDS = new Set([
	"result_metadata",
	"metabase_version",
	"enable_embedding",
	"embedding_params",
	"cache_invalidated_at",
	"cache_ttl",
	"made_public_by_id",
	"public_uuid",
	"entity_id",
	"can_run_adhoc_query",
	"can_restore",
	"can_delete",
	"can_manage_db",
	"moderation_reviews",
	"parameter_usage_count",
	"archived_directly",
	"collection_preview",
	"card_schema",
	"is_write",
]);

// Additional fields to strip from list responses (more aggressive)
const LIST_STRIP_FIELDS = new Set([
	...GLOBAL_STRIP_FIELDS,
	"visualization_settings",
	"dataset_query",
	"parameters",
	"parameter_mappings",
	"creator",
	"last_query_start",
	"last_used_at",
	"dashboard_count",
	"collection_position",
	"creator_id",
	"view_count",
	"query_average_duration",
	"last-edit-info",
]);

function stripFields(obj: unknown, fieldsToStrip: Set<string>): unknown {
	if (obj === null || obj === undefined) return obj;
	if (Array.isArray(obj)) return obj.map((item) => stripFields(item, fieldsToStrip));
	if (typeof obj !== "object") return obj;

	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
		if (fieldsToStrip.has(key)) continue;
		// Recursively strip nested objects, but not too deep (max 3 levels)
		result[key] =
			typeof value === "object" && value !== null ? stripFields(value, fieldsToStrip) : value;
	}
	return result;
}

/**
 * Optimize a detail response (get_card, get_dashboard, etc.)
 * Strips metadata bloat while keeping functional fields.
 */
export function optimizeDetail(data: unknown): string {
	return JSON.stringify(stripFields(data, GLOBAL_STRIP_FIELDS));
}

/**
 * Optimize a list response (list_cards, list_dashboards, etc.)
 * More aggressive stripping — only identifiers and essential fields.
 */
export function optimizeList(data: unknown): string {
	return JSON.stringify(stripFields(data, LIST_STRIP_FIELDS));
}

/**
 * Optimize a query execution response.
 * Converts Metabase's {rows: [[v1,v2]], cols: [{name:"a"},{name:"b"}]} format
 * into a flat array of objects: [{"a": v1, "b": v2}]
 */
export function optimizeQueryResult(data: unknown): string {
	if (data && typeof data === "object" && "data" in data) {
		const dataset = (data as Record<string, unknown>).data as Record<string, unknown> | undefined;
		if (dataset && Array.isArray(dataset.rows) && Array.isArray(dataset.cols)) {
			const colNames = (dataset.cols as Array<{ name: string }>).map((c) => c.name);
			const rows = (dataset.rows as unknown[][]).map((row) => {
				const obj: Record<string, unknown> = {};
				for (let i = 0; i < colNames.length; i++) {
					obj[colNames[i]] = row[i];
				}
				return obj;
			});
			const result: Record<string, unknown> = {
				row_count: (data as Record<string, unknown>).row_count,
				status: (data as Record<string, unknown>).status,
				rows,
			};
			return JSON.stringify(result);
		}
	}
	// Fallback: just compact JSON
	return JSON.stringify(data);
}

/**
 * Format a response for MCP tool output — compact JSON with no extra whitespace.
 */
export function formatResponse(data: unknown): string {
	return JSON.stringify(data);
}

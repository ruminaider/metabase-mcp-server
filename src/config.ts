export type AuthMethod = "api-key" | "session-token" | "email-password";

export interface Config {
	url: string;
	authMethod: AuthMethod;
	apiKey?: string;
	sessionToken?: string;
	email?: string;
	password?: string;
	readOnly: boolean;
}

export function loadConfig(): Config {
	const url = process.env.METABASE_URL?.replace(/\/+$/, "");
	if (!url) {
		throw new Error("METABASE_URL environment variable is required");
	}

	const apiKey = process.env.METABASE_API_KEY;
	const sessionToken = process.env.METABASE_SESSION_TOKEN;
	const email = process.env.METABASE_USER_EMAIL;
	const password = process.env.METABASE_PASSWORD;
	const readOnly = process.env.METABASE_READ_ONLY === "true";

	let authMethod: AuthMethod;

	if (apiKey) {
		authMethod = "api-key";
	} else if (sessionToken) {
		authMethod = "session-token";
	} else if (email) {
		if (!password) {
			throw new Error("METABASE_PASSWORD is required when METABASE_USER_EMAIL is provided");
		}
		authMethod = "email-password";
	} else {
		throw new Error(
			"No authentication method provided. Set one of: METABASE_API_KEY, " +
				"METABASE_SESSION_TOKEN, or METABASE_USER_EMAIL + METABASE_PASSWORD",
		);
	}

	return { url, authMethod, apiKey, sessionToken, email, password, readOnly };
}

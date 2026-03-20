import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadConfig } from "./config.js";

describe("loadConfig", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		process.env = { ...originalEnv };
		process.env.METABASE_URL = undefined;
		process.env.METABASE_API_KEY = undefined;
		process.env.METABASE_SESSION_TOKEN = undefined;
		process.env.METABASE_USER_EMAIL = undefined;
		process.env.METABASE_PASSWORD = undefined;
		process.env.METABASE_READ_ONLY = undefined;
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("throws if METABASE_URL is missing", () => {
		expect(() => loadConfig()).toThrow("METABASE_URL");
	});

	it("throws if no auth method is provided", () => {
		process.env.METABASE_URL = "https://metabase.example.com";
		expect(() => loadConfig()).toThrow("authentication");
	});

	it("prefers API key over other auth methods", () => {
		process.env.METABASE_URL = "https://metabase.example.com";
		process.env.METABASE_API_KEY = "mb_key_123";
		process.env.METABASE_SESSION_TOKEN = "session_456";
		const config = loadConfig();
		expect(config.authMethod).toBe("api-key");
		expect(config.apiKey).toBe("mb_key_123");
	});

	it("falls back to session token when no API key", () => {
		process.env.METABASE_URL = "https://metabase.example.com";
		process.env.METABASE_SESSION_TOKEN = "session_456";
		const config = loadConfig();
		expect(config.authMethod).toBe("session-token");
	});

	it("falls back to email/password when no key or token", () => {
		process.env.METABASE_URL = "https://metabase.example.com";
		process.env.METABASE_USER_EMAIL = "user@example.com";
		process.env.METABASE_PASSWORD = "password123";
		const config = loadConfig();
		expect(config.authMethod).toBe("email-password");
	});

	it("throws if only email is provided without password", () => {
		process.env.METABASE_URL = "https://metabase.example.com";
		process.env.METABASE_USER_EMAIL = "user@example.com";
		expect(() => loadConfig()).toThrow("METABASE_PASSWORD");
	});

	it("defaults readOnly to false", () => {
		process.env.METABASE_URL = "https://metabase.example.com";
		process.env.METABASE_API_KEY = "mb_key_123";
		const config = loadConfig();
		expect(config.readOnly).toBe(false);
	});

	it("parses METABASE_READ_ONLY=true", () => {
		process.env.METABASE_URL = "https://metabase.example.com";
		process.env.METABASE_API_KEY = "mb_key_123";
		process.env.METABASE_READ_ONLY = "true";
		const config = loadConfig();
		expect(config.readOnly).toBe(true);
	});

	it("strips trailing slash from URL", () => {
		process.env.METABASE_URL = "https://metabase.example.com/";
		process.env.METABASE_API_KEY = "mb_key_123";
		const config = loadConfig();
		expect(config.url).toBe("https://metabase.example.com");
	});
});

import type { Config } from "../config.js";
import {
	AuthenticationError,
	ForbiddenError,
	MetabaseError,
	NotFoundError,
	RateLimitError,
} from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { withRetry } from "../utils/retry.js";

const MAX_CONCURRENT = 10;

export class MetabaseClient {
	private config: Config;
	private sessionToken: string | null = null;
	private activeCalls = 0;
	private waitQueue: Array<() => void> = [];

	constructor(config: Config) {
		this.config = config;
		if (config.authMethod === "session-token" && config.sessionToken) {
			this.sessionToken = config.sessionToken;
		}
	}

	async get<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
		let url = `${this.config.url}${path}`;
		if (params) {
			const searchParams = new URLSearchParams();
			for (const [key, value] of Object.entries(params)) {
				if (value !== undefined && value !== null) {
					searchParams.append(key, String(value));
				}
			}
			const qs = searchParams.toString();
			if (qs) url += `?${qs}`;
		}
		return this.request<T>("GET", url);
	}

	async post<T>(path: string, body?: unknown): Promise<T> {
		return this.request<T>("POST", `${this.config.url}${path}`, body);
	}

	async put<T>(path: string, body?: unknown): Promise<T> {
		return this.request<T>("PUT", `${this.config.url}${path}`, body);
	}

	async delete_<T>(path: string): Promise<T> {
		return this.request<T>("DELETE", `${this.config.url}${path}`);
	}

	private async request<T>(method: string, url: string, body?: unknown): Promise<T> {
		return withRetry(async () => {
			await this.acquireSemaphore();
			try {
				return await this.executeRequest<T>(method, url, body);
			} finally {
				this.releaseSemaphore();
			}
		});
	}

	private async executeRequest<T>(
		method: string,
		url: string,
		body?: unknown,
		isRetryAfterAuth = false,
	): Promise<T> {
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		await this.addAuthHeaders(headers);

		const init: RequestInit = { method, headers };
		if (body !== undefined && method !== "GET") {
			init.body = JSON.stringify(body);
		}

		logger.debug(`${method} ${url}`);
		const response = await fetch(url, init);

		if (!response.ok) {
			// Handle 401 with auto-refresh for email-password auth
			if (
				response.status === 401 &&
				this.config.authMethod === "email-password" &&
				!isRetryAfterAuth
			) {
				logger.warn("Got 401, attempting to re-authenticate");
				await this.authenticate();
				return this.executeRequest<T>(method, url, body, true);
			}

			const errorMessage = await this.extractErrorMessage(response);
			this.throwForStatus(response.status, errorMessage);
		}

		// Handle 204 No Content
		if (response.status === 204) {
			return undefined as T;
		}

		return (await response.json()) as T;
	}

	private async addAuthHeaders(headers: Record<string, string>): Promise<void> {
		if (this.config.authMethod === "api-key" && this.config.apiKey) {
			headers["x-api-key"] = this.config.apiKey;
		} else if (
			this.config.authMethod === "session-token" ||
			this.config.authMethod === "email-password"
		) {
			if (!this.sessionToken && this.config.authMethod === "email-password") {
				await this.authenticate();
			}
			if (this.sessionToken) {
				headers["X-Metabase-Session"] = this.sessionToken;
			}
		}
	}

	private async authenticate(): Promise<void> {
		if (
			this.config.authMethod !== "email-password" ||
			!this.config.email ||
			!this.config.password
		) {
			throw new AuthenticationError("Cannot authenticate: email/password not configured");
		}

		logger.info("Authenticating with email/password");

		const response = await fetch(`${this.config.url}/api/session`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				username: this.config.email,
				password: this.config.password,
			}),
		});

		if (!response.ok) {
			const msg = await this.extractErrorMessage(response);
			throw new AuthenticationError(`Login failed: ${msg}`);
		}

		const data = (await response.json()) as { id: string };
		this.sessionToken = data.id;
		logger.info("Authentication successful");
	}

	private async extractErrorMessage(response: Response): Promise<string> {
		try {
			const body = (await response.json()) as Record<string, unknown>;
			if (typeof body === "string") return body;
			if (body.message) return String(body.message);
			if (body.errors) return JSON.stringify(body.errors);
			return JSON.stringify(body);
		} catch {
			return `HTTP ${response.status}`;
		}
	}

	private throwForStatus(status: number, message: string): never {
		switch (status) {
			case 401:
				throw new AuthenticationError(message);
			case 403:
				throw new ForbiddenError(message);
			case 404:
				throw new NotFoundError(message);
			case 429:
				throw new RateLimitError(message);
			default:
				throw new MetabaseError(message, status);
		}
	}

	// Simple semaphore for concurrency limiting
	private async acquireSemaphore(): Promise<void> {
		if (this.activeCalls < MAX_CONCURRENT) {
			this.activeCalls++;
			return;
		}
		return new Promise<void>((resolve) => {
			this.waitQueue.push(() => {
				this.activeCalls++;
				resolve();
			});
		});
	}

	private releaseSemaphore(): void {
		this.activeCalls--;
		const next = this.waitQueue.shift();
		if (next) next();
	}
}

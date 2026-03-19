import { logger } from "./logger.js";

const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504];

export async function withRetry<T>(
	fn: () => Promise<T>,
	options: { maxAttempts?: number; baseDelayMs?: number } = {},
): Promise<T> {
	const { maxAttempts = 3, baseDelayMs = 1000 } = options;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (error) {
			const statusCode = (error as { statusCode?: number }).statusCode;
			const isRetryable = statusCode !== undefined && RETRYABLE_STATUS_CODES.includes(statusCode);

			if (attempt === maxAttempts || !isRetryable) {
				throw error;
			}

			const delay = baseDelayMs * 2 ** (attempt - 1);
			logger.warn(
				`Attempt ${attempt}/${maxAttempts} failed (status ${statusCode}), retrying in ${delay}ms`,
			);
			await new Promise((r) => setTimeout(r, delay));
		}
	}
	throw new Error("Unreachable");
}

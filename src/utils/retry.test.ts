import { describe, it, expect, vi } from "vitest";
import { withRetry } from "./retry.js";
import { MetabaseError } from "./errors.js";

describe("withRetry", () => {
	it("returns result on first success", async () => {
		const fn = vi.fn().mockResolvedValue("ok");
		const result = await withRetry(fn);
		expect(result).toBe("ok");
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it("retries on retryable status codes", async () => {
		const fn = vi
			.fn()
			.mockRejectedValueOnce(new MetabaseError("server error", 500))
			.mockResolvedValue("ok");
		const result = await withRetry(fn, { baseDelayMs: 1 });
		expect(result).toBe("ok");
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it("does not retry on non-retryable status codes", async () => {
		const fn = vi.fn().mockRejectedValue(new MetabaseError("not found", 404));
		await expect(withRetry(fn, { baseDelayMs: 1 })).rejects.toThrow("not found");
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it("throws after max attempts", async () => {
		const fn = vi.fn().mockRejectedValue(new MetabaseError("server error", 500));
		await expect(withRetry(fn, { maxAttempts: 2, baseDelayMs: 1 })).rejects.toThrow(
			"server error",
		);
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it("does not retry errors without status codes", async () => {
		const fn = vi.fn().mockRejectedValue(new Error("random error"));
		await expect(withRetry(fn, { baseDelayMs: 1 })).rejects.toThrow("random error");
		expect(fn).toHaveBeenCalledTimes(1);
	});
});

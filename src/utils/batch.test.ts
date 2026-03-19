import { describe, it, expect, vi } from "vitest";
import { batchProcess } from "./batch.js";

describe("batchProcess", () => {
	it("processes all items", async () => {
		const fn = vi.fn().mockImplementation((n: number) => Promise.resolve(n * 2));
		const results = await batchProcess([1, 2, 3], fn);
		expect(results).toEqual([
			{ item: 1, result: 2 },
			{ item: 2, result: 4 },
			{ item: 3, result: 6 },
		]);
	});

	it("respects concurrency limit", async () => {
		let concurrent = 0;
		let maxConcurrent = 0;
		const fn = vi.fn().mockImplementation(async (n: number) => {
			concurrent++;
			maxConcurrent = Math.max(maxConcurrent, concurrent);
			await new Promise((r) => setTimeout(r, 10));
			concurrent--;
			return n;
		});
		await batchProcess([1, 2, 3, 4, 5, 6, 7, 8], fn, 3);
		expect(maxConcurrent).toBeLessThanOrEqual(3);
	});

	it("handles individual failures without aborting", async () => {
		const fn = vi.fn().mockImplementation(async (n: number) => {
			if (n === 2) throw new Error("fail");
			return n * 10;
		});
		const results = await batchProcess([1, 2, 3], fn);
		expect(results).toEqual([
			{ item: 1, result: 10 },
			{ item: 2, error: "fail" },
			{ item: 3, result: 30 },
		]);
	});

	it("returns empty array for empty input", async () => {
		const fn = vi.fn();
		const results = await batchProcess([], fn);
		expect(results).toEqual([]);
		expect(fn).not.toHaveBeenCalled();
	});
});

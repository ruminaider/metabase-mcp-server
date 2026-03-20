import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Cache } from "./cache.js";

describe("Cache", () => {
	it("returns undefined for missing keys", () => {
		const cache = new Cache<string>("test");
		expect(cache.get("missing")).toBeUndefined();
	});

	it("stores and retrieves values", () => {
		const cache = new Cache<string>("test");
		cache.set("key", "value");
		expect(cache.get("key")).toBe("value");
	});

	it("returns undefined for expired entries", () => {
		const cache = new Cache<string>("test", 100); // 100ms TTL
		cache.set("key", "value");

		// Mock time forward
		const original = Date.now;
		Date.now = () => original() + 200;
		expect(cache.get("key")).toBeUndefined();
		Date.now = original;
	});

	it("invalidates a specific key", () => {
		const cache = new Cache<string>("test");
		cache.set("a", "1");
		cache.set("b", "2");
		cache.invalidate("a");
		expect(cache.get("a")).toBeUndefined();
		expect(cache.get("b")).toBe("2");
	});

	it("invalidates all keys", () => {
		const cache = new Cache<string>("test");
		cache.set("a", "1");
		cache.set("b", "2");
		cache.invalidate();
		expect(cache.size).toBe(0);
	});

	it("tracks size correctly", () => {
		const cache = new Cache<string>("test");
		expect(cache.size).toBe(0);
		cache.set("a", "1");
		expect(cache.size).toBe(1);
		cache.set("b", "2");
		expect(cache.size).toBe(2);
	});
});

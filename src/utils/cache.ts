import { logger } from "./logger.js";

const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface CacheEntry<T> {
	data: T;
	timestamp: number;
}

export class Cache<T> {
	private store = new Map<string, CacheEntry<T>>();
	private ttlMs: number;

	constructor(name: string, ttlMs?: number) {
		this.ttlMs = ttlMs ?? (Number(process.env.METABASE_CACHE_TTL_MS) || DEFAULT_TTL_MS);
		logger.debug(`Cache "${name}" initialized with TTL ${this.ttlMs}ms`);
	}

	get(key: string): T | undefined {
		const entry = this.store.get(key);
		if (!entry) return undefined;
		if (Date.now() - entry.timestamp > this.ttlMs) {
			this.store.delete(key);
			return undefined;
		}
		return entry.data;
	}

	set(key: string, data: T): void {
		this.store.set(key, { data, timestamp: Date.now() });
	}

	invalidate(key?: string): void {
		if (key) {
			this.store.delete(key);
		} else {
			this.store.clear();
		}
	}

	get size(): number {
		return this.store.size;
	}
}

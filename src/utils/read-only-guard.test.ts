import { describe, it, expect } from "vitest";
import { initReadOnlyGuard, assertWriteEnabled } from "./read-only-guard.js";
import { ReadOnlyError } from "./errors.js";
import type { Config } from "../config.js";

function makeConfig(readOnly: boolean): Config {
	return {
		url: "https://example.com",
		authMethod: "api-key",
		apiKey: "test",
		readOnly,
	};
}

describe("read-only guard", () => {
	it("does not throw when readOnly is false", () => {
		initReadOnlyGuard(makeConfig(false));
		expect(() => assertWriteEnabled()).not.toThrow();
	});

	it("throws ReadOnlyError when readOnly is true", () => {
		initReadOnlyGuard(makeConfig(true));
		expect(() => assertWriteEnabled()).toThrow(ReadOnlyError);
	});
});

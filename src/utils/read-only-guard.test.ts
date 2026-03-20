import { describe, expect, it } from "vitest";
import type { Config } from "../config.js";
import { ReadOnlyError } from "./errors.js";
import { assertWriteEnabled, initReadOnlyGuard } from "./read-only-guard.js";

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

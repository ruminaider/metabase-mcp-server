import type { Config } from "../config.js";
import { ReadOnlyError } from "./errors.js";

let _config: Config | null = null;

export function initReadOnlyGuard(config: Config): void {
	_config = config;
}

export function assertWriteEnabled(): void {
	if (_config?.readOnly) {
		throw new ReadOnlyError();
	}
}

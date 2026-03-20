import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MetabaseClient } from "./metabase-client.js";
import { RevisionService } from "./revision-service.js";

vi.mock("../utils/read-only-guard.js", () => ({
	assertWriteEnabled: vi.fn(),
}));

function mockClient(): MetabaseClient {
	return {
		get: vi.fn().mockResolvedValue([]),
		post: vi.fn().mockResolvedValue({ ok: true }),
		put: vi.fn(),
		delete_: vi.fn().mockResolvedValue(undefined),
	} as unknown as MetabaseClient;
}

describe("RevisionService", () => {
	let client: MetabaseClient;
	let service: RevisionService;

	beforeEach(() => {
		client = mockClient();
		service = new RevisionService(client);
	});

	it("getRevisions calls GET /api/revision with params", async () => {
		await service.getRevisions("card", 42);
		expect(client.get).toHaveBeenCalledWith("/api/revision", { entity: "card", id: "42" });
	});

	it("getRevisions works for dashboards", async () => {
		await service.getRevisions("dashboard", 10);
		expect(client.get).toHaveBeenCalledWith("/api/revision", { entity: "dashboard", id: "10" });
	});

	it("revertRevision calls POST /api/revision/revert", async () => {
		await service.revertRevision({ entity: "card", id: 42, revision_id: 5 });
		expect(client.post).toHaveBeenCalledWith("/api/revision/revert", {
			entity: "card",
			id: 42,
			revision_id: 5,
		});
	});

	it("toggleBookmark create calls POST /api/bookmark/:model/:id", async () => {
		await service.toggleBookmark("card", 42, "create");
		expect(client.post).toHaveBeenCalledWith("/api/bookmark/card/42");
	});

	it("toggleBookmark delete calls DELETE /api/bookmark/:model/:id", async () => {
		await service.toggleBookmark("dashboard", 10, "delete");
		expect(client.delete_).toHaveBeenCalledWith("/api/bookmark/dashboard/10");
	});
});

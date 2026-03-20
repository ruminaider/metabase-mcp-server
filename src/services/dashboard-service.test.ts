import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardService } from "./dashboard-service.js";
import type { MetabaseClient } from "./metabase-client.js";

vi.mock("../utils/read-only-guard.js", () => ({
	assertWriteEnabled: vi.fn(),
}));

function mockClient(): MetabaseClient {
	return {
		get: vi.fn().mockResolvedValue({ id: 1 }),
		post: vi.fn().mockResolvedValue({ id: 1 }),
		put: vi.fn().mockResolvedValue({ id: 1 }),
		delete_: vi.fn(),
	} as unknown as MetabaseClient;
}

describe("DashboardService", () => {
	let client: MetabaseClient;
	let service: DashboardService;

	beforeEach(() => {
		client = mockClient();
		service = new DashboardService(client);
	});

	it("listDashboards calls GET /api/dashboard", async () => {
		await service.listDashboards();
		expect(client.get).toHaveBeenCalledWith("/api/dashboard", {});
	});

	it("listDashboards passes filter", async () => {
		await service.listDashboards("mine");
		expect(client.get).toHaveBeenCalledWith("/api/dashboard", { f: "mine" });
	});

	it("getDashboard calls correct path", async () => {
		await service.getDashboard(42);
		expect(client.get).toHaveBeenCalledWith("/api/dashboard/42");
	});

	it("createDashboard calls POST /api/dashboard", async () => {
		await service.createDashboard({ name: "Test Dashboard" });
		expect(client.post).toHaveBeenCalledWith("/api/dashboard", { name: "Test Dashboard" });
	});

	it("updateDashboard calls PUT /api/dashboard/:id", async () => {
		await service.updateDashboard(42, { name: "Updated" });
		expect(client.put).toHaveBeenCalledWith("/api/dashboard/42", { name: "Updated" });
	});

	it("copyDashboard calls POST /api/dashboard/:id/copy", async () => {
		await service.copyDashboard(42, { name: "Copy" });
		expect(client.post).toHaveBeenCalledWith("/api/dashboard/42/copy", { name: "Copy" });
	});

	it("updateDashboardCards calls PUT /api/dashboard/:id/cards", async () => {
		const cards = [{ card_id: 1, row: 0, col: 0, size_x: 6, size_y: 4 }];
		await service.updateDashboardCards(42, cards);
		expect(client.put).toHaveBeenCalledWith("/api/dashboard/42/cards", { cards });
	});

	it("archiveDashboard sets archived: true", async () => {
		await service.archiveDashboard(42);
		expect(client.put).toHaveBeenCalledWith("/api/dashboard/42", { archived: true });
	});

	it("getDashboardMetadata calls correct path", async () => {
		await service.getDashboardMetadata(42);
		expect(client.get).toHaveBeenCalledWith("/api/dashboard/42/query_metadata");
	});
});

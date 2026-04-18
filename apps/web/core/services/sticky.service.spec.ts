import { describe, it, expect, vi, beforeEach } from "vitest";
import { StickyService } from "./sticky.service";
import { APIService } from "@/services/api.service";
import { STICKIES_PER_PAGE, API_BASE_URL } from "@plane/constants";

describe("StickyService", () => {
  let service: StickyService;

  beforeEach(() => {
    service = new StickyService();
    vi.restoreAllMocks();
  });

  it("should instantiate with API_BASE_URL", () => {
    expect(service.baseURL).toBe(API_BASE_URL);
  });

  it("should call POST on createSticky", async () => {
    const mock = { data: { id: "1" } };
    const spy = vi.spyOn(APIService.prototype, "post").mockResolvedValue(mock);

    const result = await service.createSticky("ws1", { title: "Test" });

    expect(spy).toHaveBeenCalledWith(
      "/api/workspaces/ws1/stickies/",
      { title: "Test" }
    );
    expect(result).toEqual(mock.data);
  });

  it("should call GET on getStickies with defaults", async () => {
    const mock = { data: { results: [], total_pages: 1 } };
    const spy = vi.spyOn(APIService.prototype, "get").mockResolvedValue(mock);

    const result = await service.getStickies("ws1", "cursor123");

    expect(spy).toHaveBeenCalledWith(
      "/api/workspaces/ws1/stickies/",
      {
        params: {
          cursor: "cursor123",
          per_page: STICKIES_PER_PAGE,
          query: undefined,
        },
      }
    );
    expect(result).toEqual(mock.data);
  });

  it("should call GET on getSticky", async () => {
    const mock = { data: { id: "abc" } };
    const spy = vi.spyOn(APIService.prototype, "get").mockResolvedValue(mock);

    const result = await service.getSticky("ws1", "abc");

    expect(spy).toHaveBeenCalledWith(
      "/api/workspaces/ws1/stickies/abc"
    );
    expect(result).toEqual(mock.data);
  });

  it("should call PATCH on updateSticky", async () => {
    const mock = { data: { id: "abc", title: "Updated" } };
    const spy = vi.spyOn(APIService.prototype, "patch").mockResolvedValue(mock);

    const result = await service.updateSticky("ws1", "abc", { title: "Updated" });

    expect(spy).toHaveBeenCalledWith(
      "/api/workspaces/ws1/stickies/abc/",
      { title: "Updated" }
    );
    expect(result).toEqual(mock.data);
  });

  it("should call DELETE on deleteSticky", async () => {
    const spy = vi.spyOn(APIService.prototype, "delete").mockResolvedValue({});

    await service.deleteSticky("ws1", "abc");

    expect(spy).toHaveBeenCalledWith(
      "/api/workspaces/ws1/stickies/abc"
    );
  });

  it("should throw API error responses", async () => {
    const spy = vi.spyOn(APIService.prototype, "post").mockRejectedValue({
      response: { data: { error: "Bad" } }
    });

    await expect(
      service.createSticky("ws1", {})
    ).rejects.toEqual({ error: "Bad" });

    expect(spy).toHaveBeenCalled();
  });
});

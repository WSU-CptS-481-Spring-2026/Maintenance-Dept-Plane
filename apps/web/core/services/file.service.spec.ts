import { describe, it, expect, beforeEach, vi } from "vitest";

import { FileService } from "./file.service";
import { WorkspaceAssetService } from "./workspace-asset.service";
import { ProjectAssetService } from "./project-asset.service";
import { UserAssetService } from "./user-asset.service";
import { UnsplashService } from "./unsplash.service";
import { FileUploadService } from "@/services/file-upload.service";

vi.mock("./workspace-asset.service");
vi.mock("./project-asset.service");
vi.mock("./user-asset.service");
vi.mock("./unsplash.service");
vi.mock("@/services/file-upload.service");

describe("FileService", () => {
    let service: FileService;

    beforeEach(() => {
        vi.clearAllMocks();
        service = new FileService();
    });

    it("should instantiate all asset services", () => {
        expect(service.workspace).toBeInstanceOf(WorkspaceAssetService);
        expect(service.project).toBeInstanceOf(ProjectAssetService);
        expect(service.user).toBeInstanceOf(UserAssetService);
        expect(service.unsplash).toBeInstanceOf(UnsplashService);
    });

    it("should instantiate FileUploadService", () => {
        expect(FileUploadService).toHaveBeenCalledTimes(1);
    });

    it("should bind cancelUpload to the instance", () => {
        const unbound = service.cancelUpload;
        expect(unbound).toBe(service.cancelUpload);
    });

    it("should call cancelSource.cancel when cancelSource exists", () => {
        const cancelMock = vi.fn();
        (service as any).cancelSource = { cancel: cancelMock };

        service.cancelUpload();

        expect(cancelMock).toHaveBeenCalledWith("Upload canceled");
    });

    it("should do nothing when cancelSource is undefined", () => {
        (service as any).cancelSource = undefined;

        expect(() => service.cancelUpload()).not.toThrow();
    });
});

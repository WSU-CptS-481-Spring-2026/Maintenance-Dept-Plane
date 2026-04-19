/**
 * Copyright (c) 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { API_BASE_URL } from "@plane/constants";
import { APIService } from "@/services/api.service";
import { FileUploadService } from "@/services/file-upload.service";

import { WorkspaceAssetService } from "./workspace-asset.service";
import { ProjectAssetService } from "./project-asset.service";
import { UserAssetService } from "./user-asset.service";
import { UnsplashService } from "./unsplash.service";

export class FileService extends APIService {
    private cancelSource: any;
    private fileUploadService: FileUploadService;

    public workspace: WorkspaceAssetService;
    public project: ProjectAssetService;
    public user: UserAssetService;
    public unsplash: UnsplashService;

    constructor() {
        super(API_BASE_URL);

        this.cancelUpload = this.cancelUpload.bind(this);

        this.fileUploadService = new FileUploadService();

        this.workspace = new WorkspaceAssetService();
        this.project = new ProjectAssetService();
        this.user = new UserAssetService();
        this.unsplash = new UnsplashService();
    }

    cancelUpload() {
        this.cancelSource?.cancel("Upload canceled");
    }
}

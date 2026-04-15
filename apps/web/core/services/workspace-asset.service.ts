/**
 * Copyright (c) 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { API_BASE_URL } from "@plane/constants";
import { APIService } from "@/services/api.service";
import { FileUploadService } from "@/services/file-upload.service";

import type { TFileEntityInfo, TFileSignedURLResponse } from "@plane/types";
import { getFileMetaDataForUpload, generateFileUploadPayload } from "@plane/services";
import { getAssetIdFromUrl } from "@plane/utils";

export class WorkspaceAssetService extends APIService {
    private fileUploadService: FileUploadService;

    constructor() {
        super(API_BASE_URL);
        this.fileUploadService = new FileUploadService();
    }

    private async updateWorkspaceAssetUploadStatus(
        workspaceSlug: string,
        assetId: string
    ): Promise<void> {
        return this.patch(`/api/assets/v2/workspaces/${workspaceSlug}/${assetId}/`)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data;
            });
    }

    async uploadWorkspaceAsset(
        workspaceSlug: string,
        data: TFileEntityInfo,
        file: File,
        uploadProgressHandler?: (progressEvent: any) => void
    ): Promise<TFileSignedURLResponse> {
        const fileMetaData = await getFileMetaDataForUpload(file);

        return this.post(`/api/assets/v2/workspaces/${workspaceSlug}/`, {
            ...data,
            ...fileMetaData,
        })
            .then(async (response) => {
                const signedURLResponse: TFileSignedURLResponse = response?.data;

                const fileUploadPayload = generateFileUploadPayload(signedURLResponse, file);

                await this.fileUploadService.uploadFile(
                    signedURLResponse.upload_data.url,
                    fileUploadPayload,
                    uploadProgressHandler
                );

                await this.updateWorkspaceAssetUploadStatus(
                    workspaceSlug,
                    signedURLResponse.asset_id
                );

                return signedURLResponse;
            })
            .catch((error) => {
                throw error?.response?.data;
            });
    }

    async deleteWorkspaceAsset(workspaceSlug: string, assetId: string): Promise<void> {
        return this.delete(`/api/assets/v2/workspaces/${workspaceSlug}/${assetId}/`)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data;
            });
    }
}
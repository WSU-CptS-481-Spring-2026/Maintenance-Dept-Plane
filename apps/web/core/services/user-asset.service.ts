/**
 * Copyright (c) 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { API_BASE_URL } from "@plane/constants";
import { APIService } from "@/services/api.service";
import { FileUploadService } from "@/services/file-upload.service";

import type { TFileEntityInfo, TFileSignedURLResponse } from "@plane/types";
import { getFileMetaDataForUpload, generateFileUploadPayload } from "@plane/services";

export class UserAssetService extends APIService {
    private fileUploadService: FileUploadService;

    constructor() {
        super(API_BASE_URL);
        this.fileUploadService = new FileUploadService();
    }

    private async updateUserAssetUploadStatus(assetId: string): Promise<void> {
        return this.patch(`/api/assets/v2/user-assets/${assetId}/`)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data;
            });
    }

    async uploadUserAsset(data: TFileEntityInfo, file: File): Promise<TFileSignedURLResponse> {
        const fileMetaData = await getFileMetaDataForUpload(file);

        return this.post(`/api/assets/v2/user-assets/`, {
            ...data,
            ...fileMetaData,
        })
            .then(async (response) => {
                const signedURLResponse: TFileSignedURLResponse = response?.data;

                const fileUploadPayload = generateFileUploadPayload(signedURLResponse, file);

                await this.fileUploadService.uploadFile(
                    signedURLResponse.upload_data.url,
                    fileUploadPayload
                );

                await this.updateUserAssetUploadStatus(signedURLResponse.asset_id);

                return signedURLResponse;
            })
            .catch((error) => {
                throw error?.response?.data;
            });
    }

    async deleteUserAsset(assetId: string): Promise<void> {
        return this.delete(`/api/assets/v2/user-assets/${assetId}/`)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data;
            });
    }
}

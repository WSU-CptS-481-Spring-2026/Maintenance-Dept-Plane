/**
 * Copyright (c) 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { API_BASE_URL } from "@plane/constants";
import { APIService } from "@/services/api.service";

export interface UnSplashImageUrls {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
    small_s3: string;
}

export interface UnSplashImage {
    id: string;
    created_at: Date;
    updated_at: Date;
    promoted_at: Date;
    width: number;
    height: number;
    color: string;
    blur_hash: string;
    description: string | null;
    alt_description: string;
    urls: UnSplashImageUrls;
    [key: string]: any;
}

export class UnsplashService extends APIService {
    constructor() {
        super(API_BASE_URL);
    }

    async getUnsplashImages(query?: string): Promise<UnSplashImage[]> {
        return this.get(`/api/unsplash/`, {
            params: { query },
        })
            .then((res) => res?.data?.results ?? res?.data)
            .catch((err) => {
                throw err?.response?.data;
            });
    }
}

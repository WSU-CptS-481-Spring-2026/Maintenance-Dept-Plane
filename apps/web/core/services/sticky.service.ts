/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { STICKIES_PER_PAGE, API_BASE_URL } from "@plane/constants";
import type { TSticky } from "@plane/types";
import { APIService } from "@/services/api.service";

export class StickyService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  private handleError(err: any): never {
    throw err?.response?.data ?? err;
  }

  private base(workspaceSlug: string): string {
    return `/api/workspaces/${workspaceSlug}/stickies`;
  }

  async createSticky(workspaceSlug: string, payload: Partial<TSticky>): Promise<TSticky> {
    try {
      const res = await this.post(`${this.base(workspaceSlug)}/`, payload);
      return res?.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async getStickies(
    workspaceSlug: string,
    cursor: string,
    query?: string,
    per_page?: number
  ): Promise<{ results: TSticky[]; total_pages: number }> {
    try {
      const res = await this.get(`${this.base(workspaceSlug)}/`, {
        params: {
          cursor,
          per_page: per_page ?? STICKIES_PER_PAGE,
          query,
        },
      });
      return res?.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async getSticky(workspaceSlug: string, id: string): Promise<TSticky> {
    try {
      const res = await this.get(`${this.base(workspaceSlug)}/${id}`);
      return res?.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async updateSticky(
    workspaceSlug: string,
    id: string,
    data: Partial<TSticky>
  ): Promise<TSticky> {
    try {
      const res = await this.patch(`${this.base(workspaceSlug)}/${id}/`, data);
      return res?.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async deleteSticky(workspaceSlug: string, id: string): Promise<void> {
    try {
      await this.delete(`${this.base(workspaceSlug)}/${id}`);
    } catch (err) {
      this.handleError(err);
    }
  }
}

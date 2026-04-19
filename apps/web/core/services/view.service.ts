/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { AxiosResponse } from "axios";
import { isAxiosError } from "axios";
import { API_BASE_URL } from "@plane/constants";
import type { IProjectView, TIssuesResponse } from "@plane/types";
import { APIService } from "@/services/api.service";
// types
// helpers

export class ViewService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  /** DRY: shared unwrap + API error mapping for all view endpoints */
  private unwrapData<T>(request: Promise<AxiosResponse<T>>): Promise<T> {
    return request
      .then((response) => response?.data)
      .catch((error: unknown) => {
        if (isAxiosError(error)) throw error.response?.data;
        throw error;
      });
  }

  async createView(workspaceSlug: string, projectId: string, data: Partial<IProjectView>): Promise<IProjectView> {
    return this.unwrapData<IProjectView>(
      this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/views/`, data) as Promise<
        AxiosResponse<IProjectView>
      >
    );
  }

  async patchView(
    workspaceSlug: string,
    projectId: string,
    viewId: string,
    data: Partial<IProjectView>
  ): Promise<IProjectView> {
    return this.unwrapData<IProjectView>(
      this.patch(`/api/workspaces/${workspaceSlug}/projects/${projectId}/views/${viewId}/`, data) as Promise<
        AxiosResponse<IProjectView>
      >
    );
  }

  async deleteView(workspaceSlug: string, projectId: string, viewId: string): Promise<void> {
    await this.unwrapData<unknown>(
      this.delete(`/api/workspaces/${workspaceSlug}/projects/${projectId}/views/${viewId}/`) as Promise<
        AxiosResponse<unknown>
      >
    );
  }

  async getViews(workspaceSlug: string, projectId: string): Promise<IProjectView[]> {
    return this.unwrapData<IProjectView[]>(
      this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/views/`) as Promise<
        AxiosResponse<IProjectView[]>
      >
    );
  }

  async getViewDetails(workspaceSlug: string, projectId: string, viewId: string): Promise<IProjectView> {
    return this.unwrapData<IProjectView>(
      this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/views/${viewId}/`) as Promise<
        AxiosResponse<IProjectView>
      >
    );
  }

  async getViewIssues(workspaceSlug: string, projectId: string, viewId: string): Promise<TIssuesResponse> {
    return this.unwrapData<TIssuesResponse>(
      this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/views/${viewId}/issues/`) as Promise<
        AxiosResponse<TIssuesResponse>
      >
    );
  }

  async addViewToFavorites(
    workspaceSlug: string,
    projectId: string,
    data: {
      view: string;
    }
  ): Promise<void> {
    await this.unwrapData<unknown>(
      this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/user-favorite-views/`, data) as Promise<
        AxiosResponse<unknown>
      >
    );
  }

  async removeViewFromFavorites(workspaceSlug: string, projectId: string, viewId: string): Promise<void> {
    await this.unwrapData<unknown>(
      this.delete(`/api/workspaces/${workspaceSlug}/projects/${projectId}/user-favorite-views/${viewId}/`) as Promise<
        AxiosResponse<unknown>
      >
    );
  }
}

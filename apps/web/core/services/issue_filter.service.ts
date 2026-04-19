/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// services
import type { AxiosResponse } from "axios";
import { isAxiosError } from "axios";
import { API_BASE_URL } from "@plane/constants";
import type { IIssueFiltersResponse } from "@plane/types";
import { APIService } from "@/services/api.service";
// types

export class IssueFiltersService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  /** DRY: same unwrap/error mapping for all filter endpoints */
  private unwrapData<T>(request: Promise<AxiosResponse<T>>): Promise<T> {
    return request
      .then((response) => response?.data)
      .catch((error: unknown) => {
        if (isAxiosError(error)) throw error.response?.data;
        throw error;
      });
  }

  // // workspace issue filters
  // async fetchWorkspaceFilters(workspaceSlug: string): Promise<IIssueFiltersResponse> {
  //   return this.get(`/api/workspaces/${workspaceSlug}/user-properties/`)
  //     .then((response) => response?.data)
  //     .catch((error) => {
  //       throw error?.response?.data;
  //     });
  // }
  // async patchWorkspaceFilters(
  //   workspaceSlug: string,
  //   data: Partial<IIssueFiltersResponse>
  // ): Promise<IIssueFiltersResponse> {
  //   return this.patch(`/api/workspaces/${workspaceSlug}/user-properties/`, data)
  //     .then((response) => response?.data)
  //     .catch((error) => {
  //       throw error?.response?.data;
  //     });
  // }

  // epic issue filters
  async fetchProjectEpicFilters(workspaceSlug: string, projectId: string): Promise<IIssueFiltersResponse> {
    return this.unwrapData<IIssueFiltersResponse>(
      this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/epics-user-properties/`) as Promise<
        AxiosResponse<IIssueFiltersResponse>
      >
    );
  }
  async patchProjectEpicFilters(
    workspaceSlug: string,
    projectId: string,
    data: Partial<IIssueFiltersResponse>
  ): Promise<IIssueFiltersResponse> {
    return this.unwrapData<IIssueFiltersResponse>(
      this.patch(`/api/workspaces/${workspaceSlug}/projects/${projectId}/epics-user-properties/`, data) as Promise<
        AxiosResponse<IIssueFiltersResponse>
      >
    );
  }

  // cycle issue filters
  async fetchCycleIssueFilters(
    workspaceSlug: string,
    projectId: string,
    cycleId: string
  ): Promise<IIssueFiltersResponse> {
    return this.unwrapData<IIssueFiltersResponse>(
      this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/user-properties/`) as Promise<
        AxiosResponse<IIssueFiltersResponse>
      >
    );
  }
  async patchCycleIssueFilters(
    workspaceSlug: string,
    projectId: string,
    cycleId: string,
    data: Partial<IIssueFiltersResponse>
  ): Promise<IIssueFiltersResponse> {
    return this.unwrapData<IIssueFiltersResponse>(
      this.patch(
        `/api/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/user-properties/`,
        data
      ) as Promise<AxiosResponse<IIssueFiltersResponse>>
    );
  }

  // module issue filters
  async fetchModuleIssueFilters(
    workspaceSlug: string,
    projectId: string,
    moduleId: string
  ): Promise<IIssueFiltersResponse> {
    return this.unwrapData<IIssueFiltersResponse>(
      this.get(
        `/api/workspaces/${workspaceSlug}/projects/${projectId}/modules/${moduleId}/user-properties/`
      ) as Promise<AxiosResponse<IIssueFiltersResponse>>
    );
  }
  async patchModuleIssueFilters(
    workspaceSlug: string,
    projectId: string,
    moduleId: string,
    data: Partial<IIssueFiltersResponse>
  ): Promise<IIssueFiltersResponse> {
    return this.unwrapData<IIssueFiltersResponse>(
      this.patch(
        `/api/workspaces/${workspaceSlug}/projects/${projectId}/modules/${moduleId}/user-properties/`,
        data
      ) as Promise<AxiosResponse<IIssueFiltersResponse>>
    );
  }
}

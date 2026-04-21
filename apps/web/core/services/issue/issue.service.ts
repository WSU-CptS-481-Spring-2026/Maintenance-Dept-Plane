/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// plane imports
import { API_BASE_URL } from "@plane/constants";
import { EIssueServiceType } from "@plane/types";
import type {
  TIssueParams,
  IIssueDisplayProperties,
  TBulkOperationsPayload,
  TIssue,
  TIssueActivity,
  TIssueLink,
  TIssueServiceType,
  TIssuesResponse,
  TIssueSubIssues,
} from "@plane/types";
// services
import { APIService } from "@/services/api.service";

type TApiResponse<T> = {
  data: T;
};

type TApiErrorWithResponseData = {
  response?: {
    data?: unknown;
  };
};

type TApiErrorWithResponse = {
  response?: unknown;
};

type TIssueQueryParams = Partial<Record<string, string | number | boolean | null | undefined>>;

type TApiMutationResponse = Record<string, unknown> | null;

const unwrapData = <T>(response: TApiResponse<T>): T => response.data;

const throwResponseData = (error: unknown): never => {
  const apiError = error as TApiErrorWithResponseData;
  throw apiError.response?.data ?? error;
};

const throwResponse = (error: unknown): never => {
  const apiError = error as TApiErrorWithResponse;
  throw apiError.response ?? error;
};

export class IssueService extends APIService {
  private serviceType: TIssueServiceType;

  constructor(serviceType: TIssueServiceType = EIssueServiceType.ISSUES) {
    super(API_BASE_URL);
    this.serviceType = serviceType;
  }

  async createIssue(workspaceSlug: string, projectId: string, data: Partial<TIssue>): Promise<TIssue> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/`, data)
      .then(unwrapData)
      .catch(throwResponseData);
  }

  async getIssuesFromServer(
    workspaceSlug: string,
    projectId: string,
    queries?: TIssueQueryParams,
    config = {}
  ): Promise<TIssuesResponse> {
    const path =
      (queries?.expand as string)?.includes("issue_relation") && !queries?.group_by
        ? `/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}-detail/`
        : `/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/`;
    return this.get(
      path,
      {
        params: queries,
      },
      config
    )
      .then(unwrapData)
      .catch(throwResponseData);
  }

  async getIssuesForSync(
    workspaceSlug: string,
    projectId: string,
    queries?: TIssueQueryParams,
    config = {}
  ): Promise<TIssuesResponse> {
    return this.get(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/v2/${this.serviceType}/`,
      { params: queries },
      config
    )
      .then(unwrapData)
      .catch(throwResponseData);
  }

  async getIssues(
    workspaceSlug: string,
    projectId: string,
    queries?: Partial<Record<TIssueParams, string | boolean>>,
    config = {}
  ): Promise<TIssuesResponse> {
    return this.getIssuesFromServer(workspaceSlug, projectId, queries, config);
  }

  async getDeletedIssues(
    workspaceSlug: string,
    projectId: string,
    queries?: TIssueQueryParams
  ): Promise<TIssuesResponse> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/deleted-issues/`, {
      params: queries,
    })
      .then(unwrapData)
      .catch(throwResponseData);
  }

  async getIssuesWithParams(
    workspaceSlug: string,
    projectId: string,
    queries?: TIssueQueryParams
  ): Promise<TIssue[] | { [key: string]: TIssue[] }> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/`, {
      params: queries,
    })
      .then(unwrapData)
      .catch(throwResponseData);
  }

  async retrieve(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    queries?: TIssueQueryParams
  ): Promise<TIssue> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/${issueId}/`, {
      params: queries,
    })
      .then((response: TApiResponse<TIssue>) => {
        // add is_epic flag when the service type is epic
        if (response.data && this.serviceType === EIssueServiceType.EPICS) {
          response.data.is_epic = true;
        }
        return response.data;
      })
      .catch(throwResponseData);
  }

  async retrieveIssues(workspaceSlug: string, projectId: string, issueIds: string[]): Promise<TIssue[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/list/`, {
      params: { issues: issueIds.join(",") },
    })
      .then((response: TApiResponse<TIssue[]>) => response.data)
      .catch(throwResponseData);
  }

  async getIssueActivities(workspaceSlug: string, projectId: string, issueId: string): Promise<TIssueActivity[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/${issueId}/history/`)
      .then(unwrapData)
      .catch(throwResponseData);
  }

  async addIssueToCycle(
    workspaceSlug: string,
    projectId: string,
    cycleId: string,
    data: {
      issues: string[];
    }
  ) {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/cycle-issues/`, data)
      .then(unwrapData)
      .catch(throwResponseData);
  }

  async removeIssueFromCycle(workspaceSlug: string, projectId: string, cycleId: string, bridgeId: string) {
    return this.delete(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/cycle-issues/${bridgeId}/`
    )
      .then(unwrapData)
      .catch(throwResponseData);
  }

  async createIssueRelation(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    data: {
      related_list: Array<{
        relation_type: "duplicate" | "relates_to" | "blocked_by";
        related_issue: string;
      }>;
      relation?: "blocking" | null;
    }
  ) {
    return this.post(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/${issueId}/issue-relation/`,
      data
    )
      .then(unwrapData)
      .catch(throwResponse);
  }

  async deleteIssueRelation(workspaceSlug: string, projectId: string, issueId: string, relationId: string) {
    return this.delete(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/${issueId}/issue-relation/${relationId}/`
    )
      .then(unwrapData)
      .catch(throwResponse);
  }

  async getIssueDisplayProperties(
    workspaceSlug: string,
    projectId: string
  ): Promise<IIssueDisplayProperties> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issue-display-properties/`)
      .then(unwrapData)
      .catch(throwResponseData);
  }

  async updateIssueDisplayProperties(
    workspaceSlug: string,
    projectId: string,
    data: IIssueDisplayProperties
  ): Promise<IIssueDisplayProperties> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issue-display-properties/`, {
      properties: data,
    })
      .then(unwrapData)
      .catch(throwResponseData);
  }

  async patchIssue(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    data: Partial<TIssue>
  ): Promise<TIssue> {
    return this.patch(`/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/${issueId}/`, data)
      .then(unwrapData)
      .catch(throwResponseData);
  }

  async deleteIssue(
    workspaceSlug: string,
    projectId: string,
    issuesId: string
  ): Promise<TApiMutationResponse> {
    return this.delete(`/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/${issuesId}/`)
      .then(unwrapData)
      .catch(throwResponseData);
  }

  async updateIssueDates(
    workspaceSlug: string,
    projectId: string,
    updates: { id: string; start_date?: string; target_date?: string }[]
  ): Promise<void> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issue-dates/`, { updates })
      .then(unwrapData)
      .catch(throwResponseData);
  }

  async subIssues(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    queries?: Partial<Record<TIssueParams, string | boolean>>
  ): Promise<TIssueSubIssues> {
    return this.get(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/${issueId}/${this.serviceType === EIssueServiceType.EPICS ? "issues" : "sub-issues"}/`,
      { params: queries }
    )
      .then(unwrapData)
      .catch(throwResponseData);
  }

  async addSubIssues(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    data: { sub_issue_ids: string[] }
  ): Promise<TIssueSubIssues> {
    return this.post(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/${issueId}/${this.serviceType === EIssueServiceType.EPICS ? "issues" : "sub-issues"}/`,
      data
    )
      .then(unwrapData)
      .catch(throwResponseData);
  }

  async fetchIssueLinks(workspaceSlug: string, projectId: string, issueId: string): Promise<TIssueLink[]> {
    return this.get(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/${issueId}/${this.serviceType === EIssueServiceType.EPICS ? "links" : "issue-links"}/`
    )
      .then(unwrapData)
      .catch(throwResponse);
  }

  async createIssueLink(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    data: Partial<TIssueLink>
  ): Promise<TIssueLink> {
    return this.post(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/${issueId}/${this.serviceType === EIssueServiceType.EPICS ? "links" : "issue-links"}/`,
      data
    )
      .then(unwrapData)
      .catch(throwResponse);
  }

  async updateIssueLink(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    linkId: string,
    data: Partial<TIssueLink>
  ): Promise<TIssueLink> {
    return this.patch(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/${issueId}/${this.serviceType === EIssueServiceType.EPICS ? "links" : "issue-links"}/${linkId}/`,
      data
    )
      .then(unwrapData)
      .catch(throwResponse);
  }

  async deleteIssueLink(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    linkId: string
  ): Promise<TApiMutationResponse> {
    return this.delete(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/${issueId}/${this.serviceType === EIssueServiceType.EPICS ? "links" : "issue-links"}/${linkId}/`
    )
      .then(unwrapData)
      .catch(throwResponseData);
  }

  async bulkOperations(
    workspaceSlug: string,
    projectId: string,
    data: TBulkOperationsPayload
  ): Promise<TApiMutationResponse> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/bulk-operation-issues/`, data)
      .then(unwrapData)
      .catch(throwResponseData);
  }

  async bulkDeleteIssues(
    workspaceSlug: string,
    projectId: string,
    data: {
      issue_ids: string[];
    }
  ): Promise<TApiMutationResponse> {
    return this.delete(`/api/workspaces/${workspaceSlug}/projects/${projectId}/bulk-delete-issues/`, data)
      .then(unwrapData)
      .catch(throwResponseData);
  }

  async bulkArchiveIssues(
    workspaceSlug: string,
    projectId: string,
    data: {
      issue_ids: string[];
    }
  ): Promise<{
    archived_at: string;
  }> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/bulk-archive-issues/`, data)
      .then(unwrapData)
      .catch(throwResponseData);
  }

  // issue subscriptions
  async getIssueNotificationSubscriptionStatus(
    workspaceSlug: string,
    projectId: string,
    issueId: string
  ): Promise<{
    subscribed: boolean;
  }> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/${issueId}/subscribe/`)
      .then(unwrapData)
      .catch(throwResponseData);
  }

  async unsubscribeFromIssueNotifications(
    workspaceSlug: string,
    projectId: string,
    issueId: string
  ): Promise<TApiMutationResponse> {
    return this.delete(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/${issueId}/subscribe/`
    )
      .then(unwrapData)
      .catch(throwResponseData);
  }

  async subscribeToIssueNotifications(
    workspaceSlug: string,
    projectId: string,
    issueId: string
  ): Promise<TApiMutationResponse> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/${issueId}/subscribe/`)
      .then(unwrapData)
      .catch(throwResponseData);
  }

  async bulkSubscribeIssues(
    workspaceSlug: string,
    projectId: string,
    data: {
      issue_ids: string[];
    }
  ): Promise<TApiMutationResponse> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/bulk-subscribe-issues/`, data)
      .then(unwrapData)
      .catch(throwResponseData);
  }

  async getIssueMetaFromURL(
    workspaceSlug: string,
    projectId: string,
    issueId: string
  ): Promise<{
    project_identifier: string;
    sequence_id: string;
  }> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/meta/`)
      .then(unwrapData)
      .catch(throwResponseData);
  }

  async retrieveWithIdentifier(
    workspaceSlug: string,
    project_identifier: string,
    issue_sequence: string,
    queries?: TIssueQueryParams
  ): Promise<TIssue> {
    return this.get(`/api/workspaces/${workspaceSlug}/work-items/${project_identifier}-${issue_sequence}/`, {
      params: queries,
    })
      .then((response: TApiResponse<TIssue>) => {
        // add is_epic flag when the service type is epic
        if (response.data && this.serviceType === EIssueServiceType.EPICS) {
          response.data.is_epic = true;
        }
        return response.data;
      })
      .catch(throwResponseData);
  }
}

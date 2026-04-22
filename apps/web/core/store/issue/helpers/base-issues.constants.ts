/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TIssue, TIssueOrderByOptions } from "@plane/types";
import type { TIssueDisplayFilterOptions } from "./base-issues.store";

// Maps group-by option keys to the corresponding TIssue property used for grouping
export const ISSUE_GROUP_BY_KEY: Record<TIssueDisplayFilterOptions, keyof TIssue> = {
  project: "project_id",
  state: "state_id",
  "state_detail.group": "state_id", // state_detail.group is only used for state_group display
  priority: "priority",
  labels: "label_ids",
  created_by: "created_by",
  assignees: "assignee_ids",
  target_date: "target_date",
  cycle: "cycle_id",
  module: "module_ids",
  team_project: "project_id",
};

// Maps display-filter keys to the TIssue property used for client-side filtering
export const ISSUE_FILTER_DEFAULT_DATA: Record<TIssueDisplayFilterOptions, keyof TIssue> = {
  project: "project_id",
  cycle: "cycle_id",
  module: "module_ids",
  state: "state_id",
  "state_detail.group": "state__group", // state_detail.group is only used for state_group display
  priority: "priority",
  labels: "label_ids",
  created_by: "created_by",
  assignees: "assignee_ids",
  target_date: "target_date",
  team_project: "project_id",
};

// Maps order-by option keys to the corresponding TIssue property used for client-side sorting
export const ISSUE_ORDERBY_KEY: Record<TIssueOrderByOptions, keyof TIssue> = {
  created_at: "created_at",
  "-created_at": "created_at",
  updated_at: "updated_at",
  "-updated_at": "updated_at",
  priority: "priority",
  "-priority": "priority",
  sort_order: "sort_order",
  state__name: "state_id",
  "-state__name": "state_id",
  assignees__first_name: "assignee_ids",
  "-assignees__first_name": "assignee_ids",
  labels__name: "label_ids",
  "-labels__name": "label_ids",
  issue_module__module__name: "module_ids",
  "-issue_module__module__name": "module_ids",
  issue_cycle__cycle__name: "cycle_id",
  "-issue_cycle__cycle__name": "cycle_id",
  target_date: "target_date",
  "-target_date": "target_date",
  estimate_point__key: "estimate_point",
  "-estimate_point__key": "estimate_point",
  start_date: "start_date",
  "-start_date": "start_date",
  link_count: "link_count",
  "-link_count": "link_count",
  attachment_count: "attachment_count",
  "-attachment_count": "attachment_count",
  sub_issues_count: "sub_issues_count",
  "-sub_issues_count": "sub_issues_count",
};

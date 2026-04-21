/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { IUserActivityResponse } from "@plane/types";

export type ActivityItem = IUserActivityResponse["results"][number];
export type ActivityItemActor = ActivityItem["actor_detail"];

const EXCLUDED_CREATED_FIELDS = ["cycles", "modules", "attachment", "link", "estimate"] as const;

const normalizeField = (field: ActivityItem["field"]): string => {
  if (field === null || field === undefined) {
    return "";
  }

  return String(field);
};

export const hasAvatarUrl = (actor: ActivityItemActor): boolean =>
  typeof actor.avatar_url === "string" && actor.avatar_url.length > 0;

export const isCommentActivity = (activity: ActivityItem): boolean => activity.field === "comment";

export const shouldRenderChangeActivity = (activity: ActivityItem): boolean => activity.field !== "updated_by";

export const isArchiveRestoreActivity = (activity: ActivityItem): boolean => String(activity.new_value ?? "") === "restore";

export const isArchivedByPlaneActivity = (activity: ActivityItem): boolean =>
  activity.field === "archived_at" && !isArchiveRestoreActivity(activity);

export const isNewIssueActivity = (activity: ActivityItem): boolean => {
  if (activity.verb !== "created" || Boolean(activity.field)) {
    return false;
  }

  const field = normalizeField(activity.field);
  return !EXCLUDED_CREATED_FIELDS.some((excludedField) => excludedField === field);
};

export const getActorDisplayName = (activity: ActivityItem, currentUserId?: string): string => {
  if (isArchivedByPlaneActivity(activity)) {
    return "Plane";
  }

  if (activity.actor_detail.is_bot) {
    return `${activity.actor_detail.first_name} Bot`;
  }

  return currentUserId === activity.actor_detail.id ? "You" : activity.actor_detail.display_name;
};

export const getActivityCommentValue = (activity: ActivityItem): string => {
  const candidate = activity.new_value !== "" ? activity.new_value : activity.old_value;
  if (candidate === null || candidate === undefined) {
    return "";
  }

  return String(candidate);
};

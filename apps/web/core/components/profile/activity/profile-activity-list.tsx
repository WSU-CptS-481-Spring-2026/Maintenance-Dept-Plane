/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect } from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
import { ActivitySettingsLoader } from "@/components/ui/loader/settings/activity";
// constants
import { USER_ACTIVITY } from "@/constants/fetch-keys";
// hooks
import { useUser } from "@/hooks/store/user";
// services
import { UserService } from "@/services/user.service";
import { ActivityChangeItem } from "./activity-change-item";
import { ActivityCommentItem } from "./activity-comment-item";
import type { ActivityItem } from "./activity-helpers";
import { isCommentActivity, shouldRenderChangeActivity } from "./activity-helpers";

const userService = new UserService();

type Props = {
  cursor: string;
  perPage: number;
  updateResultsCount: (count: number) => void;
  updateTotalPages: (count: number) => void;
  updateEmptyState: (state: boolean) => void;
};

export const ProfileActivityListPage = observer(function ProfileActivityListPage(props: Props) {
  const { cursor, perPage, updateResultsCount, updateTotalPages, updateEmptyState } = props;
  // store hooks
  const { data: currentUser } = useUser();

  const { data: userProfileActivity } = useSWR(
    USER_ACTIVITY({
      cursor,
    }),
    () =>
      userService.getUserActivity({
        cursor,
        per_page: perPage,
      })
  );

  useEffect(() => {
    if (!userProfileActivity) return;

    // if no results found then show empty state
    if (userProfileActivity.total_results === 0) updateEmptyState(true);

    updateTotalPages(userProfileActivity.total_pages);
    updateResultsCount(userProfileActivity.results.length);
  }, [updateResultsCount, updateTotalPages, userProfileActivity, updateEmptyState]);

  return userProfileActivity ? (
    <ul>
      {userProfileActivity.results.map((activityItem: ActivityItem) => {
        if (isCommentActivity(activityItem)) {
          return (
            <ActivityCommentItem
              key={activityItem.id}
              activity={activityItem}
              workspaceId={activityItem.workspace_detail?.id?.toString() ?? ""}
              workspaceSlug={activityItem.workspace_detail?.slug?.toString() ?? ""}
            />
          );
        }

        if (shouldRenderChangeActivity(activityItem)) {
          return (
            <ActivityChangeItem
              key={activityItem.id}
              activity={activityItem}
              currentUserId={currentUser?.id}
              showIssueLink={false}
            />
          );
        }

        return null;
      })}
    </ul>
  ) : (
    <ActivitySettingsLoader />
  );
});

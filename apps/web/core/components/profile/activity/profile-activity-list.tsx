/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { ActivitySettingsLoader } from "@/components/ui/loader/settings/activity";
// hooks
import { useUser } from "@/hooks/store/user";
import { ActivityChangeItem } from "./activity-change-item";
import { ActivityCommentItem } from "./activity-comment-item";
import type { ActivityItem } from "./activity-helpers";
import { isCommentActivity, shouldRenderChangeActivity } from "./activity-helpers";
import { useProfileActivityFeed } from "./use-profile-activity-feed";

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
  const userProfileActivity = useProfileActivityFeed({
    cursor,
    perPage,
    handlers: {
      updateResultsCount,
      updateTotalPages,
      updateEmptyState,
    },
  });

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

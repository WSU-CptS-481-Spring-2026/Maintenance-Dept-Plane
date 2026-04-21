/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// plane imports
import type { IUserActivityResponse } from "@plane/types";
// components
import { ActivitySettingsLoader } from "@/components/ui/loader/settings/activity";
import { ActivityCommentItem } from "./activity-comment-item";
import { ActivityChangeItem } from "./activity-change-item";
import type { ActivityItem } from "./activity-helpers";
import { isCommentActivity, shouldRenderChangeActivity } from "./activity-helpers";
// hooks
import { useWorkspace } from "@/hooks/store/use-workspace";
import { useUser } from "@/hooks/store/user";

type Props = {
  activity: IUserActivityResponse | undefined;
  showIssueLink?: boolean;
  useActivityWorkspace?: boolean;
};

export const ActivityList = observer(function ActivityList(props: Props) {
  const { activity, showIssueLink = true, useActivityWorkspace = false } = props;
  // params
  const { workspaceSlug } = useParams();
  // store hooks
  const { data: currentUser } = useUser();
  const { getWorkspaceBySlug } = useWorkspace();
  // derived values
  const workspaceId = getWorkspaceBySlug(workspaceSlug?.toString() ?? "")?.id ?? "";

  return (
    <>
      {activity ? (
        <ul>
          {activity.results.map((activityItem: ActivityItem) => {
            const itemWorkspaceSlug = useActivityWorkspace
              ? activityItem.workspace_detail?.slug?.toString() ?? ""
              : workspaceSlug?.toString() ?? "";
            const itemWorkspaceId = useActivityWorkspace
              ? activityItem.workspace_detail?.id?.toString() ?? ""
              : workspaceId;

            if (isCommentActivity(activityItem)) {
              return (
                <ActivityCommentItem
                  key={activityItem.id}
                  activity={activityItem}
                  workspaceId={itemWorkspaceId}
                  workspaceSlug={itemWorkspaceSlug}
                />
              );
            }

            if (shouldRenderChangeActivity(activityItem)) {
              return (
                <ActivityChangeItem
                  key={activityItem.id}
                  activity={activityItem}
                  currentUserId={currentUser?.id}
                  showIssueLink={showIssueLink}
                />
              );
            }

            return null;
          })}
        </ul>
      ) : (
        <ActivitySettingsLoader />
      )}
    </>
  );
});

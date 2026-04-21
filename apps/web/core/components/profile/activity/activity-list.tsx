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
// hooks
import { useWorkspace } from "@/hooks/store/use-workspace";
import { useUser } from "@/hooks/store/user";

type Props = {
  activity: IUserActivityResponse | undefined;
};

export const ActivityList = observer(function ActivityList(props: Props) {
  const { activity } = props;
  // params
  const { workspaceSlug } = useParams();
  // store hooks
  const { data: currentUser } = useUser();
  const { getWorkspaceBySlug } = useWorkspace();
  // derived values
  const workspaceId = getWorkspaceBySlug(workspaceSlug?.toString() ?? "")?.id ?? "";

  // TODO: refactor this component
  return (
    <>
      {activity ? (
        <ul>
          {activity.results.map((activityItem) => {
            if (activityItem.field === "comment") {
              return (
                <ActivityCommentItem
                  key={activityItem.id}
                  activity={activityItem}
                  workspaceId={workspaceId}
                  workspaceSlug={workspaceSlug?.toString() ?? ""}
                />
              );
            }

            if ("field" in activityItem && activityItem.field !== "updated_by") {
              return (
                <ActivityChangeItem
                  key={activityItem.id}
                  activity={activityItem}
                  currentUserId={currentUser?.id}
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

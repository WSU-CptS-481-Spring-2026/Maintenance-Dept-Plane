/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { MessageSquare } from "lucide-react";
import { calculateTimeAgo } from "@plane/utils";
// components
import { RichTextEditor } from "@/components/editor/rich-text";
import { ActivityAvatar } from "./activity-avatar";
import type { ActivityItem } from "./activity-helpers";
import { getActivityCommentValue, getActorDisplayName } from "./activity-helpers";

type ActivityCommentItemProps = {
  activity: ActivityItem;
  workspaceId: string;
  workspaceSlug: string;
};

export const ActivityCommentItem = ({
  activity,
  workspaceId,
  workspaceSlug,
}: ActivityCommentItemProps) => {
  return (
    <div key={activity.id} className="mt-2">
      <div className="relative flex items-start space-x-3">
        <div className="relative px-1">
          <ActivityAvatar actor={activity.actor_detail} size="medium" />
          <span className="ring-6 flex h-6 w-6 items-center justify-center rounded-full bg-layer-1 text-secondary ring-white absolute bottom-0 right-0">
            <MessageSquare className="h-6 w-6 !text-20 text-secondary" aria-hidden="true" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div>
            <div className="text-11">
              {getActorDisplayName(activity)}
            </div>
            <p className="mt-0.5 text-11 text-secondary">
              Commented {calculateTimeAgo(activity.created_at)}
            </p>
          </div>
          <div className="issue-comments-section p-0">
            <RichTextEditor
              editable={false}
              id={activity.id}
              initialValue={getActivityCommentValue(activity)}
              containerClassName="text-11 bg-surface-1"
              workspaceId={workspaceId}
              workspaceSlug={workspaceSlug}
              projectId={activity.project}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

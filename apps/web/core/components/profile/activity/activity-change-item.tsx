/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import Link from "next/link";
import { History } from "lucide-react";
import { calculateTimeAgo } from "@plane/utils";
// components
import { ActivityIcon, ActivityMessage, IssueLink } from "@/components/core/activity";
import { ActivityAvatar } from "./activity-avatar";
import type { ActivityItem } from "./activity-helpers";
import {
  getActorDisplayName,
  isArchivedByPlaneActivity,
  isArchiveRestoreActivity,
  isNewIssueActivity,
} from "./activity-helpers";

type ActivityChangeItemProps = {
  activity: ActivityItem;
  currentUserId: string | undefined;
};

export const ActivityChangeItem = ({
  activity,
  currentUserId,
}: ActivityChangeItemProps) => {
  const isNewIssue = isNewIssueActivity(activity);
  const isArchiveRestore = isArchiveRestoreActivity(activity);
  const isArchivedBy = isArchivedByPlaneActivity(activity);

  const getActorDisplay = () => {
    if (isArchivedBy) {
      return "Plane";
    }

    if (activity.actor_detail.is_bot) {
      return `${activity.actor_detail.first_name} Bot`;
    }

    return getActorDisplayName(activity, currentUserId);
  };

  const actorDisplay = getActorDisplay();

  const getActivityIcon = () => {
    if (activity.field && isArchiveRestore) {
      return <History className="h-5 w-5 text-secondary" />;
    }

    if (activity.field) {
      return <ActivityIcon activity={activity} />;
    }

    return <ActivityAvatar actor={activity.actor_detail} size="small" />;
  };

  const getActorElement = () => {
    if (isArchivedBy) {
      return <span className="text-gray font-medium">Plane</span>;
    }

    if (activity.actor_detail.is_bot) {
      return (
        <span className="text-gray font-medium">
          {activity.actor_detail.first_name} Bot
        </span>
      );
    }

    return (
      <Link
        href={`/${activity.workspace_detail?.slug}/profile/${activity.actor_detail.id}`}
        className="inline"
      >
        <span className="text-gray font-medium">{actorDisplay}</span>
      </Link>
    );
  };

  const message = isNewIssue ? (
    <span>
      created <IssueLink activity={activity} />
    </span>
  ) : (
    <ActivityMessage activity={activity} showIssue />
  );

  return (
    <li key={activity.id}>
      <div className="relative pb-1">
        <div className="relative flex items-start space-x-2">
          <>
            <div>
              <div className="relative px-1.5 mt-4">
                <div className="mt-1.5">
                  <div className="flex h-6 w-6 items-center justify-center">
                    {getActivityIcon()}
                  </div>
                </div>
              </div>
            </div>
            <div className="min-w-0 flex-1 border-b border-subtle py-4">
              <div className="break-words text-13 text-secondary">
                {getActorElement()}{" "}
                <div className="inline gap-1">
                  {message}{" "}
                  <span className="flex-shrink-0 whitespace-nowrap">
                    {calculateTimeAgo(activity.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </>
        </div>
      </div>
    </li>
  );
};

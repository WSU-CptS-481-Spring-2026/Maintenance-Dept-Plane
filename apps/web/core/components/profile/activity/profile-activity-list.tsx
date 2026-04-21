/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { ActivitySettingsLoader } from "@/components/ui/loader/settings/activity";
import { ActivityList } from "./activity-list";
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
    <ActivityList activity={userProfileActivity} showIssueLink={false} useActivityWorkspace />
  ) : (
    <ActivitySettingsLoader />
  );
});

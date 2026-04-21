/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect } from "react";
import useSWR from "swr";
import { USER_ACTIVITY } from "@/constants/fetch-keys";
import { UserService } from "@/services/user.service";

const userService = new UserService();

type ProfileActivityData = Awaited<ReturnType<UserService["getUserActivity"]>>;

type ProfileActivityMetaHandlers = {
  updateResultsCount: (count: number) => void;
  updateTotalPages: (count: number) => void;
  updateEmptyState: (state: boolean) => void;
};

type UseProfileActivityFeedOptions = {
  cursor: string;
  perPage: number;
  handlers: ProfileActivityMetaHandlers;
};

export const useProfileActivityFeed = ({
  cursor,
  perPage,
  handlers,
}: UseProfileActivityFeedOptions): ProfileActivityData | undefined => {
  const { updateResultsCount, updateTotalPages, updateEmptyState } = handlers;

  const { data: userProfileActivity } = useSWR(
    USER_ACTIVITY({ cursor }),
    () =>
      userService.getUserActivity({
        cursor,
        per_page: perPage,
      })
  );

  useEffect(() => {
    if (!userProfileActivity) return;

    if (userProfileActivity.total_results === 0) {
      updateEmptyState(true);
    }

    updateTotalPages(userProfileActivity.total_pages);
    updateResultsCount(userProfileActivity.results.length);
  }, [updateEmptyState, updateResultsCount, updateTotalPages, userProfileActivity]);

  return userProfileActivity;
};

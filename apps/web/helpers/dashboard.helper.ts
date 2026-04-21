/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { endOfMonth, endOfWeek, endOfYear, startOfMonth, startOfWeek, startOfYear } from "date-fns";
// helpers
// types
import { DURATION_FILTER_OPTIONS, EDurationFilters } from "@plane/constants";
import type { TIssuesListTypes } from "@plane/types";
// constants
import { renderFormattedDate, renderFormattedPayloadDate } from "@plane/utils";

// -------------------- DEPRECATED --------------------

const payloadDateRange = (start: Date, end: Date): string => {
  const firstDay = renderFormattedPayloadDate(start);
  const lastDay = renderFormattedPayloadDate(end);
  return `${firstDay};after,${lastDay};before`;
};

/**
 * @description returns date range based on the duration filter
 * @param duration
 */
export const getCustomDates = (duration: EDurationFilters, customDates: string[]): string => {
  const today = new Date();

  switch (duration) {
    case EDurationFilters.NONE:
      return "";
    case EDurationFilters.TODAY:
      return payloadDateRange(today, today);
    case EDurationFilters.THIS_WEEK:
      return payloadDateRange(startOfWeek(today), endOfWeek(today));
    case EDurationFilters.THIS_MONTH:
      return payloadDateRange(startOfMonth(today), endOfMonth(today));
    case EDurationFilters.THIS_YEAR:
      return payloadDateRange(startOfYear(today), endOfYear(today));
    case EDurationFilters.CUSTOM:
      return customDates.join(",");
  }
};

/**
 * @description returns redirection filters for the issues list
 * @param type
 */
export const getRedirectionFilters = (type: TIssuesListTypes): string => {
  const today = renderFormattedPayloadDate(new Date());

  switch (type) {
    case "pending":
      return "?state_group=backlog,unstarted,started";
    case "upcoming":
      return `?target_date=${today};after`;
    case "overdue":
      return `?target_date=${today};before`;
    default:
      return "?state_group=completed";
  }
};

/**
 * @description returns the tab key based on the duration filter
 * @param duration
 * @param tab
 */
export const getTabKey = (duration: EDurationFilters, tab: TIssuesListTypes | undefined): TIssuesListTypes => {
  if (!tab) return "completed";

  if (tab === "completed") return tab;

  if (duration === EDurationFilters.NONE) return "pending";
  if (["upcoming", "overdue"].includes(tab)) return tab;
  return "upcoming";
};

/**
 * @description returns the label for the duration filter dropdown
 * @param duration
 * @param customDates
 */
export const getDurationFilterDropdownLabel = (duration: EDurationFilters, customDates: string[]): string => {
  if (duration !== EDurationFilters.CUSTOM) {
    return DURATION_FILTER_OPTIONS.find((option) => option.key === duration)?.label ?? "";
  }

  const afterDate = customDates.find((date) => date.includes("after"))?.split(";")[0];
  const beforeDate = customDates.find((date) => date.includes("before"))?.split(";")[0];

  if (afterDate && beforeDate) return `${renderFormattedDate(afterDate)} - ${renderFormattedDate(beforeDate)}`;
  if (afterDate) return `After ${renderFormattedDate(afterDate)}`;
  if (beforeDate) return `Before ${renderFormattedDate(beforeDate)}`;
  return "";
};

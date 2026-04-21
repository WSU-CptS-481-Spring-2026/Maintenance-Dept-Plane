/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { EUserPermissionsLevel, getRandomLabelColor } from "@plane/constants";
import type { IIssueLabel } from "@plane/types";
import { EUserProjectRoles } from "@plane/types";
import { getTabIndex } from "@plane/utils";
import { useLabel } from "@/hooks/store/use-label";
import { useUserPermissions } from "@/hooks/store/user";
import { usePlatformOS } from "@/hooks/use-platform-os";
import type { IIssueLabelSelect } from "./issue-label-select.types";

type UseIssueLabelSelectControllerProps = Pick<
  IIssueLabelSelect,
  "workspaceSlug" | "projectId" | "values" | "onSelect" | "onAddLabel"
>;

export type TIssueLabelSelectControllerResult = {
  baseTabIndex: number;
  canCreateLabel: boolean;
  fetchLabels: () => Promise<void>;
  handleAddLabel: (labelName: string) => Promise<void>;
  isLoading: boolean;
  issueLabels: string[];
  projectLabels: IIssueLabel[] | undefined;
  query: string;
  searchInputKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  setQuery: (value: string) => void;
  submitting: boolean;
};

export const useIssueLabelSelectController = ({
  workspaceSlug,
  projectId,
  values,
  onSelect,
  onAddLabel,
}: UseIssueLabelSelectControllerProps): TIssueLabelSelectControllerResult => {
  const { isMobile } = usePlatformOS();
  const { fetchProjectLabels, getProjectLabels } = useLabel();
  const { allowPermissions } = useUserPermissions();

  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const latestValuesRef = useRef(values);

  useEffect(() => {
    latestValuesRef.current = values;
  }, [values]);

  const canCreateLabel =
    Boolean(projectId) &&
    allowPermissions([EUserProjectRoles.ADMIN], EUserPermissionsLevel.PROJECT, workspaceSlug, projectId);

  const projectLabels = getProjectLabels(projectId) as IIssueLabel[] | undefined;
  const issueLabels = values ?? [];
  const { baseTabIndex } = getTabIndex(undefined, isMobile);

  const fetchLabels = async () => {
    if (projectLabels || !workspaceSlug || !projectId) return;

    setIsLoading(true);
    try {
      await fetchProjectLabels(workspaceSlug, projectId);
    } catch {
      // Keep UI responsive if label fetch fails; caller can retry from UI.
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLabel = async (labelName: string) => {
    setSubmitting(true);
    try {
      const label = await onAddLabel(workspaceSlug, projectId, {
        name: labelName,
        color: getRandomLabelColor(),
      });
      const nextValues = [...latestValuesRef.current, label.id];
      onSelect(Array.from(new Set(nextValues)));
      setQuery("");
    } catch {
      // No-op for now; upstream handlers can surface errors via toast/state.
    } finally {
      setSubmitting(false);
    }
  };

  const searchInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (query !== "" && e.key === "Escape") {
      e.stopPropagation();
      setQuery("");
    }

    if (query !== "" && e.key === "Enter" && !e.nativeEvent.isComposing && canCreateLabel) {
      e.stopPropagation();
      e.preventDefault();
      void handleAddLabel(query);
    }
  };

  return {
    baseTabIndex,
    canCreateLabel,
    fetchLabels,
    handleAddLabel,
    isLoading,
    issueLabels,
    projectLabels,
    query,
    searchInputKeyDown,
    setQuery,
    submitting,
  };
};

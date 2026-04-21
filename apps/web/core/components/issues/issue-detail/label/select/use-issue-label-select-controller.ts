/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { EUserPermissionsLevel, getRandomLabelColor } from "@plane/constants";
import { EUserProjectRoles } from "@plane/types";
import { getTabIndex } from "@plane/utils";
import { useLabel } from "@/hooks/store/use-label";
import { useUserPermissions } from "@/hooks/store/user";
import { usePlatformOS } from "@/hooks/use-platform-os";
import type { IIssueLabelSelect } from "./label-select";

type UseIssueLabelSelectControllerProps = Pick<
  IIssueLabelSelect,
  "workspaceSlug" | "projectId" | "values" | "onSelect" | "onAddLabel"
>;

export const useIssueLabelSelectController = ({
  workspaceSlug,
  projectId,
  values,
  onSelect,
  onAddLabel,
}: UseIssueLabelSelectControllerProps) => {
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

  const projectLabels = getProjectLabels(projectId);
  const issueLabels = values ?? [];
  const { baseTabIndex } = getTabIndex(undefined, isMobile);

  const fetchLabels = async () => {
    if (projectLabels || !workspaceSlug || !projectId) return;

    setIsLoading(true);
    try {
      await fetchProjectLabels(workspaceSlug, projectId);
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
    } finally {
      setSubmitting(false);
    }
  };

  const searchInputKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (query !== "" && e.key === "Escape") {
      e.stopPropagation();
      setQuery("");
    }

    if (query !== "" && e.key === "Enter" && !e.nativeEvent.isComposing && canCreateLabel) {
      e.stopPropagation();
      e.preventDefault();
      await handleAddLabel(query);
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

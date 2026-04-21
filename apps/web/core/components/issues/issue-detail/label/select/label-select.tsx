/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Fragment, useState } from "react";
import { observer } from "mobx-react";
import { usePopper } from "react-popper";
import { Combobox } from "@headlessui/react";
// plane imports
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { PlusIcon } from "@plane/propel/icons";
import type { IIssueLabel } from "@plane/types";
import { IssueLabelSelectOptionsPanel } from "./issue-label-select-options-panel";
import type { TIssueLabelSelectOption } from "./issue-label-select-options-panel";
import { useIssueLabelSelectController } from "./use-issue-label-select-controller";
//constants
export interface IIssueLabelSelect {
  workspaceSlug: string;
  projectId: string;
  issueId: string;
  values: string[];
  onSelect: (_labelIds: string[]) => void;
  onAddLabel: (workspaceSlug: string, projectId: string, data: Partial<IIssueLabel>) => Promise<IIssueLabel>;
}

export const IssueLabelSelect = observer(function IssueLabelSelect(props: IIssueLabelSelect) {
  const { workspaceSlug, projectId, issueId, values, onSelect, onAddLabel } = props;
  const { t } = useTranslation();
  // states
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const {
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
  } = useIssueLabelSelectController({
    workspaceSlug,
    projectId,
    values,
    onSelect,
    onAddLabel,
  });

  const options: TIssueLabelSelectOption[] = (projectLabels ?? []).map((label) => ({
    value: label.id,
    query: label.name,
    content: (
      <div className="flex items-center justify-start gap-2 overflow-hidden">
        <span
          className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
          style={{
            backgroundColor: label.color,
          }}
        />
        <div className="line-clamp-1 inline-block truncate">{label.name}</div>
      </div>
    ),
  }));

  const filteredOptions =
    query === "" ? options : options?.filter((option) => option.query.toLowerCase().includes(query.toLowerCase()));

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-start",
    modifiers: [
      {
        name: "preventOverflow",
        options: {
          padding: 12,
        },
      },
    ],
  });

  const label = <span className="text-body-xs-medium text-placeholder">{t("label.select")}</span>;

  if (!issueId || !values) return <></>;

  return (
    <>
      <Combobox
        as="div"
        className="size-full flex-shrink-0 text-left"
        value={issueLabels}
        onChange={(value) => onSelect(value)}
        multiple
      >
        <Combobox.Button as={Fragment}>
          <Button
            ref={setReferenceElement}
            type="button"
            variant="tertiary"
            size="sm"
            prependIcon={<PlusIcon />}
            onClick={() => {
              void fetchLabels();
            }}
          >
            {label}
          </Button>
        </Combobox.Button>

        <IssueLabelSelectOptionsPanel
          attributes={attributes}
          baseTabIndex={baseTabIndex}
          canCreateLabel={canCreateLabel}
          createTypeText={t("label.create.type")}
          filteredOptions={filteredOptions}
          handleAddLabel={handleAddLabel}
          isLoading={isLoading}
          loadingText={t("common.loading")}
          noResultsText={t("common.search.no_matching_results")}
          popperStyle={styles.popper}
          query={query}
          searchInputKeyDown={searchInputKeyDown}
          searchPlaceholder={t("common.search.label")}
          setPopperElement={setPopperElement}
          setQuery={setQuery}
          submitting={submitting}
        />
      </Combobox>
    </>
  );
});

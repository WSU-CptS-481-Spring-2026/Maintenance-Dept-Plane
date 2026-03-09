/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React from "react";
import { observer } from "mobx-react";
// plane imports
import { CloseIcon } from "@plane/propel/icons";
import type { IFilterInstance } from "@plane/shared-state";
import type { TExternalFilter, TFilterProperty } from "@plane/types";

interface FilterItemNegationToggleProps<P extends TFilterProperty, E extends TExternalFilter> {
  conditionId: string;
  filter: IFilterInstance<P, E>;
}

export const FilterItemNegationToggle = observer(function FilterItemNegationToggle<
  P extends TFilterProperty,
  E extends TExternalFilter,
>(props: FilterItemNegationToggleProps<P, E>) {
  const { conditionId, filter } = props;

  const handleToggleNegation = () => {
    // placeholder for toggling negation logic, as the current filter expression structure does not support it yet
  };

  return (
    <button
      onClick={handleToggleNegation}
      className="px-1.5 text-placeholder hover:text-tertiary focus:outline-none bg-layer-transparent hover:bg-layer-transparent-hover"
      type="button"
      aria-label="Toggle negation"
    >
      <CloseIcon className="size-3.5" />
    </button>
  );
});

/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TAllAvailableOperatorsForDisplay, TSupportedOperators } from "@plane/types";

/**
 * Result type for operator conversion
 */
export type TOperatorForPayload = {
  operator: TSupportedOperators;
  isNegation: boolean;
};

/**
 * Converts a display operator to the format needed for supported by filter expression condition.
 * @param displayOperator - The operator from the UI
 * @param isNegated - Flag to indicate if the condition is negated
 * @returns Object with supported operator and negation flag
 */
export const getOperatorForPayload = (displayOperator: TAllAvailableOperatorsForDisplay, isNegated = false): TOperatorForPayload => {
  const operator = displayOperator as TSupportedOperators;

  return {
    operator,
    isNegation: isNegated,
  };
};

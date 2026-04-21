/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { IIssueLabel } from "@plane/types";

export type TAddIssueLabel = (
  workspaceSlug: string,
  projectId: string,
  data: Partial<IIssueLabel>
) => Promise<IIssueLabel>;

export interface IIssueLabelSelect {
  workspaceSlug: string;
  projectId: string;
  issueId: string;
  values: string[];
  onSelect: (_labelIds: string[]) => void;
  onAddLabel: TAddIssueLabel;
}

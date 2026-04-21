/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { IUserActivityResponse } from "@plane/types";
import { getFileURL } from "@plane/utils";

type ActivityItemActor = IUserActivityResponse["results"][number]["actor_detail"];

type ActivityAvatarProps = {
  actor: ActivityItemActor;
  size: "small" | "medium";
};

export const ActivityAvatar = ({ actor, size }: ActivityAvatarProps) => {
  const dimensions = size === "small" ? 24 : 30;
  const containerClass = size === "small" ? "h-6 w-6" : "h-7 w-7";

  const hasValidAvatar = actor.avatar_url && actor.avatar_url !== "";

  if (hasValidAvatar) {
    return (
      <img
        src={getFileURL(actor.avatar_url)}
        alt={`${actor.display_name}'s avatar`}
        height={dimensions}
        width={dimensions}
        className={`${containerClass} rounded-full object-cover border-2 border-white`}
      />
    );
  }

  return (
    <div
      className={`${containerClass} grid place-items-center rounded-full border-2 border-white ${
        size === "small" ? "bg-gray-700 text-11" : "bg-gray-500 text-on-color"
      } capitalize`}
    >
      {actor.display_name?.[0]}
    </div>
  );
};

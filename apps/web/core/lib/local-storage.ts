/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { isEmpty } from "lodash-es";

const isBrowser = (): boolean => typeof window !== "undefined";

const serializeStorageValue = (value: object | string | boolean): string | undefined => {
  if (typeof value === "string" || typeof value === "boolean") return value.toString();
  if (isEmpty(value)) return undefined;
  return JSON.stringify(value);
};

export const storage = {
  set: (key: string, value: object | string | boolean): void => {
    if (!isBrowser() || !key || !value) return undefined;
    const tempValue: string | undefined = value ? serializeStorageValue(value) : undefined;
    if (!tempValue) return undefined;
    window.localStorage.setItem(key, tempValue);
  },

  get: (key: string): string | undefined => {
    if (!isBrowser()) return undefined;
    const item = window.localStorage.getItem(key);
    return item ? item : undefined;
  },

  remove: (key: string): void => {
    if (!isBrowser() || !key) return undefined;
    window.localStorage.removeItem(key);
  },
};

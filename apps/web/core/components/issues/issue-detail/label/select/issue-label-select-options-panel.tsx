/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Combobox } from "@headlessui/react";
import { Loader } from "lucide-react";
import { CheckIcon, SearchIcon } from "@plane/propel/icons";

export type TIssueLabelSelectOption = {
  value: string;
  query: string;
  content: React.ReactNode;
};

type Props = {
  attributes: {
    popper?: Record<string, unknown>;
  };
  baseTabIndex: number;
  canCreateLabel: boolean;
  createTypeText: string;
  filteredOptions: TIssueLabelSelectOption[];
  handleAddLabel: (labelName: string) => Promise<void>;
  isLoading: boolean;
  loadingText: string;
  noResultsText: string;
  popperStyle: React.CSSProperties;
  query: string;
  searchInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => Promise<void>;
  searchPlaceholder: string;
  setPopperElement: (element: HTMLDivElement | null) => void;
  setQuery: (value: string) => void;
  submitting: boolean;
};

export const IssueLabelSelectOptionsPanel = ({
  attributes,
  baseTabIndex,
  canCreateLabel,
  createTypeText,
  filteredOptions,
  handleAddLabel,
  isLoading,
  loadingText,
  noResultsText,
  popperStyle,
  query,
  searchInputKeyDown,
  searchPlaceholder,
  setPopperElement,
  setQuery,
  submitting,
}: Props) => (
  <Combobox.Options className="fixed z-10">
    <div
      className="z-10 my-1 w-48 whitespace-nowrap rounded-sm border border-strong bg-surface-1 py-2.5 text-11 shadow-raised-200 focus:outline-none"
      ref={setPopperElement}
      style={popperStyle}
      {...(attributes.popper ?? {})}
    >
      <div className="px-2">
        <div className="flex w-full items-center justify-start rounded-sm border border-subtle bg-surface-2 px-2">
          <SearchIcon className="h-3.5 w-3.5 text-tertiary" />
          <Combobox.Input
            className="w-full bg-transparent px-2 py-1 text-11 text-secondary placeholder:text-placeholder focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            onKeyDown={(e) => {
              void searchInputKeyDown(e);
            }}
            tabIndex={baseTabIndex}
          />
        </div>
      </div>

      <div className="vertical-scrollbar scrollbar-sm mt-2 max-h-48 space-y-1 overflow-y-scroll px-2 pr-0">
        {isLoading ? (
          <p className="text-center text-secondary">{loadingText}</p>
        ) : filteredOptions.length > 0 ? (
          filteredOptions.map((option) => (
            <Combobox.Option
              key={option.value}
              value={option.value}
              className={({ selected }) =>
                `flex cursor-pointer select-none items-center justify-between gap-2 truncate rounded-sm px-1 py-1.5 hover:bg-layer-1 ${
                  selected ? "text-primary" : "text-secondary"
                }`
              }
            >
              {({ selected }) => (
                <>
                  {option.content}
                  {selected && (
                    <div className="flex-shrink-0">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </div>
                  )}
                </>
              )}
            </Combobox.Option>
          ))
        ) : submitting ? (
          <Loader className="spin h-3.5 w-3.5" />
        ) : canCreateLabel ? (
          <Combobox.Option
            value={query}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!query.length) return;
              void handleAddLabel(query);
            }}
            className={`text-left text-secondary ${query.length ? "cursor-pointer" : "cursor-default"}`}
          >
            {query.length ? (
              <>
                {/* TODO: Translate here */}+ Add <span className="text-primary">&quot;{query}&quot;</span> to labels
              </>
            ) : (
              createTypeText
            )}
          </Combobox.Option>
        ) : (
          <p className="text-left text-secondary">{noResultsText}</p>
        )}
      </div>
    </div>
  </Combobox.Options>
);

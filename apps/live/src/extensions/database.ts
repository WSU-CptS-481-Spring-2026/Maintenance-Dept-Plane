/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Database as HocuspocusDatabase } from "@hocuspocus/extension-database";
// plane imports
import {
  getAllDocumentFormatsFromDocumentEditorBinaryData,
  getBinaryDataFromDocumentEditorHTMLString,
} from "@plane/editor";
import { logger } from "@plane/logger";
// lib
import { AppError } from "@/lib/errors";
// services
import { getPageService } from "@/services/page/handler";
// type
import type { FetchPayloadWithContext, StorePayloadWithContext } from "@/types";
import { ForceCloseReason, CloseCode } from "@/types/admin-commands";
import { broadcastError } from "@/utils/broadcast-error";
// force close utility
import { forceCloseDocumentAcrossServers } from "./force-close-handler";

const fetchDocument = async ({ context, documentName: pageId, instance }: FetchPayloadWithContext) => {
  try {
    const service = getPageService(context.documentType, context);
    const response = (await service.fetchDescriptionBinary(pageId));
    const binaryData = new Uint8Array(response);

    if (binaryData.byteLength === 0) {
      const pageDetails = await service.fetchDetails(pageId);
      const convertedBinaryData = getBinaryDataFromDocumentEditorHTMLString(
        pageDetails.description_html ?? "<p></p>",
        pageDetails.name
      );

      if (convertedBinaryData) {
        try {
          const { contentBinaryEncoded, contentHTML, contentJSON } = getAllDocumentFormatsFromDocumentEditorBinaryData(
            convertedBinaryData,
            true
          );

          await service.updateDescriptionBinary(pageId, {
            description_binary: contentBinaryEncoded,
            description_html: contentHTML,
            description: contentJSON,
          });
        } catch (e) {
          const error = new AppError(e);
          logger.error("Failed to save binary after first conversion from html:", error);
        }

        return convertedBinaryData;
      }
    }

    return binaryData;
  } catch (error) {
    const appError = new AppError(error, { context: { pageId } });
    logger.error("Error in fetching document", appError);

    await broadcastError(instance, pageId, "Unable to load the page. Please try refreshing.", "fetch", context);

    throw appError;
  }
};

const storeDocument = async ({
  context,
  state: pageBinaryData,
  documentName: pageId,
  instance,
}: StorePayloadWithContext) => {
  try {
    const service = getPageService(context.documentType, context);

    const { contentBinaryEncoded, contentHTML, contentJSON } = getAllDocumentFormatsFromDocumentEditorBinaryData(
      pageBinaryData,
      true
    );

    await service.updateDescriptionBinary(pageId, {
      description_binary: contentBinaryEncoded,
      description_html: contentHTML,
      description: contentJSON,
    });
  } catch (error) {
    const appError = new AppError(error, { context: { pageId } });
    logger.error("Error in updating document:", appError);

    const isContentTooLarge = appError.statusCode === 413;
    const shouldDisconnect = isContentTooLarge;

    let errorMessage: string;
    let errorCode: "content_too_large" | "page_locked" | "page_archived" | undefined;

    if (isContentTooLarge) {
      errorMessage = "Document is too large to save. Please reduce the content size.";
      errorCode = "content_too_large";
    } else {
      errorMessage = "Unable to save the page. Please try again.";
    }

    await broadcastError(instance, pageId, errorMessage, "store", context, errorCode, shouldDisconnect);

    if (shouldDisconnect) {
      const reason =
        errorCode === "content_too_large" ? ForceCloseReason.DOCUMENT_TOO_LARGE : ForceCloseReason.CRITICAL_ERROR;

      const closeCode = errorCode === "content_too_large" ? CloseCode.DOCUMENT_TOO_LARGE : CloseCode.FORCE_CLOSE;

      await forceCloseDocumentAcrossServers(instance, pageId, reason, closeCode);
      return;
    }

    throw appError;
  }
};

export class Database extends HocuspocusDatabase {
  constructor() {
    super({ fetch: fetchDocument, store: storeDocument });
  }
}

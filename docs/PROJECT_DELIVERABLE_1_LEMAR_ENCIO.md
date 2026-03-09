# Lemar Encio - Change Requests

## Change Request 1: Issue #8706 – Decrease ideal work item precision

**Change Description**

The Work Item Burndown chart tooltip showed the "Ideal work items" value with full floating-point precision (e.g., 11.733333333333333), which made it hard to read. The change rounds numeric tooltip values to one decimal place (e.g., 11.7 or 13.2), improving readability while preserving the same information.

**Program Comprehension**

- Located the burndown chart in `apps/web/core/components/cycles/active-cycle/productivity.tsx` and `apps/web/core/components/modules/analytics-sidebar/issue-progress.tsx`.
- Traced the chart to `@plane/propel` and its `CustomTooltip` in `packages/propel/src/charts/components/tooltip.tsx`.
- Confirmed that `CustomTooltip` is shared by area, bar, line, radar, and scatter charts.
- Identified that Recharts passes interpolated values into the tooltip, producing long decimals.
- Verified that the tooltip renders `item.value` directly from the payload without formatting.

**Pre/Post-Factoring Activities (if applicable)**

N/A — no refactoring was done.

**Bug Localization (if applicable)**

N/A — this was a feature improvement, not a bug fix.

**Change Impact Analysis**

- **Dependencies:** The change depends on the Recharts payload structure and the `CustomTooltip` component. No new external dependencies were introduced.
- **Affected Components:** `packages/propel/src/charts/components/tooltip.tsx` — the shared tooltip used by all chart types (area, bar, line, radar, scatter).
- **Scope of Impact:** Limited to tooltip display formatting. Chart data, calculations, and backend logic are unchanged.
- **Risks:** Low. The formatter only affects non-integer numbers; integers are passed through unchanged. Potential risk of rounding very small decimals (e.g., 0.001) to 0.0, but such values are unlikely in burndown charts.

**Change Implementation**

A `formatTooltipValue` helper was added to `CustomTooltip` that checks if the value is a number and not an integer. If so, it rounds to one decimal place using `value.toFixed(1)` and returns the result as a number. Integers and non-numeric values are returned unchanged. The tooltip now renders `formatTooltipValue(item?.value)` instead of `item?.value`. This approach was chosen over rounding at the data source because it centralizes formatting in the tooltip and applies consistently across all charts that use `CustomTooltip`, including the burndown chart.

**File(s) Updated:**

- `packages/propel/src/charts/components/tooltip.tsx`

**Unit and Regression Testing**

Manual testing was performed to verify that the burndown chart tooltip displays rounded values (e.g., 11.7 instead of 11.733333333333333). No existing unit tests were modified; the change is display-only and does not alter business logic. Regression risk is low since the formatter is additive and does not change how data is fetched or computed.

**Code Review**

This change was committed to a feature branch (`fix/ideal-work-item-tooltip-precision`) and is intended for submission as a pull request to the upstream Plane repository. Code review would follow the project's standard process (e.g., CursorrabbitAI or maintainer review) prior to merge.

**Documentation Updates**

No user-facing documentation updates were required. Inline comments in the tooltip component document the purpose of `formatTooltipValue`.

---

## Change Request 2: Issue #8643 – Group by Modules doesn't show Work Items from archived modules

**Change Description**

When a module was archived but its child work items were not, those work items disappeared from the "Group by Module" view. They did not appear in any column, including "None." The change ensures that work items whose only module is archived now appear in the "None" column, matching user expectations and aligning with other grouping behaviors (e.g., Labels, Assignees).

**Program Comprehension**

- Searched for "Group by Module" and "getGroupByColumns" to locate grouping logic.
- Identified `apps/web/core/components/issues/issue-layouts/utils.tsx` and `getModuleColumns`, which calls `getProjectModuleDetails` from the module store.
- Found that `getProjectModuleDetails` in `apps/web/core/store/module.store.ts` filters out archived modules (`!m.archived_at`), so the frontend only renders columns for active modules plus "None."
- Traced the API side to `apps/api/plane/utils/grouper.py` (`issue_group_values`) and `apps/api/plane/utils/paginator.py` (`__query_multi_grouper`).
- Discovered that `issue_group_values` for modules returned all modules (including archived), while the frontend excluded archived modules. Work items in archived modules were grouped under an archived-module ID that had no corresponding column, making them invisible.

**Pre/Post-Factoring Activities (if applicable)**

N/A — no refactoring was done. Changes were additive and localized to grouping logic.

**Bug Localization (if applicable)**

The bug was localized to two areas:

1. **API (`grouper.py`):** `issue_group_values` for `issue_module__module_id` returned archived modules, so the paginator created groups for them. Work items in archived modules were placed in those groups.
2. **API (`paginator.py`):** Results with group IDs not in `group_by_fields` (e.g., archived module IDs) were still emitted. The frontend had no column for these groups, so the work items were never displayed.
3. **Frontend/API mismatch:** The frontend's `getModuleColumns` excluded archived modules, so columns existed only for active modules and "None." The API returned data for archived-module groups that the frontend did not render.

**Change Impact Analysis**

- **Dependencies:** Module store, issue paginator, grouper utilities, and the Space app's equivalent grouper.
- **Affected Components:** `apps/api/plane/utils/grouper.py`, `apps/api/plane/utils/paginator.py`, `apps/api/plane/space/utils/grouper.py`.
- **Scope of Impact:** Limited to "Group by Module" (and sub-group by module) behavior. No changes to issue data models, other grouping modes, or backend services.
- **Risks:** Low. Orphaned groups are explicitly mapped to "None." Edge cases (e.g., work items in multiple modules where some are archived) are handled by treating archived module IDs as "None" for display and grouping.

**Change Implementation**

1. **`apps/api/plane/utils/grouper.py`:** In `issue_group_values` for `issue_module__module_id`, added `archived_at__isnull=True` to the Module filter so only non-archived modules are returned as group columns.
2. **`apps/api/plane/space/utils/grouper.py`:** Applied the same filter for consistency in the Space app.
3. **`apps/api/plane/utils/paginator.py`:** In `GroupedOffsetPaginator.__query_multi_grouper`, when a result's `group_id` is not in `group_by_fields` (e.g., archived module ID), it is mapped to `"None"` and added to the "None" group. The "None" total count includes counts from orphaned groups. In `SubGroupedOffsetPaginator.__query_multi_grouper`, the same mapping is applied for both group and sub-group when they are orphaned, with dynamic creation of sub-group entries when needed.

This approach was chosen over adding archived-module columns on the frontend because it aligns with user expectations (work items in archived modules should appear in "None") and keeps the fix in the API layer where grouping is defined.

**File(s) Updated:**

- `apps/api/plane/utils/grouper.py`
- `apps/api/plane/utils/paginator.py`
- `apps/api/plane/space/utils/grouper.py`

**Unit and Regression Testing**

Manual testing was performed to verify that work items in archived modules appear in the "None" column when "Group by Module" is enabled. No new unit tests were added; the change modifies API grouping logic. Regression risk is mitigated by the explicit mapping of orphaned groups to "None" and by the limited scope of the change.

**Code Review**

This change was committed to a feature branch (`fix/group-by-module-archived-module-8643`) and is intended for submission as a pull request to the upstream Plane repository. Code review would follow the project's standard process prior to merge.

**Documentation Updates**

No user-facing documentation updates were required. Inline comments in the grouper and paginator explain the rationale for excluding archived modules and mapping orphaned groups to "None."

---

## Change Request 3: Issue #8673 – Improve TEXT version in (multipart) eMail notification

**Change Description**

Plane sends multipart email notifications (HTML + plain TEXT). When users configure their mail client (e.g., Thunderbird) to prefer the TEXT version for security (to see real URLs instead of obfuscated links), the plain text part is poorly formatted. The current implementation uses `strip_tags(html_content)`, which removes HTML tags but leaves behind raw CSS from `<style>` blocks and, critically, loses link URLs—`<a href="url">link text</a>` becomes only "link text" with no URL. The change improves the TEXT part so that links include their URLs (e.g., "View issue (https://…)" or "link text <url>"), and style blocks are excluded, making the plain text version readable and navigable.

**Program Comprehension**

- Located email sending logic in `apps/api/plane/bgtasks/email_notification_task.py` (`send_email_notification`).
- Identified that `text_content = strip_tags(html_content)` (line 263) generates the plain text from the HTML template.
- Reviewed `apps/api/plane/templates/emails/notifications/issue-updates.html` to understand structure: links for issue URL, project URL, user preferences, and "View issue"; inline `<style>` blocks; and rich HTML layout.
- Confirmed that Django's `strip_tags` removes tags but does not convert `<a href="url">text</a>` to include the URL, and does not remove `<style>` content.
- Traced `EmailMultiAlternatives` usage: `body` is the plain text part, `attach_alternative` adds the HTML part.

**Pre/Post-Factoring Activities (if applicable)**

N/A — no refactoring was done. Changes are additive to the email generation logic.

**Bug Localization (if applicable)**

N/A — this is a feature improvement (better plain text formatting), not a bug fix.

**Change Impact Analysis**

- **Dependencies:** Django's `EmailMultiAlternatives`, `strip_tags`, and the issue-updates HTML template. Optional: BeautifulSoup or regex for link extraction if used.
- **Affected Components:** `apps/api/plane/bgtasks/email_notification_task.py` — the `send_email_notification` task.
- **Scope of Impact:** Limited to the plain text body of issue notification emails. HTML part and other email types (invitations, password reset, etc.) are unchanged.
- **Risks:** Low. The change only affects the `body` parameter passed to `EmailMultiAlternatives`. Risk of malformed plain text if link extraction fails; fallback to current `strip_tags` behavior can mitigate this.

**Change Implementation**

<describe how the change was implemented here. If not yet implemented: create a helper (e.g., `html_to_plain_text_with_urls`) that (1) removes `<style>...</style>` blocks before processing, (2) converts `<a href="url">text</a>` to `text (url)` or `text <url>`, (3) strips remaining tags, (4) normalizes whitespace. Replace `text_content = strip_tags(html_content)` with `text_content = html_to_plain_text_with_urls(html_content)`. Mention files updated and why this approach was chosen vs. a separate plain text template.>

**Unit and Regression Testing**

<talk about what testing was performed here. If not yet implemented: describe planned manual testing (send test notification, view in Thunderbird with "prefer TEXT") and any unit tests for the conversion helper.>

**Code Review**

<explain the review process for the change here. If not yet implemented: note that the change would go through the project's standard review process prior to merge.>

**Documentation Updates**

<explain all updates that were made to the documentation for this issue here. If none: no user-facing documentation changes required; inline comments in the helper would document the rationale.>

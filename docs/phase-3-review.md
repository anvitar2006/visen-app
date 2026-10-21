# Phase 3 — functional planning review

The approved Phase 2 typography, palette, photography, navigation, open compositions, and both themes remain the visual foundation. The later [UI refinement report](phase-3-refinement.md) documents the quieter copy/typography and expanded validation. [Phase 4](phase-4-plan.md) remains a proposal only. Planning edits open in a focused, keyboard-accessible dialog rather than adding permanent controls to every surface. Search stays visible; extra filters and sorting are disclosed when needed.

## What works

- **Tasks:** create, edit, delete with confirmation, complete/reopen, change status/priority/category, independently set planned day and deadline, leave tasks unscheduled, and add optional timed blocks with a duration. Today includes up to three priorities, direct completion, editable tasks, upcoming timed plans, and a separate disclosure for due/overdue tasks. Deadlines never move automatically with a planned day.
- **One planning document:** List, Calendar, Board, and Timeline derive from the same task and commitment arrays. Editing from any view updates all views immediately. Search, category/status/priority filters, and planned-day/deadline/priority/title sorting share that projection. List grouping supports day, category, priority, and status. Board status changes use the task editor, without requiring drag-and-drop.
- **Calendar:** navigate daily, weekly, or monthly calendars. The month overview opens a daily agenda. Weekly day selection works on narrow screens. Commitments can span midnight; time blocks and commitments appear on each day they occupy. Daily busy windows and occupied-hour summaries show overlaps. Busy totals merge overlapping intervals rather than counting the same time twice. Flexible tasks do not occupy time. Unscheduled tasks remain accessible below Calendar/Timeline and in List/Board.
- **Goals:** create/edit/delete goals; add/edit/delete/complete milestones; link tasks to a goal and optional milestone; review linked tasks. Progress follows completed milestones, or completed linked tasks when no milestones exist. Explicitly completing a goal records 100%; changing a milestone does not silently change the goal's status. Targets can be edited. Deleting a goal preserves its tasks and habits and clears their links; milestone history is removed with the deleted milestones.
- **Habits:** create/edit/delete, pause, choose 1–7 completions per week or selected weekdays, and toggle one completion per day. Review previous/next weeks. Future days are disabled. Consistency is shown as completed days against the current target; no streaks, penalties, points, or rewards. Completing on another weekday still counts toward consistency.
- **Your space:** edit a name and vision, choose an IANA planning time zone, manage named categories using five accessible color palettes, and choose device/light/dark appearance. The sidebar theme toggle and the four-view preference persist. Categories always include labels; task urgency remains separate from category color. Deleting a category reassigns all its plans to the first remaining category after confirmation. The last category cannot be removed.
- **Data controls:** JSON export, validated import with replacement review, fictional sample-data loading with replacement confirmation, and reset requiring `RESET`. Replacement stores a recovery copy of the previous saved document before writing. Export is a local download; no file or plan is sent to a server. The last 20 successful planning edits can be undone during the current session, including delete/import/reset. Undo is not a permanent backup and is cleared on refresh.

## Storage and integrity

`src/domain/storage.ts` defines a Zod-validated version 2 document stored under `visen-planning`. Version 1 flat documents migrate through `parseData`; unsupported future versions and invalid documents are not overwritten. Appearance-only Phase 2 preferences are carried forward when a new document is created. Migration is validated on read and persisted on the next successful edit.

All mutations validate a cloned document, write it, and only then update the screen. Failed storage writes leave the editor and existing data intact and show an error. Validation covers real calendar dates, bounded text/counts, valid IANA zones, unique IDs, category/goal/milestone references, positive durations, commitment ranges, completion subjects/retractions, and one active habit completion per day. Goal/milestone/category deletions deliberately repair links. History records are removed with their subject.

A storage event and pre-write document comparison detect a stale tab and block normal editing until reload. Use one editing tab: local storage is not a transactional multi-user database, and this protection is not a distributed concurrency guarantee. Import/reset can explicitly recover a blocked document, retaining the current saved document as a recovery copy first. Storage errors can also prevent recovery-copy writes; export before reset if space is low. The original remains untouched if making the backup fails.

Date-only plans and deadlines are calendar strings, never converted through the device time zone. Scheduled instants are stored as UTC timestamps. Commitments retain their entered IANA zone; the planner displays all plans in the selected planning zone. Changing that zone preserves instants and updates timed-task planned dates while leaving untimed planned dates and historical habit days intact. Nonexistent DST wall times are rejected; repeated hours choose the earlier occurrence. Midnight clock-change exceptions keep the agenda available and label the busy summary accordingly. There is no automatic recurring scheduling.

## Private interactive preview on your existing iPad Codespace

No new Codespace or public deployment is needed. Stop the running server with **Ctrl+C**, then run in that existing editor terminal:

```bash
git fetch origin
git switch feature/phase-3-planning
git pull --ff-only origin feature/phase-3-planning
npm ci
npm run build && npm run start
```

If Git reports local changes, stop and review them; do not discard or force-reset them. Once the server says **Ready**, refresh the existing forwarded port **3000** URL. Keep its visibility **Private**. Remain signed into GitHub in Safari. No authentication or user accounts have been added to Visen itself.

This uses your existing Codespaces compute/storage allowance. Keep paid usage blocked at the $0 limit and stop the Codespace when finished. Do not assume unused allowances or a stopped machine guarantee zero storage usage. No additional paid service was enabled for Phase 3.

New installations start empty; use **Your space → Load fictional sample plans** to explore examples. Examples are shifted to the current week and stay labeled as including sample plans. Reset/export before replacing examples with personal plans. Existing Phase 2 previews contained no saved planning records to migrate.

Your plans stay in Safari storage for that preview's origin. They are not synchronized with GitHub, another device, another browser, or another preview URL. Private port forwarding protects access to the preview; it does not turn local storage into secure accounts. Browser data clearing, private browsing, storage eviction, or changing the preview origin can make plans unavailable. Export before switching browser/preview origins or deleting a Codespace. The recovery copy is in the same browser and is not an independent backup.

## Suggested founder review

1. Create a task, give it a deadline and a different planned day, and set an optional time block.
2. Open Week and switch through all four views. Edit the task from Board, then confirm its new date/status in List and Calendar. Search and try **Filter & sort**.
3. Add a commitment overlapping a block. Open the daily agenda and inspect its busy summary; try month navigation.
4. Create a goal, add milestones, link a task, and complete a milestone. Confirm the progress calculation matches what you intended.
5. Create a weekly habit and record a couple of days, then review the preceding week.
6. Rename a category and change its color. Try light/dark/device appearance in Your space.
7. Refresh, export, import that copy after confirming replacement, and try undo. Only reset after exporting anything you want to keep.

## Screenshots

These use explicitly fictional plans for a stable visual review. New personal spaces start empty.

| View         | iPad landscape · light                                  | iPad portrait · light                            | iPad landscape · dark                                  |
| ------------ | ------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------ |
| Today        | [Open](../artifacts/ipad-landscape-today-light.png)     | [Open](../artifacts/ipad-portrait-today.png)     | [Open](../artifacts/ipad-landscape-today-dark.png)     |
| Week         | [Open](../artifacts/ipad-landscape-week-light.png)      | [Open](../artifacts/ipad-portrait-week.png)      | [Open](../artifacts/ipad-landscape-week-dark.png)      |
| My Vision    | [Open](../artifacts/ipad-landscape-my-vision-light.png) | [Open](../artifacts/ipad-portrait-my-vision.png) | [Open](../artifacts/ipad-landscape-my-vision-dark.png) |
| Habits       | [Open](../artifacts/ipad-landscape-habits-light.png)    | [Open](../artifacts/ipad-portrait-habits.png)    | [Open](../artifacts/ipad-landscape-habits-dark.png)    |
| Sana preview | [Open](../artifacts/ipad-landscape-sana-light.png)      | [Open](../artifacts/ipad-portrait-sana.png)      | [Open](../artifacts/ipad-landscape-sana-dark.png)      |

Additional functional surfaces: [task editor](../artifacts/phase-3-editor-834-light.png), [daily agenda](../artifacts/phase-3-day-834-light.png), [monthly overview on mobile](../artifacts/phase-3-month-390-dark.png), and [profile/data controls](../artifacts/phase-3-settings-834-light.png). Planning-view screenshots for List/Calendar/Board/Timeline are also available for landscape, portrait, and mobile in both themes in `artifacts/`.

## Verification and limits

Final validation: `npm run build`, `npm run typecheck`, and `npm run format:check` passed. `npm test` passed **30 tests** in 59.7 seconds against the production build. The suite refreshed 60 PNG screenshots.

Automated checks cover domain validation/migration and invalid relationships; date, leap-year, DST and zone behavior; task CRUD and all-view synchronization; goal/milestone links and deletion; habit targets/history; category reassignment; preferences and refresh persistence; import/export/reset/recovery; storage quota errors and stale tabs; keyboard dialogs/navigation; responsive overflow; and automated WCAG A/AA checks. Screenshots in `artifacts/` include iPad landscape/portrait and mobile, both themes, four planning views, and task editors. See the final review report for exact command results.

Browser checks run Chromium in tablet/mobile viewports. Actual iPad Safari, touch keyboards, downloads, and file import still need founder review. Automated accessibility checks do not replace a screen-reader audit.

Limits: browser-local, single-person data only; no cloud synchronization, recurring plans, reminders, calendar integrations, drag-and-drop, or permanent undo history. List/Board cover all filtered plans; weekly Calendar/Timeline cover the selected week, with unscheduled tasks shown separately. The monthly overview uses counts on compact screens and opens a daily agenda. Habit history retains completed days but uses the habit's current target rather than historical target versions. JSON import replaces, rather than merges, documents and is capped at 8 MB. No field-level sensitive-data encryption is provided.

Sana remains a clearly labeled scripted interface; her sample prompts/context are fictional and do not interpret or modify personal plans. Conversational onboarding and rule-based personalized guidance remain Phase 4. Live AI, authentication, databases, paid services, public deployment, Momentum, private circles, referrals, and merging main were not implemented or activated.

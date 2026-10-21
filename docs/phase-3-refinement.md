# Phase 3 refinement and validation

The founder accepted the task workflows and requested a quieter UI plus validation of the remaining planning features. This pass stays on `feature/phase-3-planning`. Phase 4 is a document only: [Sana implementation proposal](phase-4-plan.md).

## UI review

| Surface          | Refinement                                                                                                                                                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared shell     | Removed repeated sidebar and footer slogans, redundant breadcrumb text, and stacked page subtitles. Preserved the Visen wordmark, tagline, navigation, palette, photo, and both themes.                                                               |
| Typography       | Supporting text uses regular/medium weights. Removed the 600-weight font import and 600-weight eyebrow styling; prevented synthesized bold/italic faces. Task names and selected priorities retain useful emphasis.                                   |
| Today            | One greeting, priorities, upcoming plans, and a compact Sana preview. Removed the intention banner and repeated encouragement. Tasks, deadlines, and daily habits remain available through shorter disclosures.                                       |
| List             | Removed the introduction above grouping; kept all group/sort/filter controls and record details.                                                                                                                                                      |
| Calendar         | Removed the explanatory footer and duplicate daily heading. Weekday labels appear once per month grid. Planned dates, deadlines, timed blocks, busy/overlap summaries, the planning zone, and accessible full date labels remain.                     |
| Board            | Removed the introductory paragraph and repeated completion praise. Status columns and commitments identify the content directly.                                                                                                                      |
| Timeline         | Removed the three-part introduction and closing reassurance. Dates and goal-linked milestones carry the hierarchy.                                                                                                                                    |
| My Vision        | Shows the user's saved vision, an edit action, and goals. Removed the generic aspiration headline, image caption, count slogan, and closing sentence. Milestone/task details and progress remain.                                                     |
| Habits           | Weekly dates, navigation, targets, and completion controls replace the introduction and reminder banners. Future-day and paused-habit restrictions remain.                                                                                            |
| Settings/editors | Shortened labels and helpers. Progress explanations and recovery details are expandable. Browser-storage limits, import replacement, destructive consequences, date/deadline rules, time zones, DST behavior, and discard confirmations remain clear. |
| Sana             | One invitation heading and writing space, sample prompts, one compact scripted/no-live-AI disclosure, and optional sample context. No onboarding or intelligence was implemented.                                                                     |

Theme toggling no longer adds a redundant “Appearance saved” banner. Navigation clears the previous screen's success message; Undo remains available in the top bar. Changes to actual planning data still receive a save result.

## Validation coverage

The production-build browser suite includes the earlier task, synchronized-view, preference, migration, storage-error, responsive, and accessibility checks. Additional cases exercise:

- Goal title/description/target/status edits; complete/reopen and derived progress; milestone editing/completion/deletion; relationship rejection when moving a linked milestone; undo restoring task links/history; refresh persistence.
- Habit target/name edits, pause/reactivation, completion/retraction, delete/undo, retained history, and refresh persistence.
- Commitment date/time/zone rescheduling, DST-gap rejection without overwriting the prior record, deletion, undo, and refresh persistence.
- Full-document export/import round trips with tasks, commitments, goals, milestones, habits, categories, preferences, and completion events; invalid relationship imports leaving existing data untouched; recovery-copy downloads.

A date-dependent initial-render mismatch was found when browser and server clocks were on different days. Today now waits for client initialization before displaying the date. The existing browser test captures runtime errors while using a deliberately fixed browser date, verifying that this edge case no longer produces a hydration error.

The first expanded goal test also required a corrected accessible-name selector for its prefilled description field. This was a test lookup issue, not a lost edit or persistence failure.

## Screenshots

The complete screenshot matrix remains in [the Phase 3 guide](phase-3-review.md#screenshots). All 60 screenshots are refreshed from the tests, using explicitly fictional plans.

Selected examples: [Today](../artifacts/ipad-landscape-today-light.png), [Week portrait](../artifacts/ipad-portrait-week.png), [My Vision](../artifacts/ipad-landscape-my-vision-light.png), [Habits](../artifacts/ipad-landscape-habits-light.png), [Sana dark](../artifacts/ipad-landscape-sana-dark.png), and [Settings](../artifacts/phase-3-settings-834-light.png).

## Final check results

| Check            | Result                                                        |
| ---------------- | ------------------------------------------------------------- |
| Production build | Pass — `npm run build`                                        |
| TypeScript       | Pass — `npm run typecheck`                                    |
| Formatting       | Pass — `npm run format:check`                                 |
| Automated tests  | 30 passed in 59.7 seconds — `npm test`                        |
| Screenshots      | 60 updated PNGs, covering both themes and tablet/mobile sizes |

No unresolved implementation failures were found in these automated Phase 3 workflows. This is not a claim of complete real-device or assistive-technology coverage; the limits below still apply.

## Remaining limits

Plans remain local to the browser and preview origin. There is no account, cloud sync, recurrence, calendar integration, or permanent undo history. Imports replace documents after confirmation. Habit history uses the current habit target, not historical target versions. Existing stale-tab checks are not a distributed multi-user transaction system.

Actual iPad Safari file download/import behavior and assistive-technology testing still need device review. Automated Chromium tablet/mobile checks do not establish complete Safari or screen-reader coverage. No live AI, paid service, public deployment, main merge, or Phase 4 code was added.

## Update the existing private preview

Stop the running server with **Ctrl+C**. Wait for the `$` prompt before entering the next command—commands pasted into a running server do not update the checkout.

```bash
git pull --ff-only origin feature/phase-3-planning
```

After it finishes successfully, run:

```bash
npm run build && npm run start
```

When the terminal says **Ready**, refresh the existing Visen tab. Keep port 3000 Private. No dependency installation or new Codespace is needed for this pass. Existing Codespaces compute/storage allowance still applies. If Git reports local changes, preserve/review them rather than force-resetting them.

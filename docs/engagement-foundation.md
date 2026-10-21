# Engagement foundations — Phase 2 boundary

This addition prepares data contracts and reusable presentation. It does not implement reflection, rewards, sharing, referrals, AI, or functional planning. No future feature appears in navigation. All records and completion events are fictional fixtures; no activity history is collected from users.

## Small shared foundation

`src/domain/planning.ts` defines goals, milestones, tasks, habits, and completion events independently of React, storage, and AI providers. Records have stable IDs and creation/update timestamps. Tasks can reference goals and milestones. Milestones belong to goals and have explicit ordering. Habits use flexible weekly targets or chosen weekdays and can pause. Task planning dates and deadlines are separate.

The typed fixture records in `sample-planning.ts` feed the current visual adapters in `sample.ts`. Display labels, colors, and illustrative progress snapshots remain outside the domain contracts. Goal totals, habit-day snapshots, and Today’s progress are still sample presentation, not implemented user-facing aggregation. All four planning previews now derive from the same task and commitment fixture records, including status, category, priority, planned dates, scheduled start times, and milestone links. The original title-keyed weekly agenda copies were removed. Full task/commitment writes and scheduling logic still belong to Phase 3.

A completion has its own ID, a typed subject reference, occurrence timestamp, intended local date, and IANA time zone. Undoing a completion can reference the original completion ID without erasing the fact that it happened. One sample task demonstrates completion and retraction. This is a contract and a read-only example, not an event bus, analytics pipeline, points ledger, or event-sourced application.

Before writes become available, Phase 3 must validate dates, IDs, relationships, and recurrence rules at the storage boundary. Record status and completion history must update atomically. Retried writes must reuse their event ID; habit completions must be unique per habit/local date, and retracted completions must not count as effective progress. An explicitly logged skipped/rest day is different from missing data; this prototype does not collect either. Removing real user data must include its related history according to a reviewed deletion policy; a retraction is not a substitute for deletion.

## How the future capabilities fit

| Capability                | Foundation available now                                                                                                                    | Deferred decision/work                                                                                                                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Weekly Reflection & Reset | Dated, linked completions and task/goal/milestone relationships can inform a future weekly summary.                                         | Week boundaries in the user's time zone; explanations of challenges must come from voluntary input, not be inferred from missed completions. Schedule-change history and approved next-week changes need a later milestone.                  |
| Visen Momentum            | Milestone identity, completion/retraction history, flexible habits, and paused states distinguish meaningful progress from raw task volume. | Founder-approved recognition policy, deduplication, and undo handling. No points, streaks, rankings, reward eligibility, or notification system exists. Rest and different abilities must not be penalized.                                  |
| Accountability Circles    | Stable goal IDs allow future selected-goal projections without coupling private records to a group.                                         | Authentication, membership authorization, explicit per-goal sharing grants, revocation, moderation, and deletion. Private by default; a circle must never receive raw completion history, profile, or Sana conversations automatically.      |
| Referral Rewards          | No dependency on the planning model is needed. Keep eventual referral attribution separate from personal achievements.                      | Reviewed incentives/costs, explicit participation, attribution, abuse controls, and a server-verified reward ledger. Never treat client completion events as referral eligibility.                                                           |
| Sana Intelligence         | Typed planning relationships and time-aware history can supply limited, approved context later.                                             | Server-side model calls, allowlisted context, spending controls, source references, and explicit proposal approval. Do not send the entire history by default or infer sensitive traits. No model is called or user context transmitted now. |

The fixtures have no authentication owner. When accounts are approved, ownership must come from a verified server session and database authorization, not a caller-supplied owner ID. Shared read models should contain only explicitly selected fields. This document proposes those future boundaries; it does not establish security controls that have not been built.

## Visual and navigation reuse

- `SectionHeader` provides the existing editorial heading/accessory treatment for planning and future reflection surfaces.
- `ProgressBar` presents labeled, accessible progress without comparative scoring.
- `PreviewCompletion` shares the current circle/day completion styles and clearly remains a non-mutating preview.
- `NavigationButton` consistently renders selection, icons, and keyboard focus in the existing desktop sidebar and mobile drawer. The sidebar scrolls on shorter tablet screens so controls remain reachable as approved destinations grow. `primaryNavigation` contains only implemented views; add a future destination only when its approved milestone is usable.
- Existing ivory/blush/espresso/sage theme tokens, serif/sans hierarchy, reduced-motion support, and responsive layouts remain the visual vocabulary. A future private-group indicator or milestone acknowledgement should use these existing surfaces rather than create a separate game-like visual language.

No feature registry, plugin system, background jobs, services, new dependencies, or placeholder screens were added. The planning contracts remain deliberately small and may evolve at the approved functional milestone.

## Verification

The fixture test checks unique IDs, goal/milestone links, valid dated event references, retraction integrity, unique habit-day occurrences, and consistency with the current visible sample status. The existing browser suite checks both themes, all current views, iPad/mobile layouts, preview behavior, and accessibility. None of these tests claim that the deferred features work.

## Approved Phase 2 refinement

The founder authorized read-only List, Calendar, Board, and Timeline presentations, plus visual refinements. These use the same task/commitment records and do not add editing, persistence, or future engagement functionality. Sana remains a clearly labeled scripted preview. Future onboarding must ask one question at a time, adapt only to voluntarily supplied context, and obtain explicit approval before saving a profile or changing plans. No current screen claims these capabilities are available.

## Phase 3 update

The founder subsequently authorized functional local planning. Completion controls now write validated local completion/retraction records, and progress is calculated from milestones/tasks and habit days. See [Phase 3](phase-3-review.md) for persistence, relationship integrity, and privacy limits. This supersedes the historical read-only descriptions above for planning behavior only; reflections, rewards, circles, referrals, live AI, and Phase 4 onboarding remain unimplemented.

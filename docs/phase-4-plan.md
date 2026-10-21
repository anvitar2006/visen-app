# Phase 4 proposal — Sana

**Status: plan only; awaiting founder approval.** No onboarding logic, recommendation engine, proposal application code, model integration, paid API, external service, or database is introduced by this document.

## Product outcome

Sana should help someone understand what matters, make a realistic plan, and leave room for the rest of life. Her first useful outcome is a small, approved profile and one workable next step—not a completed questionnaire or an impressive-looking chat transcript.

Preserve Visen's wordmark, serif/sans hierarchy, warm colors, restrained S mark, open writing area, responsive navigation, and both themes. Show one question or one recommendation at a time. Use short conversational sentences, a few relevant response options when useful, and an optional free-text field. Avoid stacked headings, decorative avatars, message bubbles around every sentence, typing theatrics, repeated disclaimers, and generic encouragement. Accessibility explanations belong in labels and contextual details when they are not essential visible copy.

## Scope and honest capability

The recommended Phase 4 implementation is **local guided onboarding and rule-based planning assistance**, consistent with the original milestone boundaries. It can adapt to confirmed answers and real planning records without a model, API key, or cost per conversation. A small persistent label, “Guided · local,” and a concise explanation in contextual help should make that limitation clear. Until implemented, the existing Sana screen remains a scripted preview.

This is not a promise of unrestricted natural-language intelligence. Branching rules cannot reliably understand arbitrary life stories, infer nuanced intent, or invent a truly personalized strategy from free text. Free text can express a goal or note; Sana must ask the user to confirm any structured meaning before using it. For example, a user can choose “Wellbeing” and “My week varies,” then describe running in their own words. The selected answers support the next question; the free text is not secretly classified by a model.

If unrestricted, live AI conversation is required for the first onboarding release, that would be a separate architecture, privacy, provider, and spending decision. Do not quietly substitute an LLM for the guided approach. Real AI remains outside this proposed implementation until separately approved.

### Included after approval

- Optional, skippable, adaptive onboarding with one question at a time.
- Reviewable profile fields, explicit save approval, and subsequent profile editing.
- Structured setup for goals, schedules, and habits through the existing editors or reviewable drafts.
- A small set of local recommendations using approved context and saved planning data.
- An explicit proposal review/apply path; no silent planning changes.
- Clear reasons, missing-information follow-ups, stale-data protection, undo, and accessible responsive UI.

### Excluded

Live model calls, sensitive inference, raw-transcript storage, passive monitoring, autonomous schedule changes, reminders/notifications, external calendars, authentication, cloud sync, public deployment, rewards, weekly-reflection engines, Momentum, private circles, and referrals. No placeholders for these features will appear in navigation.

## Onboarding experience

### Entry and first question

Offer “Meet Sana” when a space is new; allow “Plan on my own.” Returning users can begin from the existing Sana navigation without losing their plans. Existing approved name, vision, categories, tasks, habits, and commitments remain intact. Onboarding must never reset a planning document. When examples are present, ask which records the user wants treated as personal context. Do not treat Alex’s fictional profile or sample completion history as facts about the user. Unconfirmed or mixed-origin history stays out of personal progress claims; demo recommendations remain explicitly labeled as examples.

A possible opening is: “What would you like to make more room for?” A short answer can lead toward clearer priorities, less crowded weeks, a particular goal, or a routine. This is an example of tone and branching, not a fixed ten-message script.

### Progressive conversation

Collect the minimum needed to be useful, typically a few exchanges; do not promise a fixed completion count when follow-ups vary. Cover the following topics over time rather than demanding all of them before opening the planner:

| Area                  | What Sana may ask                                            | How it changes the next step                                                                                            |
| --------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Current context       | “What does most of your week revolve around?”                | Use the user's chosen work, care, study, transition, or self-described context; avoid student-only assumptions.         |
| Aspirations and focus | “What would you like to be different a few months from now?” | Establish one user-named aspiration and, with confirmation, its current focus.                                          |
| Important goals       | “Which part would you like to start with?”                   | Choose one initial goal; offer additional goals later.                                                                  |
| Responsibilities      | “Which commitments are least flexible?”                      | Distinguish fixed commitments, deadlines, and movable tasks; existing records can be reviewed instead of entered again. |
| Weekly rhythm         | “Does your week follow a pattern, or change quite a bit?”    | Stable weeks can use availability windows; variable weeks can begin with flexible tasks and one chosen day.             |
| Personal priorities   | “What would you like your plans to leave space for?”         | Respect rest, relationships, movement, creativity, or a self-described priority without turning all of them into tasks. |
| Habits                | “Is there one small routine you want to make easier?”        | Create an optional habit draft and ask for its frequency; avoid assigning a target automatically.                       |
| Planning difficulty   | “What tends to get in the way?”                              | Offer a smaller plan, clearer ordering, fewer timed blocks, or a follow-up about capacity.                              |
| Planning style        | “Would you rather keep things flexible or choose times?”     | Decide whether a proposed action needs an exact time or only a planned date.                                            |
| Accountability        | “How much guidance would you like when you open Sana?”       | Offer quiet, on-request, or more structured in-app guidance; no notifications or implied monitoring.                    |

Ask only an applicable next question. If responsibilities already exist in the calendar, ask whether to use them rather than asking the user to retype them. Never treat absent answers as evidence that someone has no responsibilities or unlimited free time.

Every question supports **Skip**, **Back**, and **Finish later**. A skipped answer remains unknown. Optional topics can be revisited deliberately, without nagging. A short explanation is available only when a question needs context. Sana acknowledges substantive answers briefly and specifically; she need not praise every response.

### Adaptive example

User confirms that their weekly rhythm varies, chooses movement as a priority, and names running as a possible habit. Sana can ask: “Would you rather pick two days, or keep two runs flexible this week?” If the user says two runs are unrealistic, ask what would fit. Do not assign two runs or claim they are feasible before the user agrees.

If the user chooses recruiting and has three saved application deadlines, Sana can ask which deadline is least flexible. She should not infer unemployment, financial circumstances, academic standing, or a mental-health condition from that context.

### Profile review and setup

Show one compact review with editable fields: context, aspiration/current focus, planning style, voluntarily chosen priorities, and guidance preference. Each uncertain structured interpretation must be confirmed here or earlier. Use the user's words for user-authored descriptions. Do not manufacture a psychological assessment.

The action **Save profile** is explicit approval. **Keep editing** and **Not now** remain available. Changing an existing saved profile shows the changed fields instead of silently replacing them. Store only approved fields; no inferred sensitive data and no unnecessary conversation details.

Then offer a single useful setup action, such as adding one goal, reviewing this week's commitments, or choosing one habit. Each opens a prefilled draft or a proposal review, where the user can edit, approve, or discard it. Saving a profile does not implicitly approve new tasks, habits, goals, milestones, or commitments.

Unapproved session answers stay in memory and are cleared on reload or explicit discard. Warn before discarding an unfinished review. “Finish later” returns to the planner; it does not imply that unsaved answers will survive refresh. Previously approved fields can be revisited later. Persistent conversation drafts or transcripts are outside this initial scope.

## Personalized planning assistance

Start with a small, testable set of requests. Always use actual record IDs and confirmed context, and name the reason for a recommendation in one short sentence. Expandable context can show the records and assumptions involved.

| Request                      | Local reasoning                                                                                                       | Useful response                                                                                            |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| What matters today?          | Open tasks, explicit priorities, distinct deadlines, goal links, planned day, and known durations.                    | Up to three suggested priorities with reasons. A deadline does not silently become a planned date.         |
| Help me plan this week       | Saved commitments/time blocks, selected focus, user-approved availability, task estimates, and preferred flexibility. | A small draft plan, with unresolved items kept unscheduled.                                                |
| Tomorrow feels too full      | Union of occupied intervals, overlaps, user-specified capacity, deadlines, and flexible work.                         | Explain the conflict and offer one or two movable tasks for review; never move a commitment automatically. |
| What progress have I made?   | Completed milestones, linked task status, and actual habit completion events for a stated period.                     | A factual summary and one optional next step, without praise inflated beyond the data.                     |
| Can I make room for a habit? | Chosen weekly target, recorded commitments, availability, and selected planning style.                                | Ask for missing availability or offer a draft window; calendar gaps are not proof of free time.            |
| What could I do next?        | Active goal, incomplete milestone, related tasks, and known task size.                                                | Offer an existing next action, or ask the user to define a small step when the goal is too broad.          |

Do not silently estimate that every task takes 30 minutes, assume an eight-hour workday, or fill every free calendar interval. Ask for a duration or capacity when it changes the advice. Distinguish known busy time from unknown availability. Include user-selected buffers and protected time when provided. If the plan does not fit, say so plainly and ask what can move; do not prescribe a busier day.

Category colors are organizational preferences, not urgency or personality signals. Completed/paused tasks and goals should not be treated as new priorities. Long-term milestone targets can guide a next step but do not justify inventing precise intermediate deadlines.

When data is insufficient, ask one useful follow-up or give a clearly limited observation. No fabricated memory, progress, obligations, or emotional diagnosis. Recommendations update when the user asks or changes the relevant context, without unsolicited engagement loops.

## Approval before changes

Use a small proposal object in session memory, separate from the saved planning document. It contains stable proposal/operation IDs, source record IDs, base revision, proposed field changes, a short reason, and any unresolved assumptions. This is a simple review contract, not an agent framework or background job system.

The lifecycle is **draft → review → approved/applying → applied**, with **edited**, **dismissed**, and **stale** alternatives. Generating or displaying a proposal never writes user data. Conversational agreement alone does not save it: show a clear **Apply changes** action on the review.

For an existing item, show before/after dates, times, priority, category, and goal links that will change. Keep planned days and deadlines separate. For new items, show all material details, including whether they are flexible or timed. Users can edit drafts and deselect individual operations. Do not combine destructive changes with a harmless-looking “Plan my week” button. The first release should not suggest deletions at all.

Apply the selected, explicitly approved operations in one existing validated local transaction. Recheck revision and affected records at apply time. If anything has changed or a referenced goal/category disappeared, mark the draft stale and ask for a refreshed review. Do not silently retarget it or partially save a batch.

Stable entity IDs, a consumed proposal state, and the revision check prevent double-click/retry duplication. An applied proposal cannot be submitted again against its old revision. Record completion events only for actual, explicitly approved completion actions. Show a short result and the existing Undo control. Undo must restore the full accepted transaction, including relationships and completion history.

Profile changes require a field review and explicit save just as planning changes do. Sana must never treat onboarding answers, a suggested schedule, or prior approval of a different proposal as blanket permission.

## Implementation approach after approval

Extend the current local architecture rather than replace it:

- Add pure, typed question-selection and recommendation functions under a small Sana domain module. Inputs are session answers, confirmed profile fields, and a read-only projection of planning records. Outputs are the next question, a recommendation, or a draft proposal.
- Add an ephemeral Sana session state in the feature layer. It holds the current question, back/skip navigation, unapproved answers, and one current proposal. Keep raw conversation outside local storage.
- Extend the validated planning schema to **version 3** for the minimal approved profile fields. Write and test a v2→v3 migration that preserves all Phase 3 records, dates, IDs, category choices, preferences, and history. Continue supporting earlier imports through sequential migrations. Do not reinterpret existing free-text vision fields.
- Route approved changes through the existing provider's validation, persistence, stale-tab checks, relationship handling, and undo. No separate task store for Sana. No schema writes before profile approval, except an explicit migration preserving already approved data.
- Reuse existing Sana composition, native dialogs/disclosures, form fields, planning editors, category labels, focus handling, and theme tokens. Render a brief review inline or in the existing dialog pattern rather than introducing a dashboard of advice cards.
- Keep future live-model generation behind a documented replacement boundary. A later server-side provider may propose the same typed outputs, but every output must still pass validation and approval. No client keys, server AI route, provider SDK, account connection, or external context transmission is added in Phase 4.

No notification scheduler, vector database, embeddings, event bus, or new paid infrastructure is needed. The local approach adds no model-call charges. Existing development/preview compute still consumes the founder's current Codespaces allowance.

## Delivery sequence and acceptance

| Milestone               | Deliverable                                                                                            | Acceptance evidence                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 4A: context and session | Minimal schema/migration, ephemeral question state, back/skip/exit behavior, and review contract.      | Existing data migrates without loss; unapproved profile fields are not persisted; unknown answers remain unknown.                        |
| 4B: guided onboarding   | Adaptive one-question flow, concise profile review, explicit save, optional structured setup.          | First-time and returning users can skip or finish later; no forced questionnaire; no duplicate commitments or inferred sensitive fields. |
| 4C: useful assistance   | The bounded local rules above, reasons, insufficient-context follow-ups, and editable draft proposals. | Recommendations use saved facts, preserve deadlines, respect known constraints, and stay honest about unknown capacity.                  |
| 4D: approval and review | Atomic proposal apply, stale-data protection, undo, polish, and full validation.                       | No writes without explicit approval; double submission is safe; tests and iPad review pass before further scope.                         |

The founder can approve this scope as a whole or approve 4A–4B first. Do not begin any Phase 4 coding until that approval arrives. After implementation, stop for review before real AI or launch infrastructure.

### Required tests

1. Branch selection from confirmed context; no repeated answered questions; back/skip changes recompute subsequent questions; no sensitive inference from wording or categories.
2. New, returning, partially set-up, empty, and example-data spaces; preserving prior plans; profile review/edit/save/decline; raw transcript and draft answers absent from persistence and exports.
3. Deterministic recommendations with missing durations, no availability, overlapping/overnight blocks, overdue tasks, paused goals, conflicting priorities, and sparse completion history.
4. Date-only versus instant behavior across IANA zones, DST gaps/repeats, week/year boundaries, and later changes to the planning zone.
5. Proposal preview performs zero writes; edit/deselect/dismiss, explicit apply, double-click/retry, stale revisions, deleted references, invalid operations, and atomic batch rejection. Every view reflects an approved change; Undo restores the complete transaction.
6. Validated import/export and migrations with the new profile fields; quota errors and stale tabs; reload behavior and privacy limits remain visible at the relevant decision.
7. Keyboard and screen-reader flow: focus moves to a new question without announcing an entire transcript; choices and custom responses have labels; progress/save messages are concise; review and confirmations are reachable; reduced motion and both themes work.
8. iPad landscape/portrait and mobile screenshots plus real iPad Safari review. No cramped response chips, unnecessary banners, repeated explanations, or regressions to the approved visual identity.

## Approval requested

Approve the guided, browser-local Phase 4 scope and its four delivery milestones, or identify changes to the experience before coding. Specifically confirm whether this transparent rule-based release is the intended next step. Live AI requires a separate proposal and approval and is not included here.

# Visen — Phase 2 design review

Branch: `design/phase-2`. This is a running, read-only sample-data application. The branch is published for review; main is unchanged. No app hosting, Codespace, paid service, account system, database, or AI integration has been created.

## The refined experience

- **Today:** a personal greeting, one short intention, three priorities, and an early Sana note. Supporting tasks and rituals use native disclosure controls. Upcoming plans come from the same records as the planner. The example day is October 20, 2026 at 10 AM.
- **Week:** an editorial seven-day calendar with fine rules and labeled category markers. Timed commitments use a quiet outline; scheduled tasks are labeled time blocks. Narrower tablets/phones get a seven-day selector and a roomy day agenda.
- **My Vision:** a personal letter alongside a natural notebook/plant photograph, followed by three open goal rows. Colored goal cards have been removed.
- **Habits:** a spacious consistency table without a global productivity score or punitive streak language. The weekly table becomes labeled ritual rows on smaller devices.
- **Sana:** an open S signature, editorial prompt rows, selected sample context, and an ephemeral note field. The screen explicitly labels its scripted preview. No chatbot bubbles, AI avatar, live inference, or onboarding flow.

The Visen wordmark retains its original DM Serif Display typography, size, and letter spacing. Serif italics are reserved for the vision letter. Main titles use a 34–44px scale; section titles use roughly 24–29px; functional body text uses 14–16px. Small contextual labels have been enlarged; the most compact calendar metadata is 10–11px. Device-level Safari readability and VoiceOver still need a real iPad session.

## Screenshots: running application

| Screen    | iPad landscape, light                                   | iPad portrait, light                             | Representative dark                                    |
| --------- | ------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------ |
| Today     | [Open](../artifacts/ipad-landscape-today-light.png)     | [Open](../artifacts/ipad-portrait-today.png)     | [Open](../artifacts/ipad-landscape-today-dark.png)     |
| Week      | [Open](../artifacts/ipad-landscape-week-light.png)      | [Open](../artifacts/ipad-portrait-week.png)      | [Open](../artifacts/ipad-landscape-week-dark.png)      |
| My Vision | [Open](../artifacts/ipad-landscape-my-vision-light.png) | [Open](../artifacts/ipad-portrait-my-vision.png) | [Open](../artifacts/ipad-landscape-my-vision-dark.png) |
| Habits    | [Open](../artifacts/ipad-landscape-habits-light.png)    | [Open](../artifacts/ipad-portrait-habits.png)    | [Open](../artifacts/ipad-landscape-habits-dark.png)    |
| Sana      | [Open](../artifacts/ipad-landscape-sana-light.png)      | [Open](../artifacts/ipad-portrait-sana.png)      | [Open](../artifacts/ipad-landscape-sana-dark.png)      |

These are browser viewport captures, not physical iPad Safari screenshots. Mobile captures are also in `artifacts/`. Screenshots are review artifacts, not approved visual-regression baselines.

## Four views of one plan

In **Week**, use the List / Calendar / Board / Timeline tabs. They support pointer, touch, Arrow Left/Right, Home, and End. All views derive from the same immutable task and commitment records. Switching is a local presentation choice; no records are copied into independent stores or persisted.

| View     | What to try                                                                                                                                                                  | Landscape                                                       | Portrait                                                       |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------- |
| List     | Group the same plans by day, category, priority, or status.                                                                                                                  | [Open](../artifacts/ipad-landscape-planning-list-light.png)     | [Open](../artifacts/ipad-portrait-planning-list-light.png)     |
| Calendar | Compare flexible tasks and timed commitments. On compact screens select Thursday.                                                                                            | [Open](../artifacts/ipad-landscape-planning-calendar-light.png) | [Open](../artifacts/ipad-portrait-planning-calendar-light.png) |
| Board    | Review To do / In progress / Completed. Wide-screen columns scroll independently; compact screens select one column at a time. Commitments remain a separate scheduled list. | [Open](../artifacts/ipad-landscape-planning-board-light.png)    | [Open](../artifacts/ipad-portrait-planning-board-light.png)    |
| Timeline | Follow daily plans alongside linked milestone target dates.                                                                                                                  | [Open](../artifacts/ipad-landscape-planning-timeline-light.png) | [Open](../artifacts/ipad-portrait-planning-timeline-light.png) |

These presentations are interactive previews, not editing workflows. Dragging, changing status, creating plans, scheduling writes, and saving view preference remain Phase 3 work. Calendar is a representative weekly layout; a full daily/monthly calendar is not implemented.

## Color and cognitive simplicity

Categories use muted sage (wellbeing), dusty blue (work/focus), lavender (creativity/reflection), and taupe (personal/connection). Dusty rose marks selected controls and priority flags. Each category also has a text label, and high priority has an explicit flag/label independent of category. These are editable-category foundations, not universal claims about color psychology. Custom categories/colors require Phase 3.

Shared warm light/dark tokens define surfaces, text, dividers, focus, and semantic tones. The follow-up color pass adds blush to the daily intention and vision letter, sage to Sana and habit introduction surfaces, and quiet category tags. Selected planning tabs use blush in both themes. Native details/summary elements progressively reveal supporting Today content. Both themes respect reduced motion and provide visible keyboard focus. Sidebar controls remain reachable on short tablets.

## Validation

Run `npm run build`, `npm run typecheck`, `npm run format:check`, and `npm test`.

The suite checks record identity and relationships, completion/retraction fixtures, all four planning projections, grouping, keyboard tabs, responsive calendar/board choices, disclosures, no-op planning controls, theme persistence, mobile drawer focus, and overflow. Axe scans cover all main views in both landscape themes plus all four planner modes in light/dark at landscape, portrait, and phone widths.

Automated checks do not establish complete accessibility compliance. Real Safari/VoiceOver, physical touch comfort, and larger text settings remain device review items.

## Private interactive review on an iPad — approval still required

The simplest proposed option is **GitHub Codespaces with a Private forwarded port**. It runs a development machine, without publishing a production website. No Codespace has been created.

After founder approval:

1. Check GitHub account allowance/billing settings. Use a personal-account 2-core codespace if available and suitable. Do not enable paid overage without approval.
2. Open the repository in iPad Safari, choose `design/phase-2`, then **Code → Codespaces → Create codespace**.
3. In the browser terminal run `nvm install`, `nvm use`, `npm ci`, `npm run build`, then `npm run start`.
4. Open the **Ports** panel, forward port **3000**, verify its visibility is **Private**, then open its forwarded browser link while signed into the owning GitHub account. Do not choose Public or organization visibility.
5. Stop the codespace after review to stop compute use. Delete it when no longer needed; retained storage can still count while stopped.

GitHub hosts the source, development container, and authenticated preview traffic. Repository visibility is separate from forwarded-port privacy. Use fictional sample data; there is no production account/data isolation within the app.

GitHub's published pricing lists 2-core compute at **$0.18/hour** and storage at **$0.07/GB-month** after applicable included usage. Personal Free accounts list 120 included core-hours and 15 GB-month (about 60 running hours on two cores); Pro lists 180 core-hours and 20 GB-month. Remaining account allowance has not been inspected, and organization billing differs. Confirm the current account settings before creating anything.

Sources: [Codespaces pricing](https://docs.github.com/en/billing/concepts/product-billing/github-codespaces) and [port forwarding](https://docs.github.com/en/codespaces/developing-in-a-codespace/forwarding-ports-in-your-codespace).

## Honest remaining limits

The fixture week does not establish real capacity or conflicts. Timeline milestone targets are illustrative. A longer or denser real schedule may need more progressive disclosure; that should be assessed with real-device review and, later, functional beta workflows. The new lifestyle photo fits the atmosphere better than the retired mountain image but remains stock photography, not commissioned brand imagery. Sana's custom S signature should receive founder review for distinctiveness at small sizes.

Conversation onboarding, editing, persistence, intelligent suggestions, Momentum, reflections, circles, referrals, and launch infrastructure remain unimplemented. [Engagement foundations](engagement-foundation.md) remain documentation and data contracts only. Stop for explicit design approval before Phase 3.

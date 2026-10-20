# Phase 2 — Visual foundation

Branch: `design/phase-2`. No public deployment or main-branch merge.

## Design decisions

The interface uses warm ivory, blush, espresso, and small sage/taupe accents. Large editorial serif headings sit above quieter sans-serif controls. Planning lists use whitespace and fine rules rather than nested dashboard cards. The landscape photograph is bundled locally; public-launch image selection remains open.

Sana has a three-oval identity, a muted green note surface on Today, and a calm conversation page. Prompts and the composer explicitly preview an interface; they do not generate suggestions or send text to a model.

Landscape iPad layouts provide a sidebar and seven-column week. Portrait iPad layouts retain the sidebar but show a seven-day selector with a spacious selected-day agenda. Phone navigation is a focus-managed drawer, with Escape and focus restoration. Habits include weekday labels even when the table stacks.

Appearance follows the device on the first visit, then remembers an explicit light/dark selection. Both palettes are independently defined rather than filtered inversions.

## Screenshots

These are captures of the running application, not design mockups.

- [Today — landscape light](../artifacts/ipad-landscape-today-light.png)
- [Today — landscape dark](../artifacts/ipad-landscape-today-dark.png)
- [Today — portrait](../artifacts/ipad-portrait-today.png)
- [Week — landscape](../artifacts/ipad-landscape-week-light.png)
- [Week — portrait](../artifacts/ipad-portrait-week.png)
- [My Vision](../artifacts/ipad-landscape-my-vision-light.png)
- [Habits](../artifacts/ipad-landscape-habits-light.png)
- [Habits — phone](../artifacts/mobile-habits.png)
- [Sana — light](../artifacts/ipad-landscape-sana-light.png)
- [Sana — dark](../artifacts/ipad-landscape-sana-dark.png)

The test suite also captures all five screens in both landscape themes, plus light portrait and phone layouts. Captures use reduced motion for stable output. They are review artifacts, not approved visual-regression baselines.

## Validation

Run `npm run build`, `npm run typecheck`, and `npm test` after installation. The browser suite checks:

- All five views in light/dark at 1366 × 1024, including axe WCAG A/AA automated scans and horizontal overflow.
- All views at 834 × 1194 and 390 × 1194.
- Theme persistence, initial device dark preference, honest preview notices, and Sana's transparent preview response.
- Mobile navigation focus trapping, Escape dismissal, focus restoration, and the open drawer's automated accessibility scan.

Automated accessibility checks do not establish complete accessibility compliance. Real Safari, VoiceOver, and physical touch testing remain outstanding until interactive device review is available.

## Simplest interactive iPad review

Proposed next step: a Vercel preview deployment connected to this development branch. Next.js is supported directly, and the resulting HTTPS URL can be opened in iPad Safari. This would use only sample data.

Before proceeding, obtain founder approval for publishing the branch, connecting the GitHub account/repository, and creating the hosted preview. Confirm current plan pricing and usage eligibility; a free plan must not be assumed suitable for a commercial project. Set preview access controls as supported by the chosen plan. No paid upgrade or public deployment is authorized by this document.

No external account was connected and no preview was deployed during Phase 2. A cloud-local development address is not an iPad preview link.

## Review boundary

Working: navigation, light/dark preference, compact week day selection, keyboard drawer behavior, and an honest Sana conversation preview.

Visual only: task/commitment management, goal details, milestones, habit tracking, progress figures, and profile identity. Planning buttons display a clear notice and never mutate fixtures.

Await design approval before Phase 3. Do not add onboarding, live AI, authentication, production persistence, or deployment as part of this review.

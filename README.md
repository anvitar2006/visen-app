# Visen

**Become who you envision.**

Phase 2 visual foundation for an intentional planning application. Built with Next.js, React, TypeScript, Tailwind CSS, self-hosted DM Serif Display / DM Sans, and Lucide icons.

## Scope

Today, Week, My Vision, Habits, and Sana are responsive sample-data interfaces, not a functioning personal planning system. Navigation, weekday selection on compact layouts, theme switching, and the explicitly labeled conversation preview work. Planning controls explain the milestone boundary rather than pretending to save changes.

Only the appearance preference is persisted in browser local storage. Sana preview messages live in component memory and reset when leaving the Sana view or reloading. No AI calls, accounts, external database, analytics integration, or deployment are configured.

The sample day is October 20, 2026. Names, plans, progress, and suggestions are fictional.

## Development

Use Node 24 (tested with 24.19.0) and npm. Use this existing isolated checkout; a separate Git worktree is unnecessary.

```bash
cd /workspace/visen-app
npm ci --cache /tmp/visen-npm
npm run dev
```

Run the production workflow:

```bash
npm run build
npm run typecheck
npm test
```

Tests launch a production server automatically. They prefer an installed `/usr/bin/chromium` in the cloud machine; elsewhere, install Chromium with `npx playwright install chromium`. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to use another local Chromium executable.

The standard Playwright browser download is blocked by this environment's network policy, so tests use the preinstalled system Chromium. Browser viewport checks are not a substitute for real iPad Safari testing.

## Design review

See [the Phase 2 review guide](docs/phase-2-review.md) for screenshots, scope, and the iPad preview proposal. Test screenshots are stored in `artifacts/`.

A server running here is for internal validation. No externally accessible preview URL has been created. An iPad interactive preview requires a separately approved hosting or development service.

## Structure

- `src/app`: document, entry point, and shared theme/style tokens.
- `src/components`: navigation shell and shared Sana identity.
- `src/features`: separate Today, Week, Vision, Habits, and Sana views.
- `src/domain/planning.ts`: small storage-independent contracts for linked planning records and reversible completion history.
- `src/domain/sample-planning.ts`: fictional typed records and events, without collection or persistence.
- `src/domain/sample.ts`: read-only visual adapters and illustrative display metrics.
- `tests`: browser, accessibility, responsive, and interaction checks.

## Assets

Fonts are bundled locally through Fontsource and carry their included open font licenses. Icons use Lucide's ISC license. The locally bundled landscape photograph was obtained from the MIT-licensed Next.js example repository; see [asset provenance](docs/assets.md). There are no runtime requests to image or font providers.

Phase 3 requires the founder's design approval. It will add planning behavior, storage validation, and runtime validation of the planning contracts. Phase 4 will add guided onboarding and rule-based Sana suggestions. Genuine AI requires a separate approval milestone.

See [engagement foundations](docs/engagement-foundation.md) for how the current data contracts and shared components support future reflection, Momentum, private circles, referrals, and Sana intelligence. These future capabilities are not implemented or exposed in navigation.

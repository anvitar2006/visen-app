# Visen

**Become who you envision.**

Phase 3 local planning application, preserving the approved editorial design. Built with Next.js, React, TypeScript, Tailwind CSS, Zod, self-hosted DM Serif Display / DM Sans, and Lucide icons.

## Scope

Functional tasks, shared List/Calendar/Board/Timeline views, commitments and time blocks, goals/milestones, flexible habits, named categories, profile/preferences, and validated versioned local storage. Import/export/reset/recovery and session undo are available from Your space. New installations start empty; fictional examples can be loaded after confirmation.

Plans stay in this browser, without accounts or multi-device synchronization. Export regularly. Sana remains an explicitly labeled scripted preview; her notes are ephemeral and no live AI, onboarding, or personalized planning suggestions have been activated. No external database, analytics integration, or public deployment is configured.

See [the Phase 3 review guide](docs/phase-3-review.md) for implemented behavior, data semantics, limitations, founder review steps, and how to update your existing private iPad Codespace preview.

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

The approved [Phase 2 review](docs/phase-2-review.md) is retained as historical design context. Current functionality is documented in [Phase 3](docs/phase-3-review.md). Test screenshots are stored in `artifacts/`.

A server running here is for internal validation. No public deployment has been created. The founder can update the already approved private Codespace preview using the Phase 3 guide.

## Structure

- `src/app`: document, entry point, and shared theme/style tokens.
- `src/components`: navigation shell and shared Sana identity.
- `src/features`: separate Today, Week, Vision, Habits, and Sana views.
- `src/domain/planning.ts`: small storage-independent contracts for linked planning records and reversible completion history.
- `src/domain/sample-planning.ts`: fictional typed records and events, without collection or persistence.
- `src/domain/sample.ts`: fictional seed adapters, also used by the clearly labeled Sana preview.
- `src/domain/storage.ts`: runtime schema, versioned migration, and empty/example documents.
- `src/domain/dates.ts` / `actions.ts`: calendar/time-zone handling and relationship-safe domain operations.
- `src/features/planning`: shared provider, validated writes/undo/recovery, and focused editors.
- `tests`: browser, accessibility, responsive, and interaction checks.

## Assets

Fonts are bundled locally through Fontsource and carry their included open font licenses. Icons use Lucide's ISC license. The locally bundled lifestyle photograph is distributed by the MIT-licensed Start Bootstrap Clean Blog repository; see [asset provenance](docs/assets.md). There are no runtime requests to image or font providers.

Phase 3 was authorized after design approval. Stop for founder review before Phase 4 guided onboarding and rule-based Sana suggestions. Genuine AI requires a separate approval milestone.

See [engagement foundations](docs/engagement-foundation.md) for how the current data contracts and shared components support future reflection, Momentum, private circles, referrals, and Sana intelligence. These future capabilities are not implemented or exposed in navigation.

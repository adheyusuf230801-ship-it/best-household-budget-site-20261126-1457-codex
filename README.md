# Hearth — the Vellmere household

An original household budget site for fictional partners Mara and Ellis Vellmere. Warm paper colors, forest-green income bars, clay spending bars, and a compact household ledger make room for both the everyday and the next chapter.

## Run

Requires Node 22.18 or later. No install, dependencies, bundler, build step, account, or external resources.

```sh
node serve.ts
```

Open `http://127.0.0.1:8080/`. Use `--port 8081` to change the port. Hash links work on any static server with `app/` as its root. All scripts, styling, and data are local. The favicon is an original inlined PNG; there are no external fonts or images.

## Explore

- **Overview:** selected-month income, spending, surplus, savings rate, spending-plan health, cash-flow bars, category ring, goals, and upcoming bills.
- **Income:** salary and freelance totals, sortable income ledger, and an add-income form.
- **Expenses:** transaction search, category filter, four sortable columns, category-budget tab, and an add-transaction form.
- **Savings goals:** opening balances, monthly plans, target dates, progress meters, new-goal form, and extra contributions.
- **Bills & recurring:** recurring amounts and paid/upcoming filters. Bills are included in expenses, never counted twice.
- **Reports:** twelve-month income/spending bars, an available-savings line, category picker, month picker, spending ring, category budgets, and the underlying numerical table.
- **Our approach:** definitions, assumptions, fictional household story, and chart guidance. Available in the phone navigation, desktop sidebar, and footer.

All twelve months of 2026 originate in `app/data.js`. Page templates and charts calculate from the same in-memory ledger. December is explicitly a plan; the remaining months are illustrative full-month ledgers. Transaction dates are on or before day 26 of their month. The bill schedule retains original due dates: upcoming amounts are reserved in the ledger by day 26 and counted only once. Add-income and add-transaction handlers enforce the same day limit. Dollars are USD. Savings contributions allocate money and are not expenses. New goals begin in the selected month; extra contributions carry forward from their entry month. Reloading resets all edits.

## Source layout

- `app/index.html`: entry document and local resource references.
- `app/style.css`: responsive desktop and phone design.
- `app/data.js`: fictional ledger, budgets, bills, goals, and calculations.
- `app/charts.js`: accessible SVG bars, line, and donut; category-budget visualization.
- `app/views.js`: seven page templates.
- `app/main.js`: hash navigation, filters, sorting, dialogs, and in-memory updates.
- `serve.ts`: standard-library static server; `--root out/app` serves packaged output.
- `main.ts`: copies the app and screenshots and calls the unmodified kit dossier library.
- `shots.json`: four screenshot paths and exact viewport sizes.
- `capture.mjs`: Chromium capture helper for environments that permit browser startup and local serving.

## Screenshots and packaging

The harness produced four genuine headless-Chromium renders of the running Stage A site: three desktop captures at 1280 × 800 and one phone capture at 390 × 844. They are present in `screenshots/`.

| File | Hash path | Viewport |
| --- | --- | --- |
| `1-overview.png` | `#/overview` | 1280 × 800 |
| `2-expenses.png` | `#/expenses` | 1280 × 800 |
| `3-reports.png` | `#/reports` | 1280 × 800 |
| `4-phone.png` | `#/overview` | 390 × 844 |

These files document v1. The harness-provided `.png` filenames contain JPEG-encoded images; their original names and bytes are preserved. Stage B leaves them unchanged; the harness retakes them after this revision. This sandbox blocks localhost binding and browser startup, so no server or browser is launched in Stage B. Packaging can use the existing genuine renders to verify deterministic dossier generation.

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
cp out/dossier.json /tmp/hearth-dossier-first.json
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
cmp /tmp/hearth-dossier-first.json out/dossier.json
node --input-type=module -e "import { rmSync } from 'node:fs'; rmSync('out', { recursive: true, force: true })"
```

## Stage B revisions and verification

The phone navigation is a three-column grid. At 390px, the sidebar's two 18px insets leave 354px; two 5px gaps leave three 114.67px tracks. Six finance links occupy two rows and Our approach spans the third. Labels can wrap, tracks and links have zero minimum width, and decorative nav icons are hidden on phones. Every section is visible without sideways scrolling.

Desktop Overview spacing is tightened only from 801px through 1449px: smaller title gaps, metric and panel padding, chart spacing, and lower-row margin. At 1280px, the content area is 994px wide and the cash chart is about 186px tall. Adding conservative line-height allowances puts the bottom of both lower panel headings at about 748px in an 800px viewport. This is a CSS layout estimate, not a browser measurement; the harness supplies the fresh visual check after Stage B.

Twenty-four transaction dates were moved from day 28 or 29 to day 26 across the twelve months. All 264 transactions retain their IDs, names, types, categories, months, and amounts. Every monthly income, spending total, and category sum is unchanged and recomputed from the transaction ledger. Bill tiles still show their original due dates, with clearer text explaining that upcoming amounts are already reserved. The forms explain and enforce the same day-26 limit. Display years and the savings-rate reference now use the shared household data.

Completed without starting a server or browser:

- **3,241 checks passed:** the original 195 calculation, template, navigation, and control-handler checks; 2,825 added data, rendered-value, navigation, and source-of-truth checks; and 221 added transaction-date form and handler checks covering both income and expenses in all twelve months. Dynamic checks change dataset values and confirm that totals, charts, budgets, years, and the savings guide update from that source.
- **All eight JS/MJS/TS files passed Node syntax checks**, including the untouched vendor file. TypeScript was stripped with Node's native `stripTypeScriptTypes` before checking module syntax. The installed verification runtime is Node 24.22.1; `main.ts` and `serve.ts` remain unchanged and use only Node standard-library imports, with the original local vendor import in `main.ts`.
- **URL greps found no HTTP(S) or protocol-relative URLs in `app/`.** No dependencies or remote resources were added.
- **Both requested packaging runs succeeded**, using `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`. Their `dossier.json` files are byte-identical (SHA-256 `5a0347d13aed43bf7b3ac81edb4bd77c633d37f8e025617d87045e5462605aa6`). Packaged app files and screenshots match the sources byte for byte. Regenerable `out/` was removed afterward.
- **App limits passed:** six files, 66,714 bytes raw, or 21,359 bytes when the six first-load files are individually gzip-compressed at level 9. No added requests, fonts, or image assets.
- **Screenshot limits passed:** four existing captures at the documented dimensions, each below 256 KiB. Their initial SHA-256 hashes are unchanged. `vendor/makefun-frontend.ts` and `.makefun/owner.json` also retain their initial SHA-256 hashes.

These are source, calculation, markup, and handler checks, not a browser retest. The existing screenshots remain the harness's genuine Stage A browser evidence; new renders come from the harness after this revision. No commit, bundle, or submission was made.

MIT licensed; see `LICENSE`.

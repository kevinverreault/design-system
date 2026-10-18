# Design system

[![Showcase status](https://img.shields.io/website?url=https%3A%2F%2Fdesign-system-4rx.pages.dev%2F&label=showcase&up_message=online&down_message=offline&logo=cloudflare&logoColor=white)](https://design-system-4rx.pages.dev/)

The showcase page is live on Cloudflare Pages: **<https://design-system-4rx.pages.dev/>**

## Project Structure

```text
/
├── public/
├── src/
│   ├── components/
│   │   ├── feedback/
│   │   ├── form/
│   │   ├── layout/
│   │   ├── media/
│   │   ├── navigation/
│   │   └── ui/
│   ├── styles/
├── e2e/            Playwright browser tests against the showcase page
├── test/           Vitest helpers (Astro Container API)
```

## Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |
| `npm test`                | Runs the render tests (Vitest + Container API)   |
| `npm run test:watch`      | Runs the render tests in watch mode              |
| `npm run test:e2e`        | Runs the browser tests (Playwright) against the dev server |

## Layout

`Row` stacks its panes into one column when the Row itself is narrower than **40rem** (a container query on the Row, not a media query). Container query conditions can't read custom properties, so this value lives in `src/components/layout/Row.astro`.

## Feedback

`Toast` is placed once in `src/layouts/Layout.astro`. Queue a message from any script:

```ts
import { toast } from '../components/feedback/toast';

toast('Added to cart', { variant: 'success', duration: 5000 });
```

Info and success toasts are announced politely; warning and danger toasts interrupt, matching `Alert`'s `role="status"` / `role="alert"`.

## Testing

The browser tests run in Chromium, WebKit and Firefox. Before the first run, install Playwright's Chromium and WebKit with `npx playwright install chromium webkit`.

Firefox is the one installed on the machine, driven over WebDriver BiDi (Playwright's `moz-firefox` channel), as Playwright's own Firefox build does not run everywhere. Install a current Firefox; to run without it, pass `--project=chromium --project=webkit`.

## Using as a git submodule

The host Astro project imports components from source and compiles them, so their imports resolve from the host's `node_modules`. Install these in the host:

```bash
npm i cva@npm:class-variance-authority node-html-parser
```

- `cva` must be this alias: components import `'cva'` but use class-variance-authority's API. The npm package actually named `cva` has a different, incompatible API.
- `node-html-parser` is used by `Icon` at build time.
- `Icon` loads SVGs from the host's `src/svg/` (the glob is root-relative).

Working on the design system itself needs only `npm install`.
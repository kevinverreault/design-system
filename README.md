# Design system

## Project Structure

```text
/
├── public/
├── src/
│   ├── components/
│   │   ├── feedback/
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

Before the first browser test run, install the browsers with `npx playwright install chromium webkit`.

## Dependencies

```bash
npm i cva@npm:class-variance-authority
npm install --save-dev node-html-parser
```
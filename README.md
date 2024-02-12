# Design system

## Project Structure

```text
/
├── public/
├── src/
│   ├── components/
│   │   └── ui/
|   |   └── navigation/
│   ├── styles/
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

## Dependencies

```bash
npm i cva@npm:class-variance-authority
npm install --save-dev node-html-parser
```
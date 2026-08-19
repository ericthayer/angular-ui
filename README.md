# angular-ui

Angular 22 workspace configured as a Vite-powered Angular application (`ng serve`) with a `ui-components` library and a deployable reference site.

## Design tokens and theming

- W3C token source: `/home/runner/work/angular-ui/angular-ui/projects/ui-components/src/lib/styles/design-tokens.json`
- Generated CSS variables: `/home/runner/work/angular-ui/angular-ui/projects/ui-components/src/lib/styles/theme.css`
- The library component consumes theme variables with `var(--ui-...)`.

Generate CSS variables from tokens:

```bash
npm run tokens:generate
```

Sync tokens from a design tool REST API (Figma-compatible if endpoint returns token payload):

```bash
DESIGN_TOKEN_API_URL="<api-url>" \
DESIGN_TOKEN_API_TOKEN="<api-token>" \
npm run tokens:sync
```

## Build and test

```bash
npm run build:lib
npm test
```

## Reference site

The application is a live preview of the component library, including theme switching and component examples. Build it with `npm run build`; the output in `dist/angular-ui` can be deployed directly to Netlify. The `public/_redirects` file preserves Angular routes on refresh.

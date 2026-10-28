# Matthew Gaksch portfolio

A portfolio built with Next.js 16, React, TypeScript, Tailwind CSS v4, and shadcn/ui. The homepage contains Projects, About, Education, and Stack. The existing `/projects/`, `/about/`, `/education/`, and `/stack/` routes remain available as direct links. Next.js exports static pages; a small Cloudflare Worker serves public build metadata at `/api/version`. The local blog editor is separate and is never deployed.

## Local development

```sh
npm ci
npm run dev
```

Use Node 24.22.1 (pinned in `.node-version`) and run `npm run check` before publishing. The production files are written to `out/`.

## Write blog posts

Start the local editor in a second terminal:

```sh
npm run blog:editor
```

Open [http://127.0.0.1:5174/](http://127.0.0.1:5174/) on this computer. Create a post and use the formatting toolbar while writing. Switch between Write, Split, and Preview. Use **+ Image**, or paste/drop an image into the article editor; images are converted to WebP and limited to 1600 × 1600 pixels before being saved in `content/blog-images/`. Edit the generated image description inside `![description](image-url)` so it describes the picture. Press ⌘S or Ctrl+S to save. The editor warns before discarding unsaved changes.

Save as **Draft** to keep a post and its newly uploaded images off the public site. Change Visibility to **Published** and save when ready. Posts are saved as JSON files in `content/blog/` and should be committed with the site along with their source images. The build copies only images referenced by published posts into the public folder. The URL slug is fixed after the first save; create a new post if a different URL is needed.

To put a published post online, run `npm run build` and deploy the new `out/` directory. The editor is a separate local process bound to `127.0.0.1`; it is not included in `out/`. There is no online editing account or instant publishing. Markdown is rendered without raw HTML. Drafts never become article pages in the static export. Until a post is published, the public Blog page shows a simple empty state.

## Cloudflare Workers hosting

The public site is a Next.js static export served by Cloudflare Workers Static Assets. The local editor is never deployed. `wrangler.jsonc` configures the `out/` directory, trailing-slash routes, a 404 page, and the existing `matthewgaksch.com` custom domain. Wrangler runs `npm run build` before preview or deployment, so posts and images saved before the command are included.

```sh
npm run cloudflare:preview
```

`npm start` uses the same local Cloudflare preview; `next start` is not used for a static export.

When the Cloudflare account and domain are ready, run `npm run cloudflare:deploy`. This will publish the latest build and attach the custom domain configured in `wrangler.jsonc`. Run the same command after each content or code update to make it available to visitors. Cloudflare's default static-asset caching requires browser revalidation for HTML, while the generated Next.js bundles and uploaded UUID-named images use long-lived immutable caching.

## Edit the content

- `src/content/site.ts` — name, rotating introduction lines, about copy, and Gaksch details
- `src/content/projects.ts` — projects; only entries with `visible: true` appear
- `src/content/stack.ts` — technology list
- `src/content/education.ts` — education timeline
- `src/content/navigation.ts` — navigation labels and section order
- `src/content/links.ts` — optional contact and social links; the Elsewhere section appears only when this list has entries

Project visibility is controlled by `src/content/projects.ts`; social profile buttons use `src/content/links.ts`.

Project data supports optional image, status, and technologies fields. Place local project images in `public/images/projects/` and set `image` to a root-relative URL such as `/images/projects/example.webp`.

The site opens in dark mode (`#08080B`) unless the visitor has saved a light-mode choice. The header switch saves their choice locally. The palette uses black, white, and gray only.

Geist Sans, Geist Mono, and Geist Pixel font files are self-hosted in `public/fonts/`. Their license is included at `public/fonts/OFL.txt`. The homepage types the name with a blinking cursor and rotates short descriptions. Reduced-motion preferences show the full name without cycling the descriptions.

The shadcn/ui Button is used for the theme control. Its generated source is in `src/components/ui/button.tsx`; the rest of the portfolio layout and interactions are original site code.

## GitHub activity

The homepage shows `matthewgaksch`'s public GitHub contributions beneath Projects. Adapted from [Chánh Đại's GitHub Contributions component](https://chanhdai.com/components/github-contributions), with a neutral palette, month labels, hover/focus tooltips, keyboard navigation and a profile link. The calendar fills the available desktop width. On narrow screens it opens at the newest days and scrolls horizontally without widening the page; manual exploration of older dates is preserved across resizing. Counts come from the public GitHub Contributions API (`https://github-contributions-api.jogruber.de/v4/matthewgaksch?y=last`); no token or private repository access is used. Only contribution dates/counts/levels are retained, cached in the visitor's browser for one day. If storage is disabled, fetching still works; failed/invalid responses show a GitHub link rather than invented zero activity. There is no build-time network dependency. Run `npm run test:contributions` for data/calendar/cache regressions. Upstream licensing is retained in `THIRD_PARTY_NOTICES.md`.

## Security and release checks

`npm run check` runs lint, type checks (including generated Worker bindings), build metadata and contribution regressions, Markdown/input/header security tests, and the production static build. `npm run build` finishes by generating SHA-256 hashes of the actual exported inline scripts for Content Security Policy and checking that the policy matches the export. Unapproved inline scripts, inline event handlers and eval are denied; inline styles remain allowed for React/Base UI positioning. The only external API allowed by the connection policy is the public contribution data service. Fonts and scripts are self-hosted.

The release gate rejects source maps, local editor/source/credential artifacts, symlinks and missing or stale headers. Cloudflare limits each `_headers` line to 2,000 characters: if future content pushes script hashes beyond that budget, the build stops for policy review rather than silently weakening it. `/api/version` has independent security headers and no-store because static-asset header rules do not apply to Worker-generated responses. Review `npm audit` and the exact Worker dry run before release; deploy only the checked build.

The unneeded shadcn generator CLI was removed because its deepmerge dependency has an unpatched advisory (GHSA-gcqx-w48m-w2h4). Its unchanged MIT stylesheet is retained at `src/styles/shadcn.css`; existing generated components and design are preserved. Review a patched generator release before adding that CLI back. Licenses are in `THIRD_PARTY_NOTICES.md`.

The editor binds only to loopback, denies framing, applies a local-only script policy, and requires the exact Host, browser Origin and custom header for writes. It has no public production route. Public activity contains only dates and aggregate counts; no GitHub credential or private repository details are used. Environment files, generated metadata/types, output directories and internal review reports must remain outside commits.

# Matthew Gaksch portfolio

A portfolio built with Next.js 16, React, TypeScript, Tailwind CSS v4, and shadcn/ui. The homepage contains Projects, About, Education, and Stack. The existing `/projects/`, `/about/`, `/education/`, and `/stack/` routes remain available as direct links. Next.js exports static files, so the public site does not require a backend.

## Local development

```sh
npm install
npm run dev
```

Run `npm run lint`, `npm run typecheck`, and `npm run build` before publishing. The production files are written to `out/`.

## Write blog posts

Start the local editor in a second terminal:

```sh
npm run blog:editor
```

Open [http://127.0.0.1:5174/](http://127.0.0.1:5174/) on this computer. Create a post and use the formatting toolbar while writing. Switch between Write, Split, and Preview. Use **+ Image**, or paste/drop an image into the article editor; images are converted to WebP and limited to 1600 × 1600 pixels before being saved in `content/blog-images/`. Edit the generated image description inside `![description](image-url)` so it describes the picture. Press ⌘S or Ctrl+S to save. The editor warns before discarding unsaved changes.

Save as **Draft** to keep a post and its newly uploaded images off the public site. Change Visibility to **Published** and save when ready. Posts are saved as JSON files in `content/blog/` and should be committed with the site along with their source images. The build copies only images referenced by published posts into the public folder. The URL slug is fixed after the first save; create a new post if a different URL is needed.

To put a published post online, run `npm run build` and deploy the new `out/` directory. The editor is a separate local process bound to `127.0.0.1`; it is not included in `out/`. There is no online editing account or instant publishing. Markdown is rendered without raw HTML. Drafts never become article pages in the static export. Until a post is published, the public Blog page shows a simple empty state.

## Cloudflare Workers hosting

The public site is a Next.js static export served by Cloudflare Workers Static Assets. The local editor is never deployed. `wrangler.jsonc` configures the `out/` directory, trailing-slash routes, a 404 page, and the future `matthewgaksch.com` custom domain. Wrangler runs `npm run build` before preview or deployment, so posts and images saved before the command are included.

```sh
npm run cloudflare:preview
```

When the Cloudflare account and domain are ready, run `npm run cloudflare:deploy`. This will publish the latest build and attach the custom domain configured in `wrangler.jsonc`. Run the same command after each content or code update to make it available to visitors. Cloudflare's default static-asset caching requires browser revalidation for HTML, while the generated Next.js bundles and uploaded UUID-named images use long-lived immutable caching.

## Edit the content

- `src/content/site.ts` — name, rotating introduction lines, about copy, and Gaksch details
- `src/content/projects.ts` — projects; only entries with `visible: true` appear
- `src/content/stack.ts` — technology list
- `src/content/education.ts` — education timeline
- `src/content/navigation.ts` — navigation labels and section order
- `src/content/links.ts` — optional contact and social links; the Elsewhere section appears only when this list has entries

The site currently shows only Gaksch One and Orbit. Add a contact method to `src/content/links.ts` when you are ready to make one public.

Project data supports optional image, status, and technologies fields. Place local project images in `public/images/projects/` and set `image` to a root-relative URL such as `/images/projects/example.webp`.

The site opens in dark mode (`#08080B`) unless the visitor has saved a light-mode choice. The header switch saves their choice locally. The palette uses black, white, and gray only.

Geist Sans, Geist Mono, and Geist Pixel font files are self-hosted in `public/fonts/`. Their license is included at `public/fonts/OFL.txt`. The homepage types the name with a blinking cursor and rotates short descriptions. Reduced-motion preferences show the full name without cycling the descriptions.

The shadcn/ui Button is used for the theme control. Its generated source is in `src/components/ui/button.tsx`; the rest of the portfolio layout and interactions are original site code.

# Chandra Sekhar Reddy — The Neural Observatory

A continuous three-dimensional portfolio, populated from the supplied personal profile. Six physical destinations share one perspective camera: Origin, Work, Research, Expertise, Journey, and Connect. Navigation moves through the world; content is projected into the scene using CSS3DObjects rather than conventional scrolling sections.

## Explore

- Click a destination in the bottom dock, use the left/right arrow keys, press 1–6, or scroll over the environment to travel.
- Drag empty space to look around. Selecting a destination centers its camera.
- Select floating project artifacts, research crystal stages, and skill nodes to explore their corresponding content.
- Scroll inside a text surface to read long content. Research and project details have keyboard-operable tabs.
- Switch between night and dawn or open the accessible reading view. The unnecessary pause and reset-view controls have been removed.
- The pointer becomes a responsive orbital reticle on devices with a mouse. Text inputs retain a native text cursor; touch devices need no cursor.
- Download the included résumé. Contact details and project links use the supplied profile.

## Run locally

Requires Node.js 22.13 or newer and pnpm 11.25.0.

```sh
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install --frozen-lockfile
pnpm run dev:next
```

Use the local URL printed by Next.js. The included Sites runtime also supports `pnpm run dev`.

```sh
pnpm run typecheck
pnpm run lint -- --max-warnings=0
pnpm run build:next
pnpm exec next start
```

`typecheck` regenerates Next.js route types before validation so switching between the included Next.js and Vinext runtimes does not leave incompatible generated types. The hosted build uses `pnpm run build` with Vinext and Cloudflare Workers.

## Key files

| File | Purpose |
| --- | --- |
| `data/profile.ts` | Supplied biography, education, projects, research, skills, experience, and links. |
| `data/site.ts` | Résumé configuration and valid-link guard. |
| `components/spatial/universe.tsx` | React shell, navigation, theme, reading view, and world-space content portals. |
| `components/spatial/world-engine.ts` | Scene geometry, shared camera, travel, raycasting, layout, and resource lifecycle. |
| `components/spatial/project-scenes.ts` | Shared miniature project geometry and animated data paths in WebGL and CSS 3D. |
| `components/spatial/scene-effects.ts` | Navigation light paths, reactive particles, and successful-delivery portal pulses. |
| `components/spatial/object-labels.ts` | Shared CSS3D annotations with readable screen-sized text, six Origin controls, and responsive label layouts. |
| `components/spatial/css-exhibits.ts` | Spatial fallback geometry for browsers without WebGL. |
| `components/spatial/futuristic-cursor.tsx` | Pointer-driven orbital reticle with keyboard and touch fallbacks. |
| `vendor/stable-pmrem.js` | Three.js r186 PMREM with numerically stable normal-incidence GGX sampling; upstream MIT license included. |
| `components/spatial/exhibits.tsx` | Profile content, selectable details, tabs, and contact form. |
| `components/spatial/stations.ts` | Destination names, physical coordinates, accent colors, and controller contracts. |
| `app/globals.css` | Themes, responsive content surfaces, HUD, and CSS 3D materials. |
| `public/resume.pdf` | Two-page résumé generated from the supplied profile. |
| `app/layout.tsx` | Metadata and pre-paint theme preference. |

The original profile is the source of truth. Optional placeholder research URLs remain hidden. Fed-THOR is marked in progress; final experimental results are not invented. The reported recommender metrics come directly from the supplied profile. No fictional portrait or application screenshot is used.
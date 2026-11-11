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

The full WebGL scene uses reflective materials, a silver cube inside two metallic orbits and a neural network, a faceted research crystal with six connected stage nodes, a skill constellation, a timeline helix, orbital structures, metallic platforms, and a signal portal. If WebGL is unavailable, a CSS 3D renderer preserves the camera, depth, spatial exhibits, and navigation. If scene initialization fails altogether, all profile content remains available in reading view.

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


### Cinematic interactions

Navigation includes a brief portal with radial star trails (680 ms on stacked mobile layouts, 1050 ms on desktop). Arriving objects resolve from wireframe to solid with a bounded scan; scroll-card borders trace on arrival and glow briefly in the scroll direction. These one-shot effects use the existing scene clock or compositor animations, never block input, and respect reduced motion.

Research includes an illustrative 12-node simulation for each of the ten supplied pipeline stages, plus Replay stage and Explore structure controls. The exploded view separates the six selectable components within their existing object area. Clicking a component or choosing a stage updates its explanation and scrolls it into view. Simulations stop updating after their short sequence; reduced motion shows the final arrangement. Both WebGL and CSS3D renderers support the interactions, with theme-specific contrast.

After EmailJS accepts a message, the form button changes to Sent and a short light signal travels to the confirmation indicator inside the form. Failure never starts this effect and keeps the message intact. This confirms provider acceptance, not independently verified inbox delivery. Journey and Connect still have no exhibit above their scroll cards on stacked mobile layouts.

## Performance and accessibility

Each Work artifact now contains a distinct miniature system: recommendation routing, a hiring gateway, churn analytics bars, or an open-book structure. Selecting an artifact brings it forward and energizes its data paths. A light pulse travels from the selected dock control to the next exhibit during navigation. Pointer position shifts the metallic lighting and gently repels nearby particles. A three-ring transmission pulse launches through Connect only after EmailJS returns success. The Origin and Journey reference geometry is preserved. These effects reuse the existing animation loop, use at most 20 composited particles (12 on narrow screens), stop in background tabs, and respect reduced motion.

Three.js loads in a separate module. GPU pixel density starts at a maximum of 1.6 on desktop and 1.25 on mobile; rendering targets 45 and 30 fps respectively. Sustained expensive frames reduce pixel density and target 30 fps. Shader programs are precompiled before interaction. Inactive worlds are culled after camera travel, raycasting only considers the current exhibit, and stationary content avoids repeated CSS3D projection. Travel progress updates do not rerender the complete React content tree every frame. Rendering stops in background tabs and skips settled frames in reading view or with reduced motion. Geometry, materials, textures, listeners, observers, and renderers are cleaned up on unmount.

The local PMREM shader uses `1 - Xi.x` for the normal-incidence sample's radial remainder instead of subtracting squared trigonometric components. All call sites use this normal-incidence case; the expressions are algebraically equivalent. A check over all 256 Hammersley samples at five roughness values found a maximum normalized-component difference below 9e-15. This targets ANGLE/D3D X4122 constant-folding warnings without disabling shader diagnostics or changing materials. Driver-specific shader messages cannot be guaranteed absent on untested hardware.

The responsive scene places the object above the reading surface on narrow screens and reserves space for navigation. Origin is a free-standing introduction with no inner scroll box, including on compact phone and landscape layouts. The other content surfaces have one keyboard-, touch-, and mouse-wheel-scrollable region containing their heading, selectors, details, and links. A capture-phase wheel handler resolves the projected panel under the pointer to avoid Chromium routing scrolls to the canvas. Panel containers stay unclipped for reliable 3D hit testing; their inner overflow regions contain all content. The Connect form fits fully on standard laptop and desktop viewports, with scrolling retained for shorter screens. Journey tab labels stay on one line. Its two-strand helix and oval orbit occupy their own area beside a non-overlapping milestone column. Both renderers use the same silver cube and two metallic orbits for Origin, with all six numbered section controls. Exhibits fit their individual geometry bounds rather than sharing one small scale. Object annotations retain 13–14px type in compact layouts. In stacked mobile views, duplicate labels beneath the Work, Research, and Expertise objects are hidden; the same selectors remain inside the scroll surfaces. Work gains 94px of reading space and Research/Expertise gain 138px, while object sizing and desktop labels remain unchanged. Labels remain beside the objects in the wider landscape layout. In stacked mobile Journey and Connect views, the 3D exhibits and their annotations are hidden, their animations are skipped, and the scroll surface fills the available space between the header and navigation. Resizing back to desktop restores both exhibits and their labels in both renderers. Contact inputs use inset focus outlines and padded form edges so their borders stay inside the card. Visible navigation hints and the decorative footer slogans have been removed. The desktop cursor stays visible over form fields as a theme-aware illuminated I-beam, with native cursor behavior restored for keyboard navigation and touch. Night and dawn use separate accent colors and opaque label backplates; station text contrast against the panel base exceeds 5.9:1 in dawn and 9.8:1 at night. Controls have accessible labels and visible focus. Non-current content is hidden from assistive technology and inactive exhibits cannot receive focus. Reduced-motion preferences remove camera flight and ambient movement. The reading view provides a conventional text alternative with all substantive profile information.

Manrope is self-hosted. Geometry needs no external model or texture downloads. Only the theme preference is stored locally; no tracking is included.

## Contact behavior

The form sends directly from the browser through EmailJS, using its HTTPS REST API. It validates name, email, and message, prevents duplicate submissions while sending, clears fields only after a successful response, and preserves the message on failure. It never opens a mail draft on submit or automatically retries a possibly delivered message. The separate email link remains available for manual contact.

Configure `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, and `EMAILJS_PUBLIC_KEY` in Sites runtime settings (or `.env.local` for local development; `.env.example` lists the names). The original `NEXT_PUBLIC_EMAILJS_*` names are also accepted. `/api/contact/config` returns only those public browser identifiers at request time. Never add an EmailJS private key. With missing settings the Send button is disabled and the form reports that direct messaging is unavailable.

In the EmailJS template, keep **To Email** fixed to the portfolio owner's inbox. Use `{{name}}`, `{{email}}`, `{{message}}`, and optional `{{subject}}`; set **Reply-To** to `{{email}}` or `{{reply_to}}`. The aliases `from_name` and `from_email` are also supplied. Restrict allowed origins in the EmailJS dashboard to your deployed domain and approved development origin. A successful API response confirms EmailJS accepted the message; actual inbox receipt depends on the configured service/template and mailbox filtering.

The supplied EmailJS values are configured in the gitignored `.env.local` file and the matching Sites runtime settings. They are excluded from this source archive. No live test email was sent; recipient routing and actual inbox receipt must be confirmed with the configured EmailJS template.

## Deployment

Sites is configured in `.openai/hosting.json`. The existing site and its audience are preserved when this source is deployed.

For Vercel, import the source into your repository, select Next.js, use `pnpm install --frozen-lockfile` and `pnpm run build:next`, and keep the default output directory. Update `seo.siteUrl` in `data/profile.ts` when changing domains. Netlify can use its standard Next.js integration with the same build command.

The résumé can be replaced directly at `public/resume.pdf`. The optional generator is `scripts/generate-resume.py`; its Python/ReportLab and font paths are documented in the script.

## Validation boundaries

TypeScript, ESLint with zero warnings, and production builds are checked. Browser interaction and visual review use the internal preview. Responsive layouts were checked in actual iframe viewports at 320×568, 390×844, 844×390, 768×1024, 1280×720, and 1440×900, including both themes, full content scrolling, orbit navigation, selectors, tabs, contact fields, and reading view. The temporary responsive test page is not shipped. This validation browser lacks WebGL2, so it exercises the CSS 3D renderer; the GPU renderer is compile-checked but cannot be visually verified here. Viewport checks do not emulate physical touch hardware. No universal hardware, Lighthouse score, or zero-warning guarantee for every browser is implied.

## Browser deprecation notices

The portfolio does not call `StorageType.persistent`, `webkitPersistentStorage`, legacy quota APIs, or Protected Audience advertising APIs. Its only saved browser state is the optional theme preference in standard `localStorage`. Those two reported deprecations were not reproduced by the internal preview, and no matching calls were found in the client build. A warning originating in a hosting-injected script or browser extension must be corrected by that script’s owner; its exact source needs the affected-resource URL or stack from DevTools. The app does not hide console warnings, replace browser APIs, or disable hosting protections.

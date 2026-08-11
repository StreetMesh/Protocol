# StreetMesh logo package

The mark is a street map cropped to a circle. Blocks are territory, streets are the mesh, and the two white roundabout islands are nodes on a shared route.

## Palette

| Role | Hex | Notes |
|---|---|---|
| Ground | `#14181A` | Near-black. The mark supplies its own darkness. |
| Fabric (blocks) | `#00FF99` | Electric green |
| Nodes (islands) | `#FFFFFF` | Pure white, nothing else |

The palette only works over dark. `#00FF99` sits at about 74% luminance, so it cannot ink onto a light surface — roughly 1.15:1 against white. That isn't a preference, it's why every asset here carries its own ground.

## Files

### `svg/` — circular mark

| File | Use |
|---|---|
| `streetmesh-mark.svg` | Primary. Anything 48px and up. Self-contained; drop it on any background. |
| `streetmesh-mark-small.svg` | Wider junctions. 32–48px. |
| `streetmesh-mark-on-dark.svg` | No ground. **Only** on a surface at or below `#14181A` in lightness. |
| `streetmesh-mono-white.svg` | One-colour, light-on-dark: embroidery, engraving, single-colour print, partner docs. |
| `streetmesh-mono-black.svg` | One-colour, dark-on-light. The only asset here that works on white. |

SVG viewBoxes are cropped to the disc, so declared size equals visible size — a 96px mark measures 96px, with no hidden padding.

### `square/` — square-bound, for anything that crops

| File | Use |
|---|---|
| `streetmesh-avatar-1024.png` | **GitHub org and repo avatars.** Also Slack, Discord, Linear, npm, Docker Hub. |
| `streetmesh-appstore-1024.png` | iOS / Mac App Store. No transparency, no pre-rounded corners — the store applies its own. |
| `streetmesh-icon-square.svg` + `-256/512/1024.png` | General square icon. Mark at 76% of the width. |
| `streetmesh-icon-maskable.svg` + `-512.png` | Android adaptive and PWA `purpose: maskable`. Mark at 60%, inside the safe circle. |
| `streetmesh-icon-micro.svg` | 16–32px only. Oversized junctions so the islands survive. |

**Why 76%.** Square avatars get cropped differently everywhere — GitHub rounds the corners, Slack rounds them harder, some surfaces crop to a full circle. At 76% the circular mark clears every one of those crops, including the inscribed circle. Don't scale the mark up to fill the square; the corners are doing real work.

**Why a separate maskable.** Android can crop as aggressively as the inner 66% of the icon. The maskable file is drawn to survive that and will look small anywhere else — use it only where a maskable icon is asked for.

### `web/` — drop-in web set

`favicon.ico` (16/32/48), `favicon-16/32/48.png`, `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`, `og-image-1200x630.png`, `github-social-1280x640.png`.

```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:image" content="/og-image-1200x630.png">
```

```json
{ "icons": [
  { "src": "/icon-192.png",  "sizes": "192x192", "type": "image/png" },
  { "src": "/icon-512.png",  "sizes": "512x512", "type": "image/png" },
  { "src": "/streetmesh-icon-maskable-512.png", "sizes": "512x512",
    "type": "image/png", "purpose": "maskable" }
] }
```

### `dark/` — for dark surfaces

The default mark carries a near-black ground, which is correct on light pages and disappears into dark ones. These are the versions for dark UI. Two strategies, and the choice depends on whether the mark should sit *in* the surface or *on* it.

**No ground** (`streetmesh-mark-dark.svg`, `streetmesh-icon-square-dark.svg`, `streetmesh-avatar-dark-1024.png`, `icon-192/512-dark.png`). Streets are transparent, so the host surface shows through them. The mark reads as part of the page. Use this by default on dark, including GitHub READMEs. Requires a surface no lighter than about `#2A2A2A` — above that the white islands start to fail.

**Lifted ground** (`streetmesh-mark-lifted.svg`, `streetmesh-icon-square-lifted.svg`, `apple-touch-icon-dark.png`, `streetmesh-icon-maskable-lifted.svg`). Ground is `#2C343A`, a step above typical dark chrome, so the disc stays a distinct object. Use where the mark must read as its own tile — app icons, anything that forbids transparency, or surfaces whose darkness you don't control.

`dark/web/` also has `favicon-dark.ico` and `favicon-dark-16/32.png`, built on the micro geometry so the islands survive.

```html
<link rel="icon" href="/favicon-32.png" media="(prefers-color-scheme: light)">
<link rel="icon" href="/favicon-dark-32.png" media="(prefers-color-scheme: dark)">
```

```html
<picture>
  <source media="(prefers-color-scheme: dark)"  srcset="streetmesh-mark-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="streetmesh-mark.svg">
  <img alt="StreetMesh" src="streetmesh-mark.svg" width="96">
</picture>
```

## Rules

**Clear space.** 25% of the mark's diameter on all sides, kept clear of type, rules, and other logos. In the square icons this is already built in.

**Minimum sizes.** Primary above 48px. Small variant 32–48px. Micro or mono below 32px.

**Which variant.** Size decides, not taste. The variants are one map at different zoom levels and should never appear together in a single layout.

## Don't

- Don't put the green on a light background. It has roughly 1.15:1 contrast against white and will disappear.
- Don't recolour the islands. White is the only thing brighter than `#00FF99`; any hue you substitute will be dimmer than the fabric and the nodes will stop reading as nodes.
- Don't rotate. The grid is already on a 22° tilt and the circular silhouette conceals it; rotating the file exposes the tilt.
- Don't add effects, strokes, or shadows.
- Don't scale the mark to fill a square icon — the margin is crop protection.
- Don't stretch. Proportional scaling only.
- Don't redraw the geometry by eye. It follows rules: one street width throughout, streets kept clear of the rim, junctions only where four ways actually meet, ring roads matched to street width.

## Known limits

**16px is the floor.** At that size each island is about two pixels. They're present but barely, and any further reduction loses them. If a context demands smaller, use `streetmesh-mono-black.svg` or `-white.svg` and let the roundabouts read as plain openings.

**Mid-tone surfaces.** Neither set covers backgrounds between roughly `#2A2A2A` and `#C8C8C8`. The default mark's ground is too close to them to separate, and the dark set's white islands go soft against them. On a mid-grey or a photograph, use a mono variant or place the mark on a panel of a known colour.

**Simultaneous contrast.** White against this much green picks up a faint warm cast. It's expected and it's why the islands are pure `#FFFFFF` rather than an off-white, which would go visibly pink.

## Not included

**The wordmark.** No typeface has been chosen. When one is, prefer an open-licensed family — other implementers will set the StreetMesh name in their own docs, and a face they can install gets reproduced correctly far more often than a licensed one.

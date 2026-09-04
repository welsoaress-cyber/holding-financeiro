# ServNet Design System

Whenever you build or edit any ServNet page (servnet-site/ or anything at servnet.net.br), follow every rule in this file without exception. These rules are adapted from the Dala design system and tuned to ServNet's brand identity.

---

## Brand Concept

ServNet's visual identity is built on **distributed intelligence** — a robot/AI silhouette formed by countless cyan particles, echoing how fiber optic data pulses through a network. The brand communicates technology that is alive, local, and trustworthy.

The visual centerpiece is a **robot/AI particle constellation**: hundreds of tiny triangular or dot particles clustered into a robot head silhouette, connecting with hair-thin lines, all in ServNet Cyan. This replaces any generic orb, circuit board, or generic tech imagery.

---

## Color Tokens

| Name | Hex | Token | Role |
|------|-----|-------|------|
| Deep Navy | `#030F18` | `--bg` | Page canvas — the dominant dark surface, not pure black |
| Surface | `#061520` | `--surface` | Section alternates, slightly lighter than bg |
| Card | `#091C2A` | `--card` | Card backgrounds |
| Pool (Primary) | `#00C4D8` | `--pool` | Brand accent — ALL interactive elements, logo, active states |
| Pool Hi | `#2DDAE8` | `--pool-hi` | Hover states, highlights, glow edges |
| Pool Dim | `rgba(0,196,216,0.1)` | `--pool-dim` | Subtle fills, hover backgrounds |
| Bone White | `#CDEAF2` | `--text` | Headlines, body text — cyan-tinted white, not pure white |
| Ash Cyan | `#4A8898` | `--text-2` | Secondary labels, muted text |
| Border | `rgba(0,196,216,0.13)` | `--border` | Hairline borders only |

**Rules:**
- `--pool` (`#00C4D8`) is the ONLY saturated chromatic color. Never introduce a second accent hue (no purple, no orange, no green) unless it carries semantic meaning (e.g. `#34D399` for success states only).
- Backgrounds must be explicitly set — never transparent bodies that borrow the host ground.
- Pure white (`#ffffff`) is forbidden as a background; use `--bg` or `--surface`.
- Pure black (`#000000`) is not used — `#030F18` is ServNet's void.

---

## Typography

**Single face:** `system-ui, -apple-system, 'Segoe UI', Arial, sans-serif`  
ServNet does not license PPNeueMontreal. Use the system stack everywhere. Hierarchy comes from scale and weight, not decorative faces.

**Rules (same philosophy as Dala):**
- Trust scale, not weight, for hierarchy. A 72px heading at weight 900 dominates even next to a 400-weight body.
- Headlines: `font-weight: 900`, `letter-spacing: -0.04em`, `line-height: 1.04`, `text-wrap: balance`
- Body: `font-size: 1.05–1.1rem`, `line-height: 1.7–1.8`, `color: var(--text-2)`, `font-weight: 400`
- Eyebrows / labels: `font-size: 0.78rem`, `font-weight: 700`, `letter-spacing: 0.2em`, `text-transform: uppercase`, `color: var(--pool-hi)`
- Never center-align body text blocks. Headlines can center in `section-head` contexts.
- Monospace (`'Courier New', monospace`) is reserved for data values, speed numbers, ping stats — technical readouts only.

**Type Scale:**

| Role | Size | Weight | Tracking | Line-height |
|------|------|--------|----------|-------------|
| display | clamp(3rem, 7vw, 5rem) | 900 | -0.04em | 1.04 |
| heading | clamp(2rem, 5vw, 3.5rem) | 900 | -0.03em | 1.1 |
| subheading | 1.5–1.8rem | 700 | -0.02em | 1.2 |
| body | 1.05–1.1rem | 400 | normal | 1.7 |
| label/eyebrow | 0.78rem | 700 | 0.2em | 1.2 |
| caption | 0.8–0.85rem | 400 | normal | 1.6 |
| data/mono | inherit | 700 | 0.05em | 1.2 |

---

## The Robot/AI Particle Constellation

This is ServNet's signature visual element — the hero right-side visual. It MUST appear on every hero section.

**What it is:** A canvas-drawn particle constellation forming a robot head silhouette. Hundreds of tiny dots/triangles in varying cyan opacities cluster into the robot shape, connected by hair-thin lines. Eyes glow brighter. The shape breathes slowly.

**Implementation rules:**
1. Use a `<canvas>` element — never SVG for this effect (too verbose, no particle animation).
2. ~250–320 particles total. Each particle is either a tiny triangle (2–4px) or a circle (1–2.5px r).
3. Colors sampled from: `rgba(0,196,216, 0.3–0.85)`, `rgba(45,218,232, 0.4–0.9)`, `rgba(0,196,216,0.2)`.
4. Particles near eye regions are brighter and slightly larger.
5. Connect any two particles closer than ~35px with a line at `rgba(0,196,216, 0.06–0.15)`.
6. Each particle drifts with tiny velocity (±0.15–0.3 px/frame) and is attracted back toward its origin point (spring constant ~0.004).
7. Respect `prefers-reduced-motion` — freeze drift if matched.
8. The silhouette defines these regions (in a 600×500 coordinate space):
   - Head rect: `roundRect(140, 100, 320, 280, 18)` 
   - Left eye: circle at `(215, 195)` r=32 — high particle density, cyan glow
   - Right eye: circle at `(385, 195)` r=32 — high particle density, cyan glow
   - Mouth bar: `roundRect(185, 295, 230, 22, 4)`
   - Antenna stem: `rect(288, 35, 24, 70)`
   - Antenna top: circle at `(300, 28)` r=20
   - Left ear plate: `roundRect(82, 168, 58, 110, 6)`
   - Right ear plate: `roundRect(460, 168, 58, 110, 6)`

**Color variation within the constellation:**
- 60% of particles: `rgba(0,196,216, random(0.25, 0.70))`
- 25% of particles: `rgba(45,218,232, random(0.40, 0.85))` — brighter variant
- 15% of particles: `rgba(0,196,216, random(0.12, 0.25))` — near-invisible, structural

---

## Layout

- Page max-width: 1280px, centered with `margin: 0 auto`
- Section padding: `5rem max(5vw, 1.5rem)` (desktop), `3rem 1.25rem` (mobile)
- Hero: dark always (`#030F18`), two-column grid (text left, constellation right)
- Section rhythm: alternate between `--bg` and `--surface` backgrounds
- Cards: `border: 1px solid var(--border)`, `border-radius: 10px`, `background: var(--card)` — use sparingly
- **No decorative borders, gradients-as-decoration, or shadow stacks.** The background void does the work.
- Flex/grid with `gap` for spacing — no per-element margins between siblings.
- Wide content (tables, code, price grids): `overflow-x: auto` on the container.

---

## Components

### Primary Button (`.btn-fill`)
```css
background: var(--pool);
color: #fff;
border-radius: 5px;
padding: 0.82rem 2rem;
font-weight: 700;
font-size: 0.9rem;
transition: opacity 0.15s, transform 0.15s;
```
Hover: `opacity: 0.84`. Never pill shape (that's Dala's aesthetic, not ServNet's).

### Ghost Button (`.btn-line`)
```css
border: 1.5px solid rgba(0,196,216,0.45);
color: var(--pool);
background: transparent;
border-radius: 5px;
```
Hover: `background: rgba(0,196,216,0.08)`.

### Eyebrow / Section Label
```css
font-size: 0.78rem;
font-weight: 700;
letter-spacing: 0.2em;
text-transform: uppercase;
color: var(--pool-hi);
```
Optionally wrapped in a pill badge: `border: 1px solid rgba(0,196,216,0.32); border-radius: 100px; padding: 0.28rem 0.88rem;`

### Plan Cards
Standard card style + a `hot` variant (highlighted):
- Default: `border: 1.5px solid var(--border)`
- Hot/featured: `border-color: rgba(0,196,216,0.45)`, subtle `box-shadow: 0 0 40px rgba(0,196,216,0.07)`

### Nav
- Sticky, `backdrop-filter: blur(20px)`, `background: rgba(3,15,24,0.92)`
- Logo: `color: var(--pool)`, weight 900, letter-spacing 0.09em
- Links: `color: var(--text-2)`, hover → `var(--pool)`

---

## Animation Rules

- All entrance animations: `opacity 0→1`, `translateY 16px→0`, duration 0.4–0.6s, ease-out
- Hover transitions: max 0.15–0.2s
- The robot constellation is the ONLY continuous animation in the hero (plus the blinking tag dot)
- No scroll-triggered parallax, no infinite floating elements outside the constellation
- Respect `@media (prefers-reduced-motion: reduce)` — freeze all animations

---

## What NOT to Do

- ❌ Pure white backgrounds
- ❌ Generic stock illustrations or icon packs
- ❌ Purple, orange, or red as accent colors (only `--pool` cyan is the accent)
- ❌ Multiple competing gradients in the same section
- ❌ CSS `box-shadow` stacks for depth (use border + background tint instead)
- ❌ Hand-authoring long SVG path data for the hero visualization (use canvas)
- ❌ Center-aligning body copy blocks
- ❌ A generic orbital/radar SVG for the hero (use the robot particle constellation)
- ❌ Emoji as section decorators
- ❌ Rounded-everything pill shapes on buttons (5px radius is ServNet's shape)

---

## Theme Support

ServNet pages support light + dark mode.

Light tokens: `--bg: #F1FAFB`, `--surface: #FFFFFF`, `--card: #E8F7FA`, `--text: #071A1F`, `--text-2: #3D7585`, `--border: rgba(0,196,216,0.2)`

Dark tokens (default for hero, triggered by `@media (prefers-color-scheme: dark)` and `[data-theme="dark"]`): as listed in Color Tokens above.

The hero section is ALWAYS dark regardless of theme — it is the brand's signature dark stage.

Follow the three-state pattern:
1. `:root` → complete light palette
2. `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }` → dark tokens
3. `:root[data-theme="dark"]` → dark tokens again (explicit toggle wins)

Body always has `background: var(--bg)` set explicitly.

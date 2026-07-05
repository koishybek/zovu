# Polaris Design System

A faithful, self-contained recreation of **Shopify Polaris** — the open-source design system behind the Shopify admin — packaged for building well-branded interfaces, prototypes, and mocks. It ships the full token foundation, reusable React UI primitives, foundation specimen cards, and an interactive Shopify Admin UI kit.

> **What this is.** A design system for making admin-style, commerce, and dashboard interfaces in the Polaris visual language: a calm, neutral, content-first aesthetic with a signature tactile button, soft 12px cards, and a near-black "brand" color rather than a loud hue.

## Sources

Everything here was reverse-engineered from the official Polaris monorepo. Explore these to go deeper or pull more assets:

- **Repository:** https://github.com/Shopify/polaris
  - `polaris-tokens/` — design tokens (colors, type, space, shadow, border, motion). All token values in `tokens/` come from here.
  - `polaris-react/` — the React component library. Button and Badge treatments were lifted from their `*.module.css`.
  - `polaris-icons/` — 1,000+ icons. A curated 49 live in `assets/icons/`; grab more from the repo as needed.
  - `polaris.shopify.com/` — the documentation site (content & usage guidance).
- **Live docs:** https://polaris.shopify.com — the canonical guidance for voice, components, and patterns.

> Note: Polaris React is officially deprecated in favor of Polaris Web Components, but it remains the most complete public reference for the visual system and is the basis for this kit.

---

## Content fundamentals

Polaris copy is **plain, calm, and helpful** — it sounds like a knowledgeable colleague, never a marketer. When writing UI text:

- **Sentence case everywhere.** Buttons, headings, menu items, labels — all sentence case. Write `Add product`, `Save and continue`, `Payment details` — never `Add Product` or `Save And Continue`. (Capitalize only the first word and proper nouns.)
- **Address the merchant as "you."** Avoid "I"/"we." Say `Your order is on its way`, not `We've shipped your order`. Use "we" only when Shopify itself is acting, and sparingly.
- **Verbs for actions.** Buttons start with a verb that names the outcome: `Save`, `Buy shipping label`, `Fulfill items`, `Create order`. Avoid vague `OK` / `Submit`.
- **Be concise, then specific.** Lead with the most important info. Cut filler. `Showing 24 of 248 orders` beats `There are a total of 248 orders and we are currently showing 24`.
- **Active voice, present tense.** `Shopify sent a confirmation email`, not `A confirmation email was sent by Shopify`.
- **Numerals for numbers.** `3 products`, `$148.00`, `8.875% tax`. Use real currency formatting with tabular figures in tables.
- **Capitalize product & feature names.** `Shopify Payments`, `Online Store`, `Shopify Magic`. Lowercase generic nouns (`orders`, `products`, `customers`).
- **Error messages explain + guide, never blame.** State what happened and how to fix it: `Enter a valid email address` — not `Invalid input` or `You entered the email wrong`.
- **No exclamation points** in product UI (a rare, genuine celebration aside). **No emoji.** No ALL-CAPS for emphasis.
- **Empty states are encouraging and actionable** — one sentence of what the thing is, plus a primary action.

Examples that match the voice:
- Heading: `Good afternoon, Mae` · subtitle `Here's what's happening with your store today.`
- Banner (success): title `Order fulfilled` · body `A confirmation email was sent to the customer.`
- Banner (critical): title `Payment failed` · body `The card was declined. Ask the customer for another payment method.` · action `Retry charge`
- Empty state: `You have no orders yet` · `Orders will appear here once customers start buying.` · `Create order`

---

## Visual foundations

### Color
- **Neutral-forward.** The interface is built from a 16-step **gray** ramp. The "brand"/primary color is **near-black** (`gray-15`, `rgb(48,48,48)`) — not a saturated hue. This is the single most distinctive thing about the palette.
- **Surfaces vs fills.** `bg-surface` (white) is for large areas like cards; `bg-fill` is for small contained elements like buttons. The app background (`bg`) is `gray-6` (`#f1f1f1`) — cards float on it in white.
- **Status is paired.** Each status (success, critical, warning, caution, info) has a soft *surface* tint (for banners) and a strong *fill* (for badges/icons/buttons). Green = success, red = critical, orange = warning, yellow = caution, azure/blue = info & emphasis.
- **Magic = purple, reserved.** Purple (`magic`) is used **only** for AI-suggested actions. Don't use it decoratively.
- **Links** are `blue-13`. Focus rings are `blue-13` too.
- See the **Colors** cards in the Design System tab for the surfaces, brand, status, magic, the gray ramp, and the full 12-hue spectrum.

### Typography
- **Inter**, with a system fallback stack. Loaded as a variable font because Polaris uses **non-standard weights**: regular **450**, medium **550**, semibold **650**, bold **700**.
- Type scale runs `heading-3xl` (36px) → `body-xs` (11px). **`body-md` (13px)** is the admin's default reading size.
- **Letter-spacing tightens as type scales up** (densest −0.54px on 3xl). Headings are bold/semibold; body is regular.
- Use **tabular figures** (mono/numeric) for money and metrics so columns align.
- See the **Type** cards: Headings, Body, Weights, Numeric & mono.

### Space, shape & layout
- **4px base unit.** The space ramp is named value × 25 (`space-400` = 16px). Card padding is `400` (16px); the standard stack gap is `300`–`400`.
- **Radii:** controls/buttons/badges = `200` (8px); cards = `300` (12px); avatars/pills = `full`. Nothing is sharp-cornered, nothing is very round.
- **Layout** is centered and contained — admin pages cap around ~1000px and sit on the gray app background. Two-column detail views pair a flexible main column with a ~320px sidebar.

### Elevation & the signature button
- **Soft, cool-gray drop shadows** (`shadow-100`→`600`) for raised surfaces. At rest, cards use the barely-there `shadow-100`.
- The **button bevel system** is the signature texture: a secondary (white) button has an inner top highlight and a darker bottom edge; the primary (dark) button adds a subtle top gradient sheen. **On press, the shadow inverts to an inset and the label nudges down 1px** — a tactile, physical feel. See the **Elevation** cards.

### Borders
- **1px hairlines.** Default border is `gray-8`; dividers use `border-secondary` (`gray-7`); inputs use a darker `gray-12`. Borders are frequently rendered as inset box-shadows so they don't affect layout size.

### Motion
- **Quick and controlled.** Most transitions are 100–200ms on `motion-ease` (`cubic-bezier(0.25, 0.1, 0.25, 1)`). Content appears with a short fade + small translate (`appear-above`/`appear-below`). Spinners use `linear`. Avoid long or bouncy animation. **`prefers-reduced-motion` is respected** in the base layer.

### Hover & press states
- **Hover:** surfaces step one shade darker (`bg-surface` → `bg-surface-hover` = `gray-4`); fills darken; transparent/tertiary elements pick up a faint black tint (`bg-fill-transparent-hover`).
- **Press:** buttons invert to an inset shadow and translate down 1px; fills go one step darker again.
- **Focus:** a 2px `blue-13` outline with a small offset on any interactive element.

### Imagery
- The admin is **flat and chrome-light** — **no gradient backgrounds, no textures, no full-bleed hero imagery, no purple-blue AI gradients.** Product/merchant imagery appears inside cards and list rows (square thumbnails, `radius-150`). Avatars derive a background color from initials across 7 fixed color pairs. Keep imagery neutral and functional.

---

## Iconography

- **Polaris Icons** — a single, cohesive set of **1,000+** glyphs. A curated **49** are bundled in `assets/icons/` (navigation, actions, status, commerce); pull more from `polaris-icons/icons/` in the repo by name (`<Name>Icon.svg`).
- **20×20 viewBox, monochrome, single-path, filled.** They carry no `fill` attribute so they inherit `currentColor` — color them with the `icon-*` tokens via the `<Icon>` component's `tone`/`color`.
- Geometric, rounded, friendly-but-precise. Consistent optical weight across the set.
- **No emoji, no Unicode glyphs as icons, no PNG icons.** Always use the SVG set. Don't hand-draw replacements — if you need an icon that isn't bundled, import it from the repo.
- Usage: `<Icon source="OrderIcon" tone="subdued" />`. See the **Brand → Iconography** card for the full bundled grid.

---

## Index / manifest

**Root**
- `styles.css` — the single entry point consumers link. Import manifest only.
- `README.md` — this guide.
- `SKILL.md` — Agent-Skill manifest for using this system in Claude Code.

**`tokens/`** — all CSS custom properties (`--p-*`), reachable from `styles.css`
- `fonts.css` (Inter `@font-face`), `palette.css` (raw ramps), `color.css` (224 semantic aliases), `typography.css`, `spacing.css`, `shape.css`, `shadows.css`, `motion.css`, `base.css` (reset).

**`components/`** — reusable React primitives (bundled to `window.PolarisDesignSystem_1106df`)
- `actions/` — **Button**, **ButtonGroup**
- `forms/` — **TextField**, **Select**, **Checkbox**, **RadioButton**
- `feedback/` — **Badge**, **Banner**, **Spinner**
- `structure/` — **Card**, **BlockStack**, **InlineStack**, **Divider**
- `display/` — **Text**, **Icon**, **Avatar**, **Tag**

Each component directory has `<Name>.jsx` + `<Name>.d.ts` + `<Name>.prompt.md` and one `*.card.html` specimen.

**`guidelines/`** — foundation specimen cards (Colors, Type, Spacing, Shape, Elevation, Brand).

**`ui_kits/admin/`** — the interactive **Shopify Admin** recreation (Home, Orders, Order detail, Products). See its own `README.md`.

**`assets/`** — `icons/` (49 Polaris icons), `brand/` (Shopify bag, Polaris star mark, favicon).

### Using it
Link the stylesheet, load the bundle, read components off the namespace:
```html
<link rel="stylesheet" href="styles.css" />
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" ...></script>
<script src="_ds_bundle.js"></script>
<script type="text/babel">
  const { Button, Card, Badge, Text, Icon } = window.PolarisDesignSystem_1106df;
</script>
```
Style anything custom with the `--p-*` tokens so it stays on-system.

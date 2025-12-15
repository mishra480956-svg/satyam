# SATYNX Design System

SATYNX uses a **black-first**, high-contrast aesthetic with subtle glass surfaces and neon accents. The design system is intended to be extended incrementally—tokens are centralized and components are kept small and composable.

## Where things live

- **Design tokens**: `app/globals.css`
  - CSS custom properties for color, elevation, spacing, and motion.
  - Tokens are exposed to Tailwind via `@theme inline` so you can use utilities like `bg-background`, `text-foreground`, `border-border`, etc.
- **UI components**: `components/ui/*`
  - Reusable primitives (Button, Input, Card, Panel, Sidebar, Dialog, Toggle, Skeleton, ScrollArea).
- **Examples**:
  - `/design-system` page
  - `/chat` page (consumes the same primitives)

## Tokens

### Color (dark default)

Defined on `:root` (dark) and `:root[data-theme="light"]` (light).

Core tokens:

- `--background`, `--foreground`
- `--muted`, `--muted-foreground`
- `--border`
- `--card`, `--surface`
- `--accent-cyan`, `--accent-magenta`, `--gradient-accent`

Tailwind mappings (via `@theme inline`):

- `bg-background`, `text-foreground`
- `bg-card`, `text-card-foreground`
- `bg-surface`, `border-border`
- `ring-ring`

### Elevation

- `--shadow-elev-1`, `--shadow-elev-2`, `--shadow-elev-3`

Used by components like `Card` and `Panel` to maintain consistent depth.

### Motion

Motion respects `prefers-reduced-motion`:

- `--motion-fast`, `--motion-normal`, `--motion-slow`
- `--ease-out`

Framer Motion is configured globally in `components/providers/app-providers.tsx` with:

- `MotionConfig reducedMotion="user"`

### Spacing

- `--app-gutter`: responsive horizontal padding for page layouts
- `--app-max-width`: the maximum content width

## Components

All components are under `components/ui` and should be used instead of ad-hoc styling for shared UI.

### Button

```tsx
import { Button } from "@/components/ui";

<Button>Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
```

### Input / TextArea

```tsx
import { Input, TextArea } from "@/components/ui";

<Input placeholder="Type…" />
<TextArea placeholder="Multiline…" />
```

### Card / Panel

Use `Card` for content blocks and `Panel` for higher-elevation layout surfaces (sidebars, shells).

```tsx
import { Card, Panel } from "@/components/ui";

<Card className="p-6">…</Card>
<Panel className="p-6" inset>…</Panel>
```

### Dialog

`Dialog` supports both modal and drawer variants.

```tsx
import { Dialog, Button } from "@/components/ui";

<Dialog
  open={open}
  onOpenChange={setOpen}
  title="Settings"
  variant="drawer"
>
  …
</Dialog>
```

### Sidebar

`Sidebar` can render as:

- **Static** (no `open` prop) for desktop layouts
- **Overlay** (`open` + `onOpenChange`) for mobile slide-in behavior

### Toggle

```tsx
import { Toggle } from "@/components/ui";

<Toggle checked={enabled} onCheckedChange={setEnabled} />
```

### Skeleton

Use for loading placeholders or to maintain layout while streaming responses.

### ScrollArea

Adds consistent scrollbars using the `.satynx-scroll` utility class.

## Extending the system

1. Add/adjust tokens in `app/globals.css` (prefer CSS variables).
2. Map new tokens in `@theme inline` if you want Tailwind utilities.
3. Create primitives in `components/ui` (keep them composable and accessible).
4. Add a usage example to `/design-system`.

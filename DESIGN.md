---
name: UniKit
description: A comprehensive, distraction-free campus productivity platform
colors:
  primary: "hsl(280 77% 23%)"
  neutral-bg: "hsl(30 6% 96%)"
  neutral-fg: "hsl(30 5% 19%)"
  border: "hsl(0 0% 90%)"
  card-bg: "hsl(0 0% 100%)"
typography:
  body:
    fontFamily: "Inter, sans-serif"
rounded:
  md: "calc(0.75rem - 2px)"
  lg: "0.75rem"
  xl: "1rem"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "hsl(0 0% 100%)"
    rounded: "{rounded.lg}"
---

# Design System: UniKit

## Overview

**Creative North Star: "The Focused Academic"**

UniKit is designed to minimize cognitive load while keeping students highly organized. The interface is exceptionally clean, utilizing generous negative space, warm off-white backgrounds, and a singular, strong "Deep Amethyst" accent color to draw attention strictly to what matters.

**Key Characteristics:**
- High-contrast, singular accent color (Deep Amethyst).
- Warm, off-white campus aesthetic to reduce eye strain.
- Heavy use of blurred overlays (`backdrop-blur`) and deep shadows for z-index layering.

## Colors

A highly restrained palette designed for long study sessions.

### Primary
- **Deep Amethyst** (hsl(280, 77%, 23%)): Used exclusively for primary actions, active navigation states, and key data visualization.

### Neutral
- **Off-White Canvas** (hsl(30, 6%, 96%)): The main app background. Warm and paper-like.
- **Charcoal Ink** (hsl(30, 5%, 19%)): Primary text color.
- **Subtle Border** (hsl(0, 0%, 90%)): Dividers and structural borders.
- **Pure Card** (hsl(0, 0%, 100%)): Elevated surfaces.

**The One Voice Rule.** The primary accent color is strictly reserved for interactive elements and critical data points. Do not use it for large background sections or decorative headers. Its rarity is the point.

## Typography

**Body Font:** Inter (with sans-serif fallback)

**Character:** Highly legible, neutral, and unopinionated. Designed for reading dense academic material.

### Hierarchy
- **Headline** (700, var(--text-2xl)): Page headers and primary modal titles.
- **Title** (600, var(--text-lg)): Widget titles and section headers.
- **Body** (400, var(--text-sm) to var(--text-base)): General reading and interface labels.
- **Label** (600, var(--text-xs)): Uppercase, tracked out slightly for metadata and small tags.

## Layout

The dashboard utilizes a strictly bound viewport (`100vh`) with inner scrolling zones. Widgets and tools are clamped within a `max-w-7xl` container to maintain readability on ultra-wide displays. Modal overlays expand significantly (e.g., `max-w-4xl`) to provide immersive workspace experiences rather than cramped dialogs.

## Elevation & Depth

The system uses a combination of solid borders on flat surfaces and heavy, diffuse shadows on elevated floating elements.

### Shadow Vocabulary
- **Widget Surface** (`shadow-xs` to `shadow-sm`): Subtle lift for dashboard cards.
- **Immersive Modal** (`shadow-2xl` + `backdrop-blur-xs` on underlay): Maximum depth for focus tools and editors.

**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear primarily as a response to state or structural layering (modals, popovers).

## Shapes

Soft, friendly geometry. All interactive surfaces have distinct rounding to feel approachable.
- **Standard UI Elements:** 10px to 12px (`0.75rem`).
- **Large Modals:** 16px (`1rem`) to enhance the feeling of a standalone workspace.

## Components

### Buttons
- **Shape:** Rounded-md to rounded-xl depending on size (10px - 12px).
- **Primary:** Deep Amethyst background, pure white text, medium weight.
- **Hover / Focus:** Slight opacity shift (`bg-primary/90`) and subtle transform scale.

### Cards / Containers
- **Corner Style:** 12px (`0.75rem`).
- **Background:** Pure white (`hsl(0, 0%, 100%)`).
- **Border:** 1px solid Subtle Border.

### Inputs / Textareas
- **Style:** 1px border, slightly rounded (10px).
- **Focus:** 2px ring in Deep Amethyst to clearly indicate input capture.
- **Height:** Generous padding (e.g., `min-h-[200px]` for text areas) to encourage long-form typing.

### Markdown / Text Outputs
- **Style:** Rendered in standard Tailwind `.prose` with Slate styling.
- **Accents:** Links and Headings inherit the Primary Deep Amethyst color to tie back to the brand.

## Do's and Don'ts

### Do:
- **Do** constrain main app views to `100vh` and use internal scrolling (`overflow-y-auto`) for lists to prevent the entire page from bouncing.
- **Do** provide massive, screen-filling modals for deep-focus tools (like the Pomodoro timer or Smart Tools).

### Don't:
- **Don't** mix multiple accent colors. Stick exclusively to the primary Deep Amethyst.
- **Don't** cramp text inputs; give users generous vertical space.

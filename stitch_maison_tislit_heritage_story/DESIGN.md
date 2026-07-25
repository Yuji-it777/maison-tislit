---
name: Maison Tislit Design System
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1c1c'
  surface-container: '#1f2020'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e4e2e1'
  on-surface-variant: '#cfc5b9'
  inverse-surface: '#e4e2e1'
  inverse-on-surface: '#303030'
  outline: '#989084'
  outline-variant: '#4c463c'
  surface-tint: '#d8c4a1'
  primary: '#d8c4a1'
  on-primary: '#3b2f16'
  primary-container: '#b4a180'
  on-primary-container: '#45381e'
  inverse-primary: '#6c5c40'
  secondary: '#e9bcbc'
  on-secondary: '#452829'
  secondary-container: '#5f3e3f'
  on-secondary-container: '#d6aaab'
  tertiary: '#cac6be'
  on-tertiary: '#32302b'
  tertiary-container: '#a7a39c'
  on-tertiary-container: '#3b3a34'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#f6e0bb'
  primary-fixed-dim: '#d8c4a1'
  on-primary-fixed: '#251a04'
  on-primary-fixed-variant: '#53452a'
  secondary-fixed: '#ffdada'
  secondary-fixed-dim: '#e9bcbc'
  on-secondary-fixed: '#2d1415'
  on-secondary-fixed-variant: '#5f3e3f'
  tertiary-fixed: '#e7e2da'
  tertiary-fixed-dim: '#cac6be'
  on-tertiary-fixed: '#1d1c17'
  on-tertiary-fixed-variant: '#494741'
  background: '#131313'
  on-background: '#e4e2e1'
  surface-variant: '#353535'
typography:
  display-lg:
    fontFamily: Cinzel
    fontSize: 64px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: 0.05em
  display-lg-mobile:
    fontFamily: Cinzel
    fontSize: 40px
    fontWeight: '400'
    lineHeight: '1.2'
    letterSpacing: 0.03em
  headline-lg:
    fontFamily: Cinzel
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.3'
    letterSpacing: 0.02em
  headline-md:
    fontFamily: Cinzel
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Eb Garamond
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Eb Garamond
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Eb Garamond
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
spacing:
  container-max: 1440px
  gutter: 32px
  margin-desktop: 80px
  margin-mobile: 20px
  unit-xs: 4px
  unit-sm: 8px
  unit-md: 16px
  unit-lg: 32px
  unit-xl: 64px
---

## Brand & Style
The design system embodies the intersection of ancestral Moroccan heritage and contemporary high-fashion editorial. It is curated for a sophisticated, global audience that values craftsmanship, storytelling, and the "slow luxury" movement.

The visual style is **Modern Editorial with Heritage Accents**. It relies on a high-contrast, minimalist structure punctuated by intricate details. The aesthetic prioritizes:
- **Atmospheric Luxury:** Leveraging deep, regal tones to evoke a sense of exclusivity.
- **Architectural Clarity:** Using generous whitespace and rigid grid structures inspired by high-fashion magazines to allow product photography to breathe.
- **Ornamental Precision:** Integrating subtle geometric motifs (Zellige) not as heavy patterns, but as delicate, gold-line accents and dividers.

## Colors
The palette is grounded in the earthy yet royal landscape of Morocco, now reimagined in a sophisticated dark mode that emphasizes nighttime mystery and candlelit luxury.

- **Primary (Antique Gold - #B4A180):** Used for primary calls to action, high-impact typography, and interactive states. It represents the precious metals used in Moroccan artisanal jewelry.
- **Secondary (Deep Fig / Mahogany - #452829):** The primary canvas color. This rich, dark tone provides a warm, moody backdrop that allows the gold and light accents to shine.
- **Tertiary (Warm Parchment - #F5F0E8):** Reserved for high-readability text on dark backgrounds and delicate accents.
- **Neutral (Charcoal - #2B2B2B):** Used for UI depth, containers, and subtle structural elements to ground the more vibrant brand tones.

## Typography
The typography pairing establishes a dialogue between Roman monumentalism and classical literary elegance.

- **Display & Headlines (Cinzel):** This typeface brings a chiseled, timeless authority. Use All-Caps for top-level navigation and section headings to reinforce the architectural feel.
- **Body & Labels (EB Garamond):** Chosen for its exceptional readability and graceful serifs. Body text should maintain generous line-height to ensure a relaxed, premium reading experience.
- **Letter Spacing:** Increase tracking for all-caps labels and display text to evoke a sense of "air" and luxury.

## Layout & Spacing
The layout follows a **Fixed-Width Editorial Grid** on desktop and a fluid single column on mobile. 

- **The Golden Gap:** Use expansive vertical spacing (unit-xl) between sections to prevent the UI from feeling "app-like." It should feel like a coffee-table book.
- **Asymmetry:** Occasionally break the grid with offset images or text blocks to mimic high-fashion magazine spreads.
- **Dividers:** Use 0.5px or 1px Antique Gold lines to separate logical sections. These lines may terminate in a small Zellige-inspired diamond motif.

## Elevation & Depth
In this design system, depth is achieved through **Tonal Layering** rather than shadows. 

- **Flat Sophistication:** Avoid drop shadows entirely. Surface elevation is communicated by shifting background colors (e.g., using the Charcoal neutral to define section boundaries against the Deep Fig background).
- **Z-Index Overlays:** High-fashion "depth" is created by overlapping elements—such as a text block partially covering a large-scale photograph.
- **Interactive Depth:** On hover, elements may utilize a subtle Antique Gold "glow" (a very low-spread outer glow) or a simple border-color transition to indicate interactivity.

## Shapes
The shape language is strictly **Sharp (0px)**. 

- **Precision:** Corners on buttons, input fields, and image containers must remain at 90 degrees to maintain the formal, editorial structure.
- **Geometric Accents:** Use the 8-pointed Moroccan star or simple diamond shapes as iconography or decorative bullets, keeping the lines hairline-thin.

## Components

- **Buttons:** Primary buttons are solid Antique Gold with Deep Fig text, 0px radius, and no shadow. Secondary buttons are ghost-style with a Warm Parchment 1px border.
- **Inputs:** Simple bottom-border only (1px Antique Gold or Warm Parchment). Labels sit above in `label-sm` typography.
- **Cards:** Product cards are borderless. The product image should be the focus, with the title in `headline-md` and price in `body-md` centered underneath.
- **Navigation:** A centered, minimal top-tier nav with All-Caps labels. On scroll, the background transitions from transparent to a solid Deep Fig with a thin Gold bottom stroke.
- **Dividers:** Horizontal rules should be `0.5px` height using the Antique Gold color. For special sections, place a small geometric Zellige icon in the center of the line.
- **Pagination:** Minimalist numbers in EB Garamond separated by a vertical gold pipe (`|`).
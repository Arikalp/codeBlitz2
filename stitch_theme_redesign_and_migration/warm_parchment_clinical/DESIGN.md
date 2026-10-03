---
name: Warm Parchment Clinical
colors:
  surface: '#fff8f5'
  surface-dim: '#e6d7cf'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#FDFBF7'
  surface-container: '#faebe3'
  surface-container-high: '#F5EFE6'
  surface-container-highest: '#efe0d8'
  on-surface: '#211a15'
  on-surface-variant: '#554339'
  inverse-surface: '#372f29'
  inverse-on-surface: '#fdeee6'
  outline: '#887367'
  outline-variant: '#dbc1b4'
  surface-tint: '#994703'
  primary: '#994703'
  on-primary: '#ffffff'
  primary-container: '#d97736'
  on-primary-container: '#491d00'
  inverse-primary: '#ffb68c'
  secondary: '#1b6d24'
  on-secondary: '#ffffff'
  secondary-container: '#a0f399'
  on-secondary-container: '#217128'
  tertiary: '#82502e'
  on-tertiary: '#ffffff'
  tertiary-container: '#9f6843'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbc9'
  primary-fixed-dim: '#ffb68c'
  on-primary-fixed: '#321200'
  on-primary-fixed-variant: '#753400'
  secondary-fixed: '#a3f69c'
  secondary-fixed-dim: '#88d982'
  on-secondary-fixed: '#002204'
  on-secondary-fixed-variant: '#005312'
  tertiary-fixed: '#ffdbc7'
  tertiary-fixed-dim: '#fbb88e'
  on-tertiary-fixed: '#311300'
  on-tertiary-fixed-variant: '#693b1b'
  background: '#fff8f5'
  on-background: '#211a15'
  surface-variant: '#efe0d8'
  surface-canvas: '#FAF8F5'
  surface-canvas-subtle: '#F4EFEA'
  surface-card: '#FFFDF9'
  border-subtle: '#EFE6DC'
  border-focus: '#D97736'
  timeline-connector: '#E28B52'
  timeline-node-bg: '#F5ECE1'
  badge-verified-bg: '#EBF5EE'
  badge-verified-text: '#2E7D32'
  badge-consult-bg: '#FDF3EB'
  badge-consult-text: '#C26328'
  badge-lab-bg: '#F5F2EB'
  badge-lab-text: '#544E45'
  text-primary: '#2D2520'
  text-secondary: '#6A5E55'
  text-muted: '#968B81'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.06em
  metric-value:
    fontFamily: JetBrains Mono
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 22px
  metric-label:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes a warm, human-centered editorial clinical atmosphere that moves away from cold, sterile blue software aesthetics toward restorative, calming, parchment-toned healthcare documentation. Designed for patients navigating life-long medical histories and clinicians seeking rapid situational awareness, the interface projects calm confidence, scrupulous medical provenance, and empathetic clarity.

### Aesthetic Foundation
- **Warm Editorial Clinical:** Combines the tactile dignity of archival physical records (warm cream canvases, amber chronological connectors, gentle linen white cards) with technical precision (tabular clinical numbers, monospace vital markers, structured metadata tags).
- **Calm & Grounded:** High-contrast warm charcoal and deep espresso typography replaces harsh digital black, reducing cognitive fatigue during extended medical reviews.
- **Human-Centric Reassurance:** Warm terracotta and copper accents replace emergency-red and corporate-blue paradigms, framing clinical encounters as continuous care conversations rather than transactional medical visits.

## Colors

The palette draws entirely from natural parchment tones, warm earth pigments, and gentle botanical verification cues:

- **Primary (`#D97736`):** Warm terracotta copper. Used for active navigation links, timeline rails, record node borders, and primary interactive anchors.
- **Secondary (`#2E7D32`):** Soft botanical sage/forest green. Dedicated strictly to clinical validation, verified reports, official sign-offs, and healthy parameters.
- **Tertiary (`#8C5835`):** Burnished sepia. Governs secondary headings, date signifiers, and facility labels.
- **Neutral (`#2D2520`):** Warm dark roast charcoal. Replaces pure black to deliver crisp, readable typography with no clinical sterility.
- **Surfaces (`#FAF8F5`, `#FFFDF9`, `#F5EFE6`):** Warm cream canvas layered with soft off-white card surfaces to create gentle visual separation without stark dropped shadows.

## Typography

Typography delivers a dialogue between modern geometric structure and clinical data integrity:

- **Headlines (Space Grotesk):** Provides structured personality and architectural rhythm. Used for page titles, record headings (e.g., "HbA1c & Lipid Profile"), and section headers.
- **Body & Metadata (Plus Jakarta Sans):** Soft, open, and friendly humanist geometry. Carries doctor notes, patient instructions, facility descriptions, and interface navigation.
- **Clinical Data & Metrics (JetBrains Mono):** Monospaced, tabular alignment ensures laboratory figures (e.g., `7.1 %`, `102 mg/dL`), timestamps, and Unique Health IDs line up cleanly across split views and comparative encounters.

## Layout & Spacing

The layout is built around a persistent, minimal vertical navigation dock on the left, an open parchment canvas, and an asymmetrical chronological timeline spine.

### Layout Grid & Flow
- **Shell Layout:** 240px fixed left sidebar with transparent hover navigation anchors, leading into a flexible, expansive scroll canvas max-width container (`1080px`).
- **Timeline Spine:** Positioned with a left gutter offset (48px on desktop) featuring a continuous 2px vertical rule in `#E28B52` that connects circular encounter nodes directly to record cards.
- **Responsive Adaptations:**
  - **Desktop (1024px+):** Sidebar is static. Timeline spine with 40px circular node icons aligns cleanly to card top-left headers.
  - **Tablet (768px - 1023px):** Sidebar collapses into a slim icon bar or drawer. Timeline gutter contracts to 24px.
  - **Mobile (<768px):** Navigation transitions to bottom navigation bar or top header hamburger. The timeline spine aligns tightly to the left margin (16px), with cards stacking full-width.

## Elevation & Depth

This system avoids heavy drop shadows and synthetic elevation layers. Depth is rendered through soft tonal stratification and delicate warm borders:

- **Canvas Foundation:** Layer 0 is the parchment wash (`#FAF8F5`), offering an immediate organic, restful surface.
- **Card Surfaces:** Layer 1 is warm linen white (`#FFFDF9`), edged with a 1px crisp hairline border (`#EFE6DC`).
- **Internal Micro-Containers:** Key detail sections inside cards use an ultra-soft inset tone (`#FDFBF7`) bordered by `#F5EFE6` to house numeric values and notes without jarring visual splits.
- **Soft Ambient Tint:** Floating elements (dropdown menus, popover tooltips, demo banner pills) utilize an amber-tinted micro-shadow: `0 4px 16px -2px rgba(140, 88, 53, 0.06), 0 1px 3px 0 rgba(45, 37, 32, 0.03)`.

## Shapes

The shape system blends friendly approachable pill geometries for statuses and badges with disciplined, rounded rectangular envelopes for clinical cards:

- **Cards & Panels:** 0.75rem to 1rem corner radius (`rounded-lg`), creating approachable yet professional document boundaries.
- **Metadata Badges & Pills:** Full pill radius (`rounded-full` / `9999px`) for record classifications (e.g., "Lab Report", "Consultation", "Verified").
- **Timeline Icons & Avatars:** Perfect circular containers (40px × 40px) encircled by a 2px high-contrast outline (`#2D2520`) with warm peach/amber fill (`#F5ECE1`).

## Components

### Record Cards & Timeline Spine
- **Timeline Node:** 38px–42px circular element centered on the 2px vertical rail (`#E28B52`). Houses category iconography (e.g., beaker for lab test, stethoscope for consultation) in `#2D2520` line art over `#F5ECE1`.
- **Card Header:** Displays record tags on the left (e.g., pill badges), followed by the date right-aligned in secondary text (`Space Grotesk` or `Plus Jakarta Sans`, `#6A5E55`).
- **Encounter Title:** H3 styled in `Space Grotesk` bold (`#2D2520`), accompanied by facility and clinician metadata rows.
- **Key Details Sub-card:** Inset rounded box with uppercase category label (`KEY DETAILS`), structured 2-column key-value metrics with values formatted in `JetBrains Mono`.

### Badges & Status Pills
- **Verified:** Background `#EBF5EE`, text `#2E7D32`, 1px border `#D4EAD9`.
- **Consultation:** Background `#FDF3EB`, text `#C26328`, 1px border `#F9DECB`.
- **Lab Report:** Background `#F5F2EB`, text `#544E45`, 1px border `#EAE4D7`.
- **Demo Mode Pill:** Header indicator pill with warm neutral border, subtle alert icon, and uppercase tracking.

### Buttons & Actions
- **Primary Button:** `#D97736` terracotta fill, `#FFFFFF` text, subtle hover lift to `#C26328`, corner radius `0.5rem`.
- **Secondary Button:** Warm parchment fill (`#F5ECE1`), `#2D2520` text, 1px border `#EFE6DC`.
- **Ghost/Tertiary Action:** Transparent background, `#6A5E55` text, transitions to warm copper hover state.

### Sidebar Navigation
- Vertical item stack with 12px vertical rhythm.
- Active state: Warm cream pill highlight (`#FDF3EB`) with terracotta text (`#D97736`) and matching iconography.
- Inactive state: Transparent background, muted warm charcoal text (`#6A5E55`), transitioning to `#2D2520` on hover.

### Inputs & Form Fields
- Crisp `#FFFDF9` fill with 1px `#EFE6DC` border, transitioning to a focused 1.5px `#D97736` ring. Labels styled in `Plus Jakarta Sans` medium with earthy charcoal tone.
# Design Guidelines: Immersive Solo Study Platform

## Design Approach

**Reference-Based Approach**: Drawing inspiration from focus-driven productivity apps like Forest, Calm, and Linear, combined with the immersive aesthetics of experiential platforms. The design prioritizes creating a mental escape - a digital study sanctuary that feels like genuinely "teleporting" into a dedicated focus environment.

**Core Principle**: Progressive immersion - the interface guides users from awareness (landing) to focus mode (study room), with UI elements that fade into the background to maximize concentration.

## Typography System

**Font Selection**: 
- Primary: Inter or Manrope (clean, modern readability)
- Accent: Space Grotesk or DM Sans (for headlines with character)

**Hierarchy**:
- Hero headline: text-5xl to text-7xl, font-bold
- Section headings: text-3xl to text-4xl, font-semibold
- Body text: text-base to text-lg, font-normal
- UI labels: text-sm, font-medium
- Timer display: text-6xl to text-8xl, font-bold, tabular-nums

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, and 12 consistently
- Component padding: p-6 or p-8
- Section spacing: py-16 to py-24
- Element gaps: gap-4, gap-6, gap-8
- Margins: m-4, m-6, m-8

**Viewport Strategy**:
- Landing page: Natural flow, hero at 90vh for impact
- Study room: Full-screen immersive (100vh) - users stay in this view
- UI overlays: Floating controls with backdrop-blur

## Component Library

### Landing Page Section
**Hero Area**:
- Full-width hero spanning 90vh with blurred background image suggesting a study environment
- Centered content with generous breathing room
- Headline with dramatic scale (text-6xl lg:text-7xl)
- Subtext listing distractions in a clean, bullet-free format with subtle spacing
- Primary CTA button with backdrop-blur-md and semi-transparent background
- Smooth scroll indicator at bottom

**Layout**: Single-column centered (max-w-4xl), emphasizing the message without clutter

### Study Room Section (Full-screen Experience)
**Immersive Canvas**:
- Full viewport (100vh) with background image that fills entire screen
- Overlay gradient for readability without obscuring atmosphere
- UI controls positioned strategically to minimize distraction

**Control Panel** (Floating):
- Compact control bar (top or side) with backdrop-blur-lg
- Background selector: Image thumbnails (not text dropdown) for visual preview
- Sound selector: Icon + label grid for quick selection
- Apply button: Smooth transition effect when environment changes

**Timer Display** (Center-dominant):
- Large, prominent countdown in center or upper-third
- Minimalist container with subtle backdrop
- Start/Pause controls integrated seamlessly
- Progress ring or bar for visual time tracking

**Goals Panel** (Sidebar or Overlay):
- Slide-out panel or collapsible section
- Clean list with checkbox interaction
- Add goal input appears inline
- Completed goals show with subtle strikethrough
- Compact when not in use, unobtrusive

## Interaction Patterns

**Smooth Transitions**:
- Page scroll: Smooth scroll behavior for all navigation
- Background changes: 0.5-0.8s fade transitions
- Sound activation: Gentle fade-in (2-3s) to avoid jarring starts
- Panel toggles: Slide and fade animations (300ms)

**Progressive Disclosure**:
- Landing: Full UI visible for exploration
- Study mode: UI fades to minimal controls after 5 seconds of inactivity
- Hover/interaction: Controls fade back in smoothly

**Feedback**:
- Button presses: Subtle scale (scale-95) on active state
- Goal completion: Satisfying check animation
- Timer completion: Gentle pulsing alert, not aggressive

## Images

**Hero Image**: 
- Large background image (1920x1080 minimum) showing an aesthetic study space (soft-focused desk with window, plants, books)
- Overlay with gradient (from transparent to semi-dark) for text readability
- Blurred treatment (backdrop-blur-sm) for dreamy effect

**Study Room Backgrounds**:
- Library: Warm wooden shelves, ambient lighting
- Forest: Serene woodland scene, dappled light
- Space: Cosmic vista with stars, calming darkness
- Coffee Shop: Cozy cafe interior, inviting atmosphere
Each image: 1920x1080, optimized for web, atmospheric lighting

**Thumbnails**: 
- Small preview versions (200x120) for background selector
- Maintain aspect ratio with object-cover

## Accessibility

- Keyboard navigation for all interactive elements
- ARIA labels for custom controls (timer, sound toggles)
- Focus indicators with visible ring (ring-2)
- Sufficient contrast for text overlays on all backgrounds
- Screen reader support for timer countdown and goal status

## Page Structure

**Single-Page Flow**:
1. Landing section (90vh) - Hero with CTA
2. Study room section (100vh) - Immersive full-screen workspace

**Fixed Elements**:
- Minimal header (logo/brand) that auto-hides in study mode
- Persistent timer display when active
- Quick settings toggle (gear icon) for returning to customization

## Key Differentiators

- **No traditional cards or grids** - embraces full-bleed immersion
- **UI that breathes** - generous spacing, elements that hide when not needed
- **Sound-first design** - audio controls treated as primary, not secondary
- **Environmental storytelling** - each background creates distinct mood
- **Distraction elimination** - literally makes the UI disappear during focus time
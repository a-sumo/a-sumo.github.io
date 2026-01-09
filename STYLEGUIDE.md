# Component Style Guide

This document defines the visual language and styling conventions for interactive components in articles.

## Color Palette

### Primary Colors
- **Accent Blue**: `rgb(100, 130, 220)` - Primary action color, active states, highlights
- **Accent Blue Light**: `rgb(140, 169, 255)` - Links, progress indicators, hover states
- **Accent Blue Hover BG**: `rgba(100, 130, 220, 0.12)` or `rgba(140, 169, 255, 0.15)`

### Neutrals
- **Text Primary**: `rgb(40, 39, 40)` - Main body text
- **Text Secondary**: `rgb(80, 80, 80)` - Secondary text, inactive items
- **Text Muted**: `rgb(100, 100, 100)` or `rgb(140, 140, 140)` - Labels, hints
- **Background Fill**: `rgb(var(--color-fill))` or `rgb(255, 248, 222)` - Page background
- **Container BG**: `rgba(var(--color-fill), 0.8)` - Floating containers with blur
- **Dark Tooltip BG**: `rgb(40, 39, 40)` - Tooltips, dark overlays
- **Warm Neutral (inactive)**: `rgb(200, 180, 160)` or `rgb(190, 170, 150)` - Inactive timeline nodes

### Aurora/Glow Colors (for animated elements)
- **Aurora Green**: `rgba(150, 255, 200, 1)` to `rgba(80, 200, 220, 0.4)`
- Use for scroll indicators, animated blobs, progress highlights

## Typography

### Font Families
- **Monospace UI**: `"SF Mono", "Monaco", "Inconsolata", "Fira Code", monospace`
- **Monospace Content**: `"Roboto Mono", monospace`

### Font Sizes
- **Labels/Small**: `11px` - `12px`
- **Body**: `14px`
- **Chapter Titles**: `14px` uppercase, `letter-spacing: 0.05em` - `0.08em`

### Font Weights
- **Normal**: `400`
- **Medium**: `500` - Used for buttons, labels, chapter titles

## Spacing

### Standard Gaps
- **Tight**: `2px` - Between grouped buttons
- **Small**: `6px` - `8px` - Between related elements
- **Medium**: `12px` - `16px` - Between control groups
- **Large**: `20px` - `24px` - Between sections

### Padding
- **Button Padding**: `6px 16px` (standard), `8px 16px` (larger)
- **Container Padding**: `6px 10px` (compact), `8px 14px` (standard)
- **Track Padding**: `3px` - For button groups within tracks

## Border & Radius

### Border Radius
- **Small**: `4px` - Images inside containers
- **Medium**: `6px` - Buttons
- **Large**: `8px` - Containers, cards
- **Pill/Circle**: `50%` - Round buttons, nodes

### Borders
- **Subtle**: `1px solid rgba(40, 39, 40, 0.15)` or `0.2`
- **Accent Border**: `1px solid rgba(100, 130, 220, 0.3)`
- **Node Border**: `2px` - `3px solid rgb(255, 250, 240)`

## Shadows

### Standard Shadows
- **Button Active**: `box-shadow: 0 2px 8px rgba(100, 130, 220, 0.3)`
- **Button Active Strong**: `box-shadow: 0 2px 12px rgba(100, 130, 220, 0.35)`
- **Tooltip**: `box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3)`
- **Card/Container**: `box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4)`
- **Circular Button**: `box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08)`

## Component Patterns

### Button Group (Segmented Control)
```css
.button-group {
  display: flex;
  gap: 2px;
  background: rgba(var(--color-fill), 0.8);
  padding: 3px;
  border-radius: 8px;
  border: 1px solid rgba(40, 39, 40, 0.2);
  backdrop-filter: blur(8px);
}

.button-group button {
  padding: 6px 16px;
  border: none;
  background: transparent;
  color: rgb(80, 80, 80);
  cursor: pointer;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
  transition: all 0.2s ease;
}

.button-group button:hover:not(.active) {
  background: rgba(100, 130, 220, 0.12);
  color: rgb(40, 39, 40);
}

.button-group button.active {
  background: rgb(100, 130, 220);
  color: white;
  box-shadow: 0 2px 8px rgba(100, 130, 220, 0.35);
}
```

### Carousel Selector (Vertical)
```css
.carousel-container {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(var(--color-fill), 0.8);
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid rgba(40, 39, 40, 0.2);
  cursor: grab;
  user-select: none;
  touch-action: none;
  backdrop-filter: blur(8px);
}

.carousel-track {
  position: relative;
  width: 160px;
  height: 100px;
  perspective: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-style: preserve-3d;
}

.carousel-item {
  position: absolute;
  padding: 2px 14px;
  border: none;
  background: transparent;
  color: rgb(80, 80, 80);
  cursor: pointer;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.3s ease;
  transform-style: preserve-3d;
}

.carousel-item.active {
  background: rgb(100, 130, 220);
  color: white;
  box-shadow: 0 2px 12px rgba(100, 130, 220, 0.35);
}
```

### Circular Arrow Buttons
```css
.arrow-button {
  width: 32px;
  height: 32px;
  border: 1px solid rgba(100, 130, 220, 0.3);
  background: rgba(255, 255, 255, 0.8);
  color: rgb(100, 130, 220);
  cursor: pointer;
  border-radius: 50%;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.arrow-button:hover:not(:disabled) {
  background: rgb(100, 130, 220);
  color: white;
  border-color: rgb(100, 130, 220);
  transform: scale(1.08);
}

.arrow-button:active:not(:disabled) {
  transform: scale(0.95);
}

.arrow-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
```

### Tooltip/Preview Card
```css
.tooltip {
  position: absolute;
  background: rgb(40, 39, 40);
  color: rgb(255, 248, 222);
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: 100;
  pointer-events: none;
}

.tooltip img {
  width: 180px;
  height: auto;
  border-radius: 4px;
  display: block;
  margin-bottom: 6px;
}

.tooltip-text {
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}
```

### Timeline Node
```css
.timeline-node {
  width: 14px;  /* chapter: 14px, subsection: 10px */
  height: 14px;
  border-radius: 50%;
  background: rgb(200, 180, 160);  /* inactive */
  border: 3px solid rgb(255, 250, 240);
  cursor: pointer;
  transition: all 0.2s ease;
}

.timeline-node.active,
.timeline-node.past {
  background: rgb(140, 169, 255);
}

.timeline-node.active {
  box-shadow: 0 0 0 3px rgba(140, 169, 255, 0.3);
}

.timeline-node:hover:not(.active) {
  transform: scale(1.2);
}
```

### Chapter Outline
```css
.chapter-outline {
  font-family: "Roboto Mono", monospace;
  font-size: 14px;
  line-height: 1.9;
}

.chapter-title {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s ease;
}

.chapter-title:hover {
  color: rgb(140, 169, 255);
}

.chapter-number {
  min-width: 24px;
  /* Same color as body text */
}

.chapter-summary {
  padding-left: 52px;
  list-style-type: disc;
}

.chapter-summary li {
  padding: 1px 0;
  cursor: pointer;
  transition: color 0.15s ease;
}

.chapter-summary li:hover {
  color: rgb(140, 169, 255);
}
```

## Transitions & Animations

### Standard Easing
- **Default**: `ease` or `0.2s ease`
- **Smooth**: `0.25s cubic-bezier(0.4, 0, 0.2, 1)`
- **Bouncy**: `0.3s cubic-bezier(0.4, 0, 0.2, 1)`

### Common Transitions
- **Color/Background**: `0.15s` - `0.2s ease`
- **Transform**: `0.2s` - `0.3s ease`
- **Opacity**: `0.2s` - `0.3s ease`
- **Height/Max-Height**: `0.3s ease`

## Responsive Breakpoints

- **Mobile**: `max-width: 480px`
- **Tablet**: `max-width: 768px`
- **Desktop Narrow**: `max-width: 900px`
- **Desktop Wide**: `min-width: 1200px`

### Mobile Adjustments
- Reduce font sizes by 1px
- Reduce padding by 2-4px
- Stack horizontal layouts vertically
- Hide preview images on small screens

## Effects

### Backdrop Blur
Use `backdrop-filter: blur(8px)` with semi-transparent backgrounds for floating UI elements.

### Loading Spinner
```css
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(140, 169, 255, 0.3);
  border-top-color: rgb(140, 169, 255);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

## Icon Styling

When using icons in interactive elements:
- Size: `24px` - `28px` for primary actions
- Use `currentColor` for fill to inherit text color
- Add class `icon-tabler` for consistent stroke styling

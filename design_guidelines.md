# Mental Health Companion PWA - Design Guidelines

## Design Approach
**Reference-Based Hybrid**: Drawing inspiration from Calm (meditation/wellness), Headspace (friendly mental health), and Apple Health (clean data visualization), combined with modern neuroscience aesthetics featuring brain imagery and neural network motifs throughout.

## Core Design Principles
- **Therapeutic Calm**: Every interaction should reduce anxiety, not increase it
- **Gentle Engagement**: Animations guide without overwhelming
- **Scientific Trust**: Brain imagery reinforces credibility and understanding
- **Accessible Warmth**: Professional medical feel balanced with emotional support

## Typography System
**Font Families** (via Google Fonts):
- Primary: 'Inter' (clean, modern, excellent readability)
- Accent/Headings: 'Sora' (soft, rounded, approachable)
- Monospace: 'JetBrains Mono' (for data/metrics)

**Hierarchy**:
- Hero/H1: text-5xl/text-6xl, font-bold, tracking-tight
- H2: text-3xl/text-4xl, font-semibold
- H3: text-2xl, font-medium
- Body: text-base/text-lg, font-normal, leading-relaxed
- Small/Meta: text-sm, font-medium
- Buttons: text-sm/text-base, font-semibold, tracking-wide

## Layout & Spacing System
**Core Spacing Units**: p-3, p-4, p-6, p-8, p-12, p-16, p-20
- Tight spacing: gap-2, gap-3 (cards, lists)
- Comfortable spacing: gap-4, gap-6 (sections)
- Generous spacing: gap-8, gap-12 (page sections)
- Container max-widths: max-w-7xl for content, max-w-md for forms/modals

**Grid Patterns**:
- Dashboard spaces: grid-cols-2 md:grid-cols-3 lg:grid-cols-4
- Community posts: grid-cols-1 md:grid-cols-2 gap-6
- Tools/exercises: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

## Visual Architecture

### Brain Imagery Integration
**Strategic Placement**:
- **Hero/Welcome**: Abstract neural network background with animated connection lines
- **Mood Detection**: Brain scan visualization showing "activity zones" during scanning
- **Dashboard Header**: Subtle brain silhouette watermark in background
- **Loading States**: Animated neuron firing patterns
- **Section Dividers**: Minimalist brain wave patterns as decorative elements
- **Community Mood Tags**: Small brain icons with color-coded regions

**Image Treatment**:
- Use soft gradients overlaying brain imagery (opacity: 0.1-0.3)
- Abstract, artistic interpretations rather than clinical scans
- Animated subtle particle effects resembling neural signals

### Component Library

**Cards**:
- Rounded corners: rounded-2xl
- Soft shadows: shadow-lg with blur
- Padding: p-6 to p-8
- Hover: transform scale-105, shadow-xl (gentle lift)
- Background: Frosted glass effect (backdrop-blur-lg bg-white/80)

**Buttons**:
- Primary: Gradient backgrounds with rounded-full, px-8 py-4
- Secondary: Outlined with backdrop-blur
- Crisis Help: Pulsing red glow animation, fixed bottom-right on mobile
- Floating Action: rounded-full, shadow-2xl, bottom-6 right-6

**Navigation**:
- Mobile: Bottom tab bar with icon + label, rounded top corners
- Desktop: Sidebar with space icons, hover expand animation
- Breadcrumbs: For nested sections with smooth transitions

**Modals/Overlays**:
- Full-screen on mobile, centered on desktop
- Backdrop: bg-black/60 backdrop-blur-sm
- Entry: Slide up from bottom (mobile), fade + scale (desktop)
- Close: Smooth fade-out with scale-down

### Animations Strategy

**Core Animations** (User explicitly requested animations):

1. **Lumi Welcome Tour**:
   - Floating/bobbing animation for Lumi character (2s ease-in-out loop)
   - Speech bubble fade-in with slight bounce
   - Step transitions: slide + fade

2. **Mood Detection**:
   - Camera preview: Subtle border pulse during scanning
   - Brain scan overlay: Radial wave animation emanating from center (1.5s)
   - Mood reveal: Confidence bar fills with gradient (1s ease-out)
   - Success state: Gentle checkmark draw animation

3. **Voice Agent**:
   - Waveform: Real-time audio visualization bars (synchronized with voice)
   - Lumi avatar: Breathing animation while listening (2s loop)
   - Chat bubbles: Staggered fade-in from bottom
   - Thinking state: Three-dot pulse animation

4. **Breathing Exercises**:
   - Expanding/contracting circle (4-7-8 breathing pattern)
   - Gradient shift on inhale/exhale
   - Count-down numbers fade in/out

5. **Dashboard**:
   - Space cards: Staggered entrance (100ms delay each)
   - Mood graph: Line draws over 1.5s
   - Suggestion cards: Gentle rotate on hover (2deg)

6. **Community Posts**:
   - Upvote button: Heart pop animation
   - New post: Slide in from top with shadow grow
   - Comments: Nested indent with connecting lines animate in

7. **Loading States**:
   - Neural pathway animation (dots traveling along lines)
   - Skeleton screens with shimmer effect
   - Page transitions: Crossfade (300ms)

**Gesture Interactions**:
- Swipe to dismiss modals
- Pull-to-refresh on feeds
- Long-press for quick actions

### Space-Specific Designs

**Music Space**:
- Album art grid with hover zoom
- Custom audio player: Circular progress, waveform preview
- Mood filter chips with brain region colors

**Book Reading Space**:
- Card-based layout with reading progress rings
- Page-flip animation for stories
- Bookmark icon animation on save

**Exercises Space**:
- Step-by-step wizard with progress indicator
- Video/GIF demonstrations in cards
- Timer with circular countdown

**Games Space**:
- Full-screen game canvas with minimal chrome
- Score animations (pop + confetti particles)
- Calming background gradients

**Community Space**:
- Masonry layout for varied post heights
- Category badges with brain region icons
- Nested comments with indent lines
- Moderation overlay: Blur + "Sensitive Content" label

### Journaling Interface
- Timeline view with mood color dots
- Entry cards expand on click
- Emotion chart with animated data points
- Daily prompt cards with brain imagery backgrounds

### Safety & Crisis Features
- **Help Button**: Fixed position, pulsing glow (2s red ring), backdrop-blur button
- **Crisis Page**: Clean, direct layout with immediate contact options, no distractions
- **Moderation Warnings**: Gentle yellow/orange tones, supportive copy, never punitive

## PWA Visual Identity

**App Icons**: 
- Brain + heart fusion symbol
- Gradient: Purple to teal (trust + calm)
- Rounded square with 20% corner radius

**Splash Screen**:
- Centered Lumi logo with neural network background
- Loading animation: Neuron pulse

**Install Prompt**:
- Bottom sheet modal with preview screenshots
- Benefits list with checkmarks
- Gradient CTA button

## Mobile-First Specifications
- Touch targets: minimum 44x44px
- Thumb-zone safe areas for primary actions
- Bottom navigation for key spaces
- Swipe gestures for navigation
- Responsive images with lazy loading
- Smooth 60fps animations

## Accessibility Considerations
- High contrast mode support
- Motion preferences respected (prefers-reduced-motion)
- Focus indicators: 2px ring with offset
- Screen reader labels on all interactive elements
- Form validation with clear error states

## Images & Illustrations

**Hero Section**: Abstract brain network visualization with particle animations and gradient overlay (purple/blue/teal), Lumi character floating in foreground

**Dashboard Background**: Subtle neural pathway pattern (10% opacity) behind content cards

**Space Thumbnails**: Custom illustrations for each space featuring brain + activity icon (music notes + neurons, book + synapses, etc.)

**Mood Detection**: Layered brain scan silhouette with color-coded emotion regions during analysis

**Community Headers**: Brain imagery specific to category (creativity = frontal lobe highlight, anxiety = amygdala region, etc.)

This design system creates a premium, therapeutic experience that balances scientific credibility with emotional warmth, using brain imagery and smooth animations to build trust while maintaining a calming, supportive atmosphere throughout the entire user journey.
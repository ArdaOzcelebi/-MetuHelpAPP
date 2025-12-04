# METU Help - Design Guidelines

## Architecture Decisions

### Authentication
**Auth Required** - This app involves user-generated content, peer-to-peer interactions, and community features.

**Implementation:**
- Use SSO for streamlined onboarding
- Include Apple Sign-In (iOS requirement)
- Include Google Sign-In for cross-platform support
- Auth screens must use METU branding (maroon/white)
- Privacy policy & terms of service links on signup
- Account management in profile with:
  - User avatar (generate 3-4 simple, friendly avatar presets in METU maroon accent colors)
  - Display name and basic campus info (optional department/year)
  - Notification preferences
  - Logout with confirmation
  - Delete account (Settings > Account > Delete with double confirmation)

### Navigation
**Tab Navigation** - 3 main feature areas with center action button

**Tab Structure:**
1. **Home/Dashboard** - Primary landing screen with two main action paths
2. **Browse Needs (Center FAB)** - Floating action button for quick "Post Need"
3. **Profile** - User account, settings, and activity history

**Navigation Flow:**
- Tab 1 (Home): Stack for dashboard and detail views
- Tab 2 (Browse): Stack for aid listings and academic Q&A forum
- Tab 3 (Profile): Stack for settings and account management
- Modals: Post need form, ask question form, respond to requests

## Screen Specifications

### 1. Home/Dashboard Screen
**Purpose:** Primary decision point - direct users to "Need Help" or "Offer Help" paths

**Layout:**
- **Header:** Transparent, custom with METU logo (generate simple maroon wordmark), no back button, right button for notifications bell
- **Main Content:** Non-scrollable, vertically centered layout
  - Large app title/greeting at top third
  - Two large, equal-sized CTA buttons stacked vertically in center:
    - "NEED HELP" (Yardım İstiyorum) - Bright green/gold background
    - "OFFER HELP" (Yardım Ediyorum) - METU maroon background
  - Both buttons should be minimum 64pt touch targets
  - Small text below showing recent activity count (e.g., "12 active requests nearby")
- **Safe Area:** Top inset: headerHeight + Spacing.xl, Bottom inset: tabBarHeight + Spacing.xl

**Components:** Custom hero buttons, status text, notification indicator

### 2. Aid/Sharing Screen ("Need Help" Flow)
**Purpose:** Browse active requests or post new urgent needs

**Layout:**
- **Header:** Default navigation with back button, title "Find Help", right button "Post Need" (opens modal)
- **Main Content:** Scrollable list/feed
  - Filter chips at top (All, Medical, Academic, Transport, Other)
  - Card-based list of requests showing:
    - Request type icon (Feather icons)
    - Title (e.g., "Need 1 Bandage")
    - Location/building (e.g., "Near Library")
    - Time posted (e.g., "5 min ago")
    - "I Can Help" button (green, right-aligned)
  - Empty state with illustration and "Be the first to help"
- **Safe Area:** Top inset: Spacing.xl, Bottom inset: tabBarHeight + Spacing.xl

**Components:** Filter chips, request cards, floating "Post Need" button alternative if modal not preferred

### 3. Post Need Modal
**Purpose:** Quick form to submit urgent request

**Layout:**
- Modal presentation (slides up from bottom)
- **Header:** Title "What do you need?", left button "Cancel", right button "Post" (enabled when valid)
- **Form Fields:**
  - Category selector (Medical, Academic, Transport, Other)
  - Short text input (max 60 characters for urgency)
  - Location dropdown (common campus buildings)
  - Optional details (expandable)
- Submit button at bottom (green, full width)
- **Safe Area:** Top inset: Spacing.xl, Bottom inset: insets.bottom + Spacing.xl

### 4. Academic Q&A Screen ("Offer Help" Flow)
**Purpose:** Searchable forum for campus/academic questions

**Layout:**
- **Header:** Default with back button, title "Campus Q&A", search bar integrated
- **Main Content:** Scrollable feed
  - Tabs at top: "Recent" | "Unanswered" | "Popular"
  - Question cards showing:
    - Question title
    - Category tag (Classes/Professors/Campus Life)
    - Number of responses
    - Timestamp
  - Floating "Ask Question" button (bottom right, METU maroon, with drop shadow)
- **Safe Area:** Top inset: Spacing.xl, Bottom inset: tabBarHeight + Spacing.xl + 80 (for FAB clearance)

**Components:** Search bar, filter tabs, question cards, floating action button

### 5. Profile/Settings Screen
**Purpose:** User account, preferences, activity history

**Layout:**
- **Header:** Transparent, title "Profile"
- **Main Content:** Scrollable form-like layout
  - Avatar and name at top (editable)
  - Stats row (Requests Posted, Help Given)
  - Settings sections:
    - Notifications (toggle switches)
    - Account info
    - About & Privacy links
    - Logout button (destructive style)
- **Safe Area:** Top inset: headerHeight + Spacing.xl, Bottom inset: tabBarHeight + Spacing.xl

## Design System

### Color Palette
**Primary:**
- METU Maroon: #800000 (primary brand color)
- White/Off-white: #FFFFFF / #FAFAFA (backgrounds)
- Dark Gray: #1A1A1A (text)

**Accent:**
- Action Green: #10B981 (primary CTAs, success states)
- Alert Red: #DC2626 (urgent needs, errors)
- Light Gray: #E5E5E5 (borders, inactive states)

**Usage:**
- Large CTA buttons: Maroon or Green backgrounds with white text
- Tab bar: White background, maroon active state
- Cards: White with subtle shadow, maroon accent for important info

### Typography
- **Headers:** SF Pro Display (iOS) / Roboto (Android), Bold, 24-32pt
- **Body:** SF Pro Text / Roboto, Regular, 16pt
- **Captions:** SF Pro Text / Roboto, Regular, 14pt
- **Buttons:** SF Pro Text / Roboto, Semibold, 16-18pt

All text must have minimum 4.5:1 contrast ratio for accessibility.

### Spacing
- Spacing.xs: 4pt
- Spacing.sm: 8pt
- Spacing.md: 16pt
- Spacing.lg: 24pt
- Spacing.xl: 32pt
- Spacing.xxl: 48pt

### Visual Feedback
- **Touchables:** All buttons scale to 98% on press with 150ms animation
- **Large CTAs:** No drop shadow; use solid colors with opacity change (0.9) on press
- **Cards:** Subtle press state with background color change (#F5F5F5)
- **Floating buttons:** Shadow specs - offset: {width: 0, height: 2}, opacity: 0.10, radius: 2

### Required Assets
1. **METU Logo/Wordmark** - Simple maroon text logo for header
2. **User Avatar Presets** - 3-4 minimalist, friendly avatar options in complementary maroon tones (geometric shapes or simple illustrations)
3. **Empty State Illustrations** - 2-3 simple line art illustrations for:
   - No active requests
   - No questions found
   - Welcome/onboarding
4. **Category Icons** - Use Feather icons from @expo/vector-icons for:
   - Medical: activity
   - Academic: book
   - Transport: navigation
   - Other: help-circle

**NO EMOJIS** - Use system icons exclusively for consistency and professionalism.

### Accessibility Requirements
- Minimum touch target: 44x44pt (Apple HIG)
- All interactive elements must have clear visual states (default, pressed, disabled)
- Labels must be clear and concise
- Support Dynamic Type (text scaling)
- VoiceOver/TalkBack optimized labels for all interactive elements
- High contrast mode support
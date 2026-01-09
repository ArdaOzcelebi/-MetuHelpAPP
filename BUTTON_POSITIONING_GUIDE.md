# Create Post Button Positioning Guide

## Visual Layout Specification

### Header Button Dimensions
```
┌─────────────────────────────────────────────┐
│                                             │
│  Screen Title               [+]  ← Button   │ 
│                              ↑              │
│                              │              │
│                        40x40px button       │
│                        12px margin-right    │
│                        (Spacing.md)         │
└─────────────────────────────────────────────┘
```

### Button Specifications

#### Size
- Width: 40px
- Height: 40px
- Border Radius: 16px (BorderRadius.md)
- Effective Touch Area: 48x48px (with 8px hitSlop)

#### Spacing
- `marginRight: 12px` (Spacing.md)
- Ensures consistent distance from screen edge
- Aligns with navigation header standards

#### Colors
- **Light Mode**: `#800000` (METUColors.maroon)
- **Dark Mode**: `#CC3333`
- **Icon**: `#FFFFFF` (white)

#### Icon
- Size: 20px
- Default: `plus` (Feather icon)
- Alternative: `edit-2` (for Q&A screens)

---

## Screen-by-Screen Layout

### 1. Browse Screen (Browse Tab)

```
╔═════════════════════════════════════════════╗
║ Browse                           [+]        ║  ← Header
╠═════════════════════════════════════════════╣
║  [Search box]                               ║
║  ┌───────────┬───────────┐                 ║
║  │   Needs   │ Questions │  ← Tabs         ║
║  └───────────┴───────────┘                 ║
║                                             ║
║  Content area (questions/needs)             ║
║                                             ║
╚═════════════════════════════════════════════╝
```

**Button Action**: Navigate to AskQuestion screen  
**Icon**: `plus`

---

### 2. Need Help Screen (Home Tab → Need Help)

```
╔═════════════════════════════════════════════╗
║ Find Help                        [+]        ║  ← Header
╠═════════════════════════════════════════════╣
║  [Category filters]                         ║
║  ┌─────┐ ┌─────┐ ┌─────┐                  ║
║  │ All │ │Med. │ │Acad.│                   ║
║  └─────┘ └─────┘ └─────┘                   ║
║                                             ║
║  [Location filter]                          ║
║                                             ║
║  ┌─────────────────────────────────────┐   ║
║  │ Help Request Card                   │   ║
║  │ ┌──┐  Need transport to...          │   ║
║  │ │🚗│  📍 A3 Building                 │   ║
║  │ └──┘  [Offer Help]                  │   ║
║  └─────────────────────────────────────┘   ║
║                                             ║
╚═════════════════════════════════════════════╝
```

**Button Action**: Navigate to PostNeed screen  
**Icon**: `plus`

---

### 3. Offer Help Screen (Home Tab → Q&A Forum)

```
╔═════════════════════════════════════════════╗
║ Campus Q&A                      [✎]         ║  ← Header
╠═════════════════════════════════════════════╣
║  [Search questions]                         ║
║  ┌────────┬──────────┬─────────┐           ║
║  │ Recent │Unanswered│ Popular │  ← Tabs   ║
║  └────────┴──────────┴─────────┘           ║
║                                             ║
║  ┌─────────────────────────────────────┐   ║
║  │ Question: How to register...?       │   ║
║  │ 💬 3 responses • 2h ago             │   ║
║  └─────────────────────────────────────┘   ║
║                                             ║
║  ┌─────────────────────────────────────┐   ║
║  │ Question: Where is the library?     │   ║
║  │ 💬 0 responses • 5h ago             │   ║
║  └─────────────────────────────────────┘   ║
║                                             ║
╚═════════════════════════════════════════════╝
```

**Button Action**: Navigate to AskQuestion screen (via BrowseTab)  
**Icon**: `edit-2` (pen icon)

---

## Comparison: Before vs After

### BEFORE (Floating Action Button)

```
Screen Layout - OLD:
┌─────────────────────────────────────────────┐
│  Header (no button)                         │
├─────────────────────────────────────────────┤
│                                             │
│  Scrollable Content                         │
│                                             │
│                                             │
│  More Content                               │
│                                             │
│                                             │
│                                             │
│                                ┌──────┐     │ ← FAB
│                                │  +   │     │   (56x56px)
│                                └──────┘     │
│────────────────────────────────────────────│
│  Tab Bar                                    │
└─────────────────────────────────────────────┘

Issues:
- ❌ Position: bottom right (inconsistent margins)
- ❌ Size: 56x56px (too large, blocks content)
- ❌ Absolute positioning overlaps content
- ❌ Different positioning per screen (0px vs 16px)
```

### AFTER (Header Button)

```
Screen Layout - NEW:
┌─────────────────────────────────────────────┐
│  Header Title               [+]             │ ← Button
├─────────────────────────────────────────────┤   (40x40px)
│                                             │   12px margin
│  Scrollable Content                         │
│  (No overlapping buttons!)                  │
│                                             │
│  More Content                               │
│                                             │
│                                             │
│                                             │
│                                             │
│                                             │
│────────────────────────────────────────────│
│  Tab Bar                                    │
└─────────────────────────────────────────────┘

Benefits:
- ✅ Consistent top-right position
- ✅ Properly integrated with navigation
- ✅ Never overlaps content
- ✅ Standard UI pattern
- ✅ Accessible via header
```

---

## Safe Area Handling

The button automatically respects safe areas because it's part of the navigation header:

```
iPhone with Notch:
╔═══════════════════════════════╗
║  [notch area]                 ║
╠═══════════════════════════════╣
║  Title              [+]  ←────╢── Safe area automatically handled
╠═══════════════════════════════╣    by React Navigation
║                               ║
║  Content                      ║
║                               ║
```

---

## Touch Target

```
Visual Size:          Actual Touch Target:
┌──────┐              ┌────────────┐
│      │              │            │
│  +   │  40x40px     │     +      │  48x48px
│      │              │            │  (with 8px hitSlop)
└──────┘              └────────────┘

Meets iOS HIG minimum 44x44pt requirement ✓
```

---

## Implementation Code Reference

### Component Usage
```tsx
import { CreatePostButton } from "@/components/CreatePostButton";

// In navigation options:
options={({ navigation }) => ({
  headerRight: () => (
    <CreatePostButton 
      icon="plus"                              // Optional, default is "plus"
      onPress={() => navigation.navigate(...)} // Required
    />
  ),
})}
```

### Component Props
```typescript
interface CreatePostButtonProps {
  onPress: () => void;                        // Required: Navigation action
  icon?: keyof typeof Feather.glyphMap;      // Optional: Default "plus"
}
```

---

## Accessibility

### Screen Reader Announcement
The button is part of the navigation header and will be announced properly:
- iOS VoiceOver: "Button, plus" or "Button, edit"
- Android TalkBack: "Plus button" or "Edit button"

### Touch Target
- Minimum 44x44pt as per iOS Human Interface Guidelines ✓
- Actual target: 48x48px (40px button + 8px hitSlop) ✓

### Visual Indicators
- Clear icon
- Consistent color (high contrast)
- Proper shadow for depth perception

---

## Maintenance Notes

### To change icon for a specific screen:
```tsx
<CreatePostButton 
  icon="edit-2"  // Use any Feather icon name
  onPress={...} 
/>
```

### To change button color (if needed in future):
Edit `components/CreatePostButton.tsx`:
```tsx
backgroundColor: isDark ? "#CC3333" : METUColors.maroon
```

### To adjust spacing:
Edit margin in `components/CreatePostButton.tsx`:
```tsx
marginRight: Spacing.md,  // Currently 12px
```

---

## Testing Matrix

| Screen | Tab | Button Icon | Action | Status |
|--------|-----|-------------|--------|--------|
| Browse | Browse Tab | `plus` | → AskQuestion | ✅ |
| NeedHelp | Home Tab | `plus` | → PostNeed | ✅ |
| OfferHelp | Home Tab | `edit-2` | → AskQuestion | ✅ |

---

## Design Tokens Used

From `constants/theme.ts`:

```typescript
Spacing.md = 12          // Button margin-right
BorderRadius.md = 16     // Button border radius
METUColors.maroon = "#800000"  // Light mode color
Shadows.small = {        // Button shadow
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.08,
  shadowRadius: 2,
  elevation: 2,
}
```

---

## Summary

✅ **Consistent**: All buttons at top-right corner  
✅ **Accessible**: Integrated with navigation header  
✅ **Responsive**: Automatic safe area handling  
✅ **Theme-compliant**: Uses project spacing and colors  
✅ **Maintainable**: Single reusable component  
✅ **Standards-compliant**: Meets iOS/Android guidelines  


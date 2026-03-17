# CLAUDE.md — Splitwise App (React Native)

This file is the single source of truth for all UI/UX decisions in this project.
Read this before making any changes to screens, components, or styles.

---

## Project overview

A React Native Splitwise clone with a modern dark UI. The app has a working backend.
Focus is on clean, premium mobile UX — not a pixel-copy of the original Splitwise app.

---

## Tech stack

- **Framework**: React Native (bare workflow or Expo)
- **Navigation**: @react-navigation/native + @react-navigation/bottom-tabs
- **Gradients**: expo-linear-gradient
- **Icons**: react-native-vector-icons or @expo/vector-icons
- **Fonts**: DM Sans + DM Mono (loaded via expo-font or react-native-google-fonts)
- **State**: whatever is already wired to the backend — do not change state management

---

## Design system

### Colors

Always use these exact values. Never hardcode one-off colors.

```ts
// src/theme/colors.ts
export const colors = {
  // Backgrounds
  bgBase: "#0E0E14", // app root background
  bgScreen: "#13131E", // screen background
  bgSurface: "#1C1C2A", // cards, inputs, bottom sheets
  bgSurface2: "#232336", // nested surfaces, progress track, avatar bg

  // Accent
  accent: "#7C6EFA", // primary CTA, active nav, links, focus rings
  accentDim: "rgba(124, 110, 250, 0.15)", // accent ghost backgrounds

  // Semantic
  success: "#3DD68C", // positive balance, "you are owed", settled
  successDim: "rgba(61, 214, 140, 0.15)",
  danger: "#FF6B6B", // negative balance, "you owe"
  dangerDim: "rgba(255, 107, 107, 0.15)",
  warning: "#FFB44C", // pending, neutral states
  warningDim: "rgba(255, 180, 76, 0.15)",

  // Text
  textPrimary: "#E4E4F0", // headings, labels, amounts
  textSecondary: "#8A8A9A", // subtext, captions, placeholders
  textMuted: "#5A5A70", // disabled, empty states, placeholder text
  white: "#FFFFFF",

  // Borders
  border: "#2E2E42", // card borders, dividers
  borderSubtle: "#1F1F2E", // list item dividers

  // Gradient stops for BalanceCard
  gradientStart: "#7C6EFA",
  gradientEnd: "#5B4ED1",
};
```

### Typography

```ts
// src/theme/typography.ts
export const fonts = {
  sans: "DMSans", // body, UI labels, buttons
  mono: "DMSans_Mono", // time display, numeric codes
};

export const textStyles = {
  // Headings
  h1: {
    fontFamily: "DMSans",
    fontSize: 22,
    fontWeight: "600",
    color: colors.white,
  },
  h2: {
    fontFamily: "DMSans",
    fontSize: 20,
    fontWeight: "600",
    color: colors.white,
  },
  h3: {
    fontFamily: "DMSans",
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },

  // Body
  body: {
    fontFamily: "DMSans",
    fontSize: 14,
    fontWeight: "400",
    color: colors.textPrimary,
  },
  bodyMd: {
    fontFamily: "DMSans",
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  small: {
    fontFamily: "DMSans",
    fontSize: 12,
    fontWeight: "400",
    color: colors.textSecondary,
  },
  tiny: {
    fontFamily: "DMSans",
    fontSize: 11,
    fontWeight: "500",
    color: colors.textSecondary,
  },

  // Special
  bigAmount: {
    fontFamily: "DMSans",
    fontSize: 52,
    fontWeight: "600",
    color: colors.white,
    letterSpacing: -2,
  },
  cardAmount: {
    fontFamily: "DMSans",
    fontSize: 34,
    fontWeight: "600",
    color: colors.white,
  },
  label: {
    fontFamily: "DMSans",
    fontSize: 11,
    fontWeight: "500",
    color: colors.textSecondary,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontFamily: "DMSans",
    fontSize: 12,
    fontWeight: "500",
    color: colors.textSecondary,
    letterSpacing: 1.0,
    textTransform: "uppercase",
  },
};
```

### Spacing

```ts
// src/theme/spacing.ts
export const spacing = {
  screenH: 22, // horizontal screen padding
  screenV: 20, // vertical screen padding (top)
  cardPad: 16, // inner card padding
  gap: 12, // gap between cards
  itemGap: 8, // gap between items in a row
  rowPad: 11, // list item vertical padding
};
```

### Border radius

```ts
export const radius = {
  xs: 8, // badges, chips, small pills
  sm: 12, // quick action buttons, search bar
  md: 14, // input fields, search bar
  lg: 16, // list item avatars, icons
  xl: 20, // cards (GroupCard, ActivityItem card)
  card: 22, // BalanceCard
  modal: 28, // bottom sheets
  full: 999, // pill badges, toggle
};
```

---

## Component library

### File structure (follow this exactly)

```
src/
  components/
    common/
      Avatar.tsx          // initials circle, colored bg
      Badge.tsx           // owe / owed / settled pill
      SectionTitle.tsx    // uppercase muted label
      Divider.tsx         // 0.5px subtle line
      ProgressBar.tsx     // thin 4px progress track
      IconButton.tsx      // 36x36 surface button
    cards/
      BalanceCard.tsx     // gradient hero card on Dashboard
      GroupCard.tsx       // group with progress bar
      ActivityItem.tsx    // single feed row
      ExpenseItem.tsx     // expense row inside group
    forms/
      AmountInput.tsx     // big centered amount display + hidden TextInput
      FieldBlock.tsx      // labeled surface input field
      SplitPerson.tsx     // person row with share bar
      SplitPills.tsx      // Equal / % / Custom switcher
    navigation/
      BottomTabBar.tsx    // custom tab bar component
  screens/
    DashboardScreen.tsx
    GroupsScreen.tsx
    GroupDetailScreen.tsx
    AddExpenseScreen.tsx
    ActivityScreen.tsx
    ProfileScreen.tsx
  theme/
    colors.ts
    typography.ts
    spacing.ts
    index.ts             // re-exports everything
```

---

## Screen specifications

### DashboardScreen

Layout (top to bottom):

1. StatusBar — dark content, translucent
2. Header row — greeting text (left) + Avatar (right), padding: `spacing.screenH`
3. BalanceCard — full width minus 16px each side, `radius.card`, LinearGradient
4. Section label "Quick actions"
5. Quick actions row — 4 equal buttons: Add Expense, Settle Up, New Group, Reports
6. Section label "Recent activity"
7. ScrollView of ActivityItem rows

BalanceCard internals:

- Label: "Total balance" (tiny uppercase)
- Amount: net balance in large white text, prefix "+" or "−"
- Two chips side-by-side: "You are owed" (success) and "You owe" (danger)
- Chips have `rgba(255,255,255,0.12)` background, `radius.xs`

Quick action button:

- Background: `bgSurface`, border: `border`, radius: `radius.sm`
- Icon container: 36×36, radius 12, color-tinted background (`accentDim` etc.)
- Label: 11px muted below icon
- Equal flex: `flex: 1`

ActivityItem:

- Left: 40×40 emoji avatar, radius 14, tinted background per category
- Middle: title (bodyMd) + subtitle (small) — group name + time
- Right: amount (bodyMd, green or red) + "you get back" / "you owe" (tiny)
- Separator: `borderSubtle` 0.5px bottom border (not on last item)

### GroupsScreen

Layout:

1. Header row — "Groups" h2 + "+" IconButton
2. Search bar — bgSurface, radius.md, 🔍 icon + placeholder
3. ScrollView of GroupCards
4. Section label for latest group's expenses
5. ExpenseItem list for top group

GroupCard internals:

- Top row: emoji icon (44×44, bgSurface2, radius 14) + name/member count + Badge
- Badge: `dangerDim` bg + `danger` text for "you owe", `successDim` + `success` for "owed"
- Progress bar: 4px height, `bgSurface2` track, colored fill (danger/success/accent)
- Footer row: "Total: ₹X" (small) + "Last: X ago" (small muted)

ExpenseItem:

- Left: 40×40 emoji icon, radius 12, bgSurface2
- Middle: expense name (bodyMd) + "Paid by X · Date" (small)
- Right: your share direction (green/red, bodyMd) + "your share: ₹X" (tiny muted)

### AddExpenseScreen

Layout:

1. Header row: Cancel (textSecondary) | "Add Expense" (h3 centered) | Save (accent, bold)
2. AmountInput — centered, full screen width
3. Form fields section
4. SplitCard
5. Submit FAB button

AmountInput:

- Hidden `TextInput` (keyboardType="numeric", autoFocus)
- Display: currency symbol (28px accent) + amount (bigAmount)
- Underline: thin gradient line below (accent color, fade in/out)
- Placeholder amount: "0" until user types

Form fields use FieldBlock:

- Background: bgSurface, border: border, radius: radius.md, padding: 14 16
- Label: tiny uppercase muted above
- Value: bodyMd textPrimary (or textMuted for placeholder)
- Full-width: Description
- Half-and-half row: Group | Date
- Full-width: Paid by

SplitCard:

- Background: bgSurface, border: border, radius: radius.xl, padding: 16
- Header: "Split between" (bodyMd) + SplitPills right-aligned
- SplitPills: ["Equal", "%", "Custom"] — active pill: accent bg + white text
- SplitPerson per member: colored Avatar (34px) + name + share % right + thin share bar

SplitPerson share bar:

- Track: 3px, bgSurface2, radius 3
- Fill: accent color, width = share percentage
- Animate width change when split mode changes

Submit FAB:

- Full width minus 32px, accent bg, radius 18, 16px vertical padding
- Text: "Add Expense" 15px 600 white
- Must be last element, not floating (use marginBottom for safe area)

### GroupDetailScreen (not in mockup but needed)

- Header: back arrow + group name + member count chip
- Hero row: total group spend + "your net balance" chip
- Filter pills: All | Food | Travel | Utilities | Other
- Expense list: chronological, date separators
- Floating "Add Expense" button (accent, bottom right, shadow)

---

## Navigation

### Bottom tab bar

4 tabs: Home, Groups, Activity, Profile

```ts
// Custom tab bar rules:
// - Background: bgScreen, top border: borderSubtle 0.5px
// - Active icon stroke: accent
// - Active label: accent, 10px
// - Inactive: textMuted, 10px
// - No default tab bar — use custom BottomTabBar component
// - Safe area: paddingBottom = insets.bottom (use react-native-safe-area-context)
```

### Stack screens

- AddExpenseScreen: modal presentation, slides up from bottom
- GroupDetailScreen: push from GroupsScreen
- SettleUpScreen: modal presentation

---

## Strict rules — always follow

### DO

- Use `colors.*` tokens everywhere — never hardcode hex values
- Use `spacing.*` for all padding/margin — no magic numbers
- Use `radius.*` for all borderRadius values
- Keep screen backgrounds `bgScreen` (#13131E)
- Keep card backgrounds `bgSurface` (#1C1C2A)
- Show positive balances in `success` (#3DD68C), negative in `danger` (#FF6B6B)
- Use `DM Sans` for all text — no system fonts
- Use `LinearGradient` (expo-linear-gradient) for BalanceCard only
- Keep bottom safe area padding on all screens using `useSafeAreaInsets`
- Animate only `opacity` and `transform` — no layout animations unless needed
- Use `FlatList` for lists longer than 5 items — never ScrollView with map()
- Add `keyExtractor` to every FlatList

### DON'T

- Don't use white or light backgrounds anywhere
- Don't use `StyleSheet.flatten` to override theme values
- Don't add new colors outside the color token system — extend `colors.ts` instead
- Don't use `position: absolute` for layout — use Flexbox
- Don't mix emoji avatars and initials avatars in the same list — pick one per context
- Don't add drop shadows on dark backgrounds — they don't show and add overhead
- Don't use `Text` without a matching `textStyles.*` entry
- Don't fetch data inside components — data must come from props or a hook
- Don't hardcode currency symbol — use a `useCurrency()` hook or config value
- Don't show raw API error objects — always show a friendly message

---

## Avatar color system

Assign colors deterministically by user ID (or name hash) so avatars are consistent:

```ts
const AVATAR_COLORS = [
  { bg: "#7C6EFA", text: "#fff" }, // accent purple
  { bg: "#3DD68C", text: "#0E2818" }, // success green
  { bg: "#FF6B6B", text: "#1a0a0a" }, // danger red
  { bg: "#FFB44C", text: "#1a0d00" }, // warning amber
  { bg: "#5DCAA5", text: "#04342C" }, // teal
  { bg: "#D4537E", text: "#4B1528" }, // pink
];

export function getAvatarColor(id: string) {
  const index = id.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}
```

---

## Badge component spec

```ts
type BadgeVariant = "owe" | "owed" | "settled" | "pending";

const badgeStyles = {
  owe: { bg: colors.dangerDim, text: colors.danger },
  owed: { bg: colors.successDim, text: colors.success },
  settled: { bg: "rgba(90,90,112,0.2)", text: colors.textSecondary },
  pending: { bg: colors.warningDim, text: colors.warning },
};

// Shape: paddingHorizontal 10, paddingVertical 3, borderRadius radius.full
// Font: 11px, fontWeight 500
```

---

## Amount display rules

- Always use Indian number formatting for INR: `₹1,00,000` not `₹100,000`
- Positive net balance → prefix "+" → `success` color
- Negative net balance → prefix "−" (not hyphen) → `danger` color
- Zero balance → "Settled up" badge, no amount
- Round to 2 decimal places for shares: `₹320.50`
- Round to 0 decimals for totals and balances: `₹2,840`

```ts
export function formatINR(amount: number, decimals = 0): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: decimals,
  }).format(Math.abs(amount));
}

export function formatBalance(amount: number): { text: string; color: string } {
  if (amount === 0) return { text: "Settled up", color: colors.textSecondary };
  const sign = amount > 0 ? "+" : "−";
  return {
    text: `${sign}${formatINR(amount)}`,
    color: amount > 0 ? colors.success : colors.danger,
  };
}
```

---

## Split calculation rules

Equal split:

```ts
const perPerson = Math.floor((total / members.length) * 100) / 100;
// Give remainder to payer
```

Percentage split:

- All percentages must sum to exactly 100
- Show validation error inline if they don't

Custom split:

- All custom amounts must sum to exactly the total
- Show running total vs entered total with difference highlighted

---

## Empty states

Every list screen must handle empty state:

- GroupsScreen empty: "No groups yet" + "Create your first group" button (accent)
- Activity empty: "No activity yet" + subtitle "Add an expense to get started"
- GroupDetail empty: "No expenses in this group" + "Add expense" button

Empty state layout: centered vertically, icon (48px emoji or SVG), title (h3), subtitle (small), optional CTA button.

---

## Loading states

- Use skeleton placeholders — not spinners — for list screens
- Skeleton color: `bgSurface2` animated with opacity 0.4 → 1.0 → 0.4 loop
- BalanceCard skeleton: same gradient card, amount replaced by blurred rect
- Never show a blank white/dark screen while loading

---

## Error handling UI

- Inline errors (form validation): small red text below the field, `danger` color, 12px
- Toast notifications: bottom of screen, above tab bar, `bgSurface` bg, icon + message
- Network errors: inline retry button in the list, not a full-screen error

---

## Performance rules

- Memoize `GroupCard` and `ActivityItem` with `React.memo`
- Use `useCallback` for `onPress` handlers passed to list items
- Images (group avatars): use `FastImage` or `Image` with explicit width/height
- Avoid anonymous functions in JSX for list item renderers

---

## Git conventions

- Component files: PascalCase (`GroupCard.tsx`)
- Hook files: camelCase with "use" prefix (`useExpenses.ts`)
- Screen files: PascalCase + "Screen" suffix (`GroupDetailScreen.tsx`)
- Theme files: camelCase (`colors.ts`, `spacing.ts`)

---

## Checklist before marking a screen done

- [ ] All colors from `colors.ts` — no hardcoded hex
- [ ] All spacing from `spacing.ts` — no magic numbers
- [ ] Empty state implemented
- [ ] Loading skeleton implemented
- [ ] Error state handled
- [ ] Safe area insets applied (top + bottom)
- [ ] FlatList used for lists (not map inside ScrollView)
- [ ] Amounts formatted with `formatINR`
- [ ] Tested on both small screen (iPhone SE) and large (iPhone 14 Pro Max)

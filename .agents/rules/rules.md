---
trigger: manual
description: strict architectural rules for the Cut & Go project
---

# Architecture Rules

## 1. Directory Ownership

| Directory | Purpose | Contains |
|-----------|---------|----------|
| `src/app/` | Expo Router routing layer ONLY | Route files, layout files, thin re-exports |
| `src/features/{name}/` | Feature-specific logic | screens, components, hooks, services, store, types, translations |
| `src/common/` | Shared logic across features | components/ui, hooks, utils, types, translations |
| `src/providers/` | App-level providers and global stores | QueryProvider, I18nProvider, stores (auth, settings) |
| `src/lib/` | External services | supabase.ts, i18n.ts |

## 2. App Directory Rules (CRITICAL)

- Files in `src/app/` MUST be thin wrappers:
  ```tsx
  export { default } from '@/features/home/screens/HomeScreen';
  ```
- **NEVER** place in `src/app/`:
  - Business logic
  - API calls
  - State management
  - Component definitions (beyond layout wrappers)
  - StyleSheet definitions

## 3. Feature Structure

Every feature MUST follow:

```
src/features/{featureName}/
  screens/          # Screen components
  components/       # Feature-specific components
  hooks/            # Feature-specific hooks
  services/         # API calls (Supabase, etc.)
  store/            # Zustand store (if needed)
  types/            # TypeScript types
  translations/
    en.ts
    ar.ts
  index.ts          # Barrel export
```

Omit empty directories — only create what is needed.

## 4. State Management Rules

- **Global stores** (auth, settings) → `src/providers/stores/`
- **Feature stores** (appointments, favorites) → `src/features/{name}/store/`
- **NEVER** create a monolithic store that spans multiple features
- Each store MUST have its own persistence key
- Store files MUST be named `use{Name}Store.ts`

## 5. Import Rules

- Always use `@/` path aliases (maps to `./src/`)
- Feature → Feature imports are allowed but should be minimized
- Common → Feature imports are **FORBIDDEN** (common must not depend on features)
- Feature → Common imports are allowed and encouraged

## 6. Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Screen files | PascalCase + `Screen` suffix | `HomeScreen.tsx` |
| Component files | PascalCase | `BarberCard.tsx` |
| Hook files | camelCase with `use` prefix | `useThemeColors.ts` |
| Store files | camelCase with `use` prefix + `Store` suffix | `useAuthStore.ts` |
| Service files | camelCase | `barberService.ts` |
| Translation files | lowercase language code | `en.ts`, `ar.ts` |

## 7. Translation Rules

- Each feature owns its translations in `translations/{en,ar}.ts`
- Shared translations (e.g., tab names) live in `src/common/translations/`
- Translations are merged automatically by `src/lib/i18n.ts`
- Translation keys use dot notation with feature prefix: `t('home.search_placeholder')`

## 8. Component Placement

- **Reusable across features** → `src/common/components/`
- **Used only in one feature** → `src/features/{name}/components/`
- **NEVER** define components inline in screen files if they exceed 30 lines

## 9. What is NOT Allowed

- ❌ Monolithic stores spanning multiple features
- ❌ Business logic in `src/app/` route files
- ❌ Direct Supabase calls in screen components (use services layer)
- ❌ Hardcoded strings (use translations)
- ❌ Cross-feature component imports without going through barrel exports
- ❌ Importing from `react-native` for SafeAreaView (use `react-native-safe-area-context`)
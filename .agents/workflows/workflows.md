---
description: how to add new features, APIs, and components to the project
---

# Developer Workflows

## How to Add a New Feature

1. Create the feature directory:
   ```
   src/features/{featureName}/
     screens/
     components/
     hooks/
     services/
     store/          (optional)
     types/
     translations/
       en.ts
       ar.ts
     index.ts
   ```

2. Add screens inside `screens/` with PascalCase naming:
   ```tsx
   // src/features/reviews/screens/ReviewsScreen.tsx
   export default function ReviewsScreen() { ... }
   ```

3. Add translations for the feature in `translations/en.ts` and `translations/ar.ts`:
   ```ts
   export default {
     title: 'Reviews',
     submit: 'Submit Review',
   } as const;
   ```

4. Register translations in `src/lib/i18n.ts`:
   ```ts
   import reviewsEn from '../features/reviews/translations/en';
   import reviewsAr from '../features/reviews/translations/ar';
   // Add to resources:
   // en: { translation: { ..., reviews: reviewsEn } }
   // ar: { translation: { ..., reviews: reviewsAr } }
   ```

5. Add a route file in `src/app/` as a thin re-export:
   ```tsx
   // src/app/reviews.tsx
   export { default } from '@/features/reviews/screens/ReviewsScreen';
   ```

6. (Optional) Create a feature Zustand store in `store/use{Name}Store.ts`.

7. Export public APIs from `index.ts`:
   ```ts
   export { default as ReviewsScreen } from './screens/ReviewsScreen';
   ```

---

## How to Add an API Call

1. Create a service file in the feature:
   ```ts
   // src/features/reviews/services/reviewsService.ts
   import { supabase } from '@/lib/supabase';

   export const getReviews = async (barberId: string) => {
     const { data, error } = await supabase
       .from('reviews')
       .select('*')
       .eq('barber_id', barberId);
     if (error) throw error;
     return data;
   };
   ```

2. Wrap with a React Query hook:
   ```ts
   // src/features/reviews/hooks/useReviews.ts
   import { useQuery } from '@tanstack/react-query';
   import { getReviews } from '../services/reviewsService';

   export const useReviews = (barberId: string) => {
     return useQuery({
       queryKey: ['reviews', barberId],
       queryFn: () => getReviews(barberId),
     });
   };
   ```

3. Use the hook in the screen:
   ```tsx
   const { data, isLoading, error } = useReviews(barberId);
   ```

---

## How to Add a UI Component

### Reusable (shared across features)
Place in `src/common/components/`:
```
src/common/components/ui/Avatar.tsx
```

### Feature-specific
Place in the feature's `components/` directory:
```
src/features/reviews/components/ReviewCard.tsx
```

### Rules
- Keep components focused and single-responsibility
- Use `useThemeColors()` from `@/common/hooks/useThemeColors` for theming
- Accept data via props, never fetch data inside shared components

---

## How to Add a New Store

1. Create the store file:
   ```ts
   // src/features/{feature}/store/use{Name}Store.ts
   import { create } from 'zustand';
   import { persist, createJSONStorage } from 'zustand/middleware';
   import AsyncStorage from '@react-native-async-storage/async-storage';

   interface MyState {
     // ...
   }

   export const useMyStore = create<MyState>()(
     persist(
       (set) => ({
         // ...
       }),
       {
         name: 'cut-and-go-{feature}',
         storage: createJSONStorage(() => AsyncStorage),
       }
     )
   );
   ```

2. If the store is **global** (auth, settings), place it in `src/providers/stores/`.

---

## How to Add a New Language

1. Add `{lang}.ts` files to every feature's `translations/` directory
2. Add `{lang}.ts` to `src/common/translations/`
3. Import and register in `src/lib/i18n.ts`
4. Handle RTL in `src/providers/stores/useSettingsStore.ts`

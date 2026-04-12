# Maweedi — Development Guide

> **This document is law.** Every developer and AI agent working on this project must follow these rules without exception. When in doubt, re-read this file.

---

## 1. Core Principles (Non-Negotiable)

### Principle 1: Simplicity Over Cleverness
If a pattern feels "smart" but adds complexity, reject it. The best code is code that a junior developer can understand on first read.

### Principle 2: Isolation Over Coupling
Every feature must be fully self-contained. Deleting a feature folder must not break the app.

### Principle 3: Three Layers, No Exceptions
Every piece of server data flows through exactly three layers:
```
api.ts → useFeature.ts → Component
```
No shortcuts. No API calls in components. No rendering in hooks.

### Principle 4: Prefer Duplication Over Premature Abstraction
If two features need similar code, let them duplicate it. Extract a shared utility only when **three or more** features share the exact same logic.

### Principle 5: Optimize for Deletion
When you write code, imagine someone deleting it in 3 months. Make that easy.

### Principle 6: The Backend is the Source of Truth
The backend validates everything. The frontend provides good UX by validating early, but never assumes the backend will accept input just because the frontend approved it.

---

## 2. Folder & Naming Conventions

### 2.1 Files

| Type | Convention | Example |
|---|---|---|
| Feature API file | `api.ts` | `features/booking/api.ts` |
| Feature hook | `use[Feature].ts` | `features/booking/useBooking.ts` |
| Feature store | `store.ts` | `features/booking/store.ts` |
| Feature types | `types.ts` | `features/booking/types.ts` |
| Component | `PascalCase.tsx` | `components/TimeSlotGrid.tsx` |
| Shared hook | `use[Name].ts` | `shared/hooks/useThemeColors.ts` |
| Global store | `use[Name]Store.ts` | `stores/useAuthStore.ts` |
| Translation | `en.ts`, `ar.ts` | `translations/en.ts` |
| Route file | `lowercase.tsx` or `[param].tsx` | `app/business/[id].tsx` |

### 2.2 Directories

| Directory | Contains | Access Rule |
|---|---|---|
| `src/app/` | **Screens + route definitions** | Each file IS the screen. Imports and composes from `features/` and `shared/`. |
| `src/features/` | All product logic, per feature | Each feature is self-contained. **NEVER contains `screens/` folder.** |
| `src/shared/` | Cross-feature utilities, UI primitives | Only code used by 3+ features |
| `src/stores/` | Global Zustand stores | Max 3 files ever |
| `src/lib/` | Pure configuration | No logic, only setup |

### 2.3 Import Aliases

Use `@/` for absolute imports from `src/`:
```typescript
// ✅ Good
import { apiClient } from '@/shared/api/client';
import { useAuthStore } from '@/stores/useAuthStore';

// ❌ Bad
import { apiClient } from '../../../shared/api/client';
```

### 2.4 Export Rules

- **Feature folders:** Export components, hooks, API functions, and types. **NEVER export screens.**
- **Components:** Use named exports, never default exports.
- **Hooks:** Always use named exports.
- **Route files in `app/`:** Use `export default function` — this is the ONLY place `default export` is used.

---

## 2.5 Screen Placement Rule

> **🔒 NON-NEGOTIABLE: Screens belong ONLY to `app/`.**

| Layer | Responsibility |
|---|---|
| `app/` | **Screens + Routing.** Each route file IS the screen. It imports components from features, calls hooks, and composes the page. |
| `features/` | **Logic + UI Building Blocks.** Exports components, hooks, api functions, types, translations. **NEVER exports screens.** |

**This rule exists to eliminate decision-making.** There is exactly ONE correct place for screens. No exceptions. No `screens/` folder inside any feature. Ever.

**Correct pattern:**
```tsx
// src/app/booking/[id].tsx — THIS FILE IS THE SCREEN
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAvailability } from '@/features/booking/useBooking';
import { DatePicker } from '@/features/booking/components/DatePicker';
import { TimeSlotGrid } from '@/features/booking/components/TimeSlotGrid';

export default function BookingScreen() {
  // Screen logic: call hooks, compose feature components
  const { data, isLoading } = useAvailability(businessId, serviceId, staffId, date);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <DatePicker selected={date} onSelect={setDate} />
      <TimeSlotGrid slots={data?.slots ?? []} onSelect={handleSlotSelect} />
    </SafeAreaView>
  );
}
```

**Forbidden pattern:**
```tsx
// ❌ WRONG — features must NEVER contain a screens/ folder
// src/features/booking/screens/BookingScreen.tsx  ← THIS MUST NOT EXIST

// ❌ WRONG — app/ must NEVER re-export from a feature's screens/
export { default } from '@/features/booking/screens/BookingScreen';
```

---

## 3. Feature Creation Checklist

When you need to add a new feature (e.g., "reviews"), follow this exact sequence:

### Step 1: Create the Feature Folder
```
src/features/reviews/
  api.ts
  useReviews.ts
  types.ts
  components/
    ReviewForm.tsx
    ReviewCard.tsx
  translations/
    en.ts
    ar.ts
```

### Step 2: Define Types from Database Schema
Open `backend-docs/database.md`. Find the relevant table. Derive your TypeScript types:
```typescript
// features/reviews/types.ts
export type Review = {
  id: string;
  appointment_id: string;
  user_id: string;
  business_id: string;
  staff_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string | null;
  created_at: string;
};

export type AddReviewPayload = {
  appointment_id: string;
  rating: number;
  comment?: string;
};
```

### Step 3: Write the API File
Open `backend-docs/openapi.yaml`. Find the endpoint. Write the thinnest possible call:
```typescript
// features/reviews/api.ts
import { apiClient } from '@/shared/api/client';
import type { AddReviewPayload, Review } from './types';
import type { ApiResponse } from '@/shared/types/api';

export const addReview = (payload: AddReviewPayload) =>
  apiClient.post<ApiResponse<Review>>('/add_review.php', payload);
```

### Step 4: Write the React Query Hook
```typescript
// features/reviews/useReviews.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addReview } from './api';
import type { AddReviewPayload } from './types';

export const useAddReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddReviewPayload) => addReview(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};
```

### Step 5: Build Components (Dumb)
```tsx
// features/reviews/components/ReviewForm.tsx
type Props = {
  onSubmit: (rating: number, comment: string) => void;
  isLoading: boolean;
};

export function ReviewForm({ onSubmit, isLoading }: Props) {
  // Only UI state (selected stars, text input)
  // Calls onSubmit prop with values
  // Shows spinner based on isLoading prop
}
```

### Step 6: Add Route File (This IS the Screen)
```tsx
// src/app/review/[appointmentId].tsx — THIS FILE IS THE SCREEN
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useAddReview } from '@/features/reviews/useReviews';
import { ReviewForm } from '@/features/reviews/components/ReviewForm';

export default function ReviewScreen() {
  const { appointmentId } = useLocalSearchParams<{ appointmentId: string }>();
  const { mutate: submitReview, isPending } = useAddReview();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ReviewForm
        onSubmit={(rating, comment) =>
          submitReview({ appointment_id: appointmentId, rating, comment })
        }
        isLoading={isPending}
      />
    </SafeAreaView>
  );
}
```
> **Note:** The screen is defined directly in the route file. It imports the `ReviewForm` component and `useAddReview` hook from the feature, then composes them here. No `screens/` folder exists inside `features/reviews/`.

### Step 7: Register Translations
```typescript
// src/lib/i18n.ts
import reviewsEn from '@/features/reviews/translations/en';
import reviewsAr from '@/features/reviews/translations/ar';
// Add to resources
```

### Step 8: Verify Independence
- Delete the feature folder mentally. Does anything else break? If yes, fix the coupling.

---

## 4. API Integration Rules

### Rule 4.1: Every API Call Uses `apiClient`
Never import `axios` directly in feature code. Always use the shared client:
```typescript
// ✅ Correct
import { apiClient } from '@/shared/api/client';

// ❌ Wrong
import axios from 'axios';
```

### Rule 4.2: API Functions Are 1-3 Lines
An API function does ONE thing: makes a network call. No try/catch. No state updates. No conditional logic.
```typescript
// ✅ Correct — thin and focused
export const getServices = (businessId: string) =>
  apiClient.get<ApiResponse<ServiceResponse>>('/services.php', {
    params: { business_id: businessId },
  });

// ❌ Wrong — too much logic in API layer
export const getServices = async (businessId: string) => {
  try {
    const response = await apiClient.get('/services.php', { params: { business_id: businessId } });
    if (response.status === 'success') {
      return response.data.map(s => ({ ...s, price: parseFloat(s.price) }));
    }
    throw new Error(response.message);
  } catch (err) {
    console.error(err);
    throw err;
  }
};
```

### Rule 4.3: Response Envelope is Handled Globally
The Axios interceptor unwraps the `{ status, data, message }` envelope. Feature code receives the `data` directly from React Query. Never manually check `response.status === 'success'` in feature code.

### Rule 4.4: Query Keys Are Simple Arrays
```typescript
// ✅ Predictable
queryKey: ['businesses', lat, lng]
queryKey: ['services', businessId]
queryKey: ['availability', businessId, serviceId, staffId, date]
queryKey: ['appointments']

// ❌ Over-complicated
queryKey: [{ type: 'businesses', params: { lat, lng } }]
```

### Rule 4.5: StaleTime Defaults
Set appropriate `staleTime` to avoid unnecessary refetching:

| Data Type | staleTime | Rationale |
|---|---|---|
| Business list | 5 min | Businesses rarely change |
| Services | 10 min | Prices/services change infrequently |
| Availability | 0 (default) | Must always be fresh (race conditions) |
| Appointments | 1 min | Should reflect recent changes |
| Profile | 5 min | Rarely changes |
| Notifications | 30 sec | Should be near-real-time |

---

## 5. React Query Usage Rules

### Rule 5.1: `useQuery` for Reading
```typescript
// GET requests = useQuery
export const useNearbyBusinesses = (lat: number, lng: number) =>
  useQuery({
    queryKey: ['businesses', lat, lng],
    queryFn: () => getNearbyBusinesses(lat, lng),
    staleTime: 5 * 60 * 1000,
    enabled: lat !== 0 && lng !== 0, // Only fetch when we have coordinates
  });
```

### Rule 5.2: `useMutation` for Writing
```typescript
// POST/PUT/DELETE requests = useMutation
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
};
```

### Rule 5.3: Never Call `queryClient.setQueryData` Unless You Know Why
Prefer `invalidateQueries` (refetch from server) over `setQueryData` (manual cache update). The server is the source of truth.

Only use `setQueryData` for optimistic updates where UX demands it (e.g., toggling a favorite heart).

### Rule 5.4: Disable Queries Conditionally with `enabled`
```typescript
// Don't fetch until we have required params
useQuery({
  queryKey: ['availability', businessId, date],
  queryFn: () => getAvailability(businessId, date),
  enabled: !!businessId && !!date,  // Wait for both values
});
```

### Rule 5.5: Never Duplicate React Query Data Into Zustand
React Query IS your server data store. Do not copy `data` from a hook into a Zustand store. Just call the hook wherever you need the data.

---

## 6. State Management Rules

### Rule 6.1: Decision Tree
Before adding state, ask yourself:

```
Is it server data (from an API)?
  └── YES → React Query. Stop.

Is it needed across the entire app?
  └── YES → Global Zustand store (max 3 total). Stop.

Is it needed across multiple screens in one feature?
  └── YES → Feature Zustand store. Stop.

Is it needed only in this component?
  └── YES → React useState. Stop.
```

### Rule 6.2: Zustand Stores Are Tiny
A Zustand store should have:
- **Under 10 properties.**
- **No API calls.** Stores hold state. They don't fetch.
- **No heavy computed values.** Derive in the component.

```typescript
// ✅ Good — small and focused
interface AuthState {
  token: string | null;
  user: User | null;
  setSession: (token: string, user: User) => void;
  clearSession: () => void;
}

// ❌ Bad — doing too much
interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;  // API calls don't belong here
  register: (data: RegisterInput) => Promise<void>;
  fetchProfile: () => Promise<void>;
}
```

### Rule 6.3: Persist Only What's Necessary
Only persist state that must survive app restarts:
- ✅ Language preference, theme, onboarding completion flag
- ❌ Temporary UI state, loading indicators, form values

---

## 7. UI Component Rules (Dumb Components)

### Rule 7.1: Components Never Fetch Data
A component receives data through **props**. Only screen-level files in `app/` call hooks directly.

```typescript
// ✅ Screen in app/ calls hooks and passes data down
// src/app/(customer)/home.tsx
export default function HomeScreen() {
  const { data, isLoading } = useNearbyBusinesses(lat, lng);
  return <BusinessList businesses={data} />;
}

// ✅ Feature component receives data via props — no hooks, no fetching
// src/features/discover/components/BusinessCard.tsx
function BusinessCard({ business }: { business: Business }) {
  return <Text>{business.name}</Text>;
}

// ❌ Feature component fetches its own data
function BusinessCard({ businessId }: { businessId: string }) {
  const { data } = useBusinessDetail(businessId);  // WRONG — move this to the screen in app/
  return <Text>{data.name}</Text>;
}
```

### Rule 7.2: Components Never Contain Business Logic
Business logic belongs in hooks or utility functions, not in JSX.

```typescript
// ❌ Bad — business logic jammed into component
function SlotGrid({ slots }) {
  const availableSlots = slots.filter(s => {
    const now = new Date();
    const slotTime = new Date(s.start_time);
    return slotTime > now && !s.is_booked;
  });
  return availableSlots.map(s => <Chip label={s.time} />);
}

// ✅ Good — logic lives in the hook, component is dumb
function SlotGrid({ slots, onSelect }) {
  return slots.map(s => <Chip label={s.time} onPress={() => onSelect(s)} />);
}
```

### Rule 7.3: Use Shared UI Primitives
All shared components live in `shared/components/ui/`. Use them everywhere:

```tsx
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { Text } from '@/shared/components/ui/Text';
import { Skeleton } from '@/shared/components/ui/Skeleton';
```

### Rule 7.4: Theming
Use `useThemeColors()` for all colors. Never hardcode hex values in components:
```typescript
// ✅ Good
const colors = useThemeColors();
<View style={{ backgroundColor: colors.background }}>

// ❌ Bad
<View style={{ backgroundColor: '#1a1a2e' }}>
```

### Rule 7.5: SafeAreaView
Always use `react-native-safe-area-context`, never the React Native built-in:
```typescript
// ✅ Correct
import { SafeAreaView } from 'react-native-safe-area-context';

// ❌ Wrong — doesn't handle Android properly
import { SafeAreaView } from 'react-native';
```

---

## 8. Error Handling Rules

### Rule 8.1: Three-Layer Error Strategy

| Layer | Handles | How |
|---|---|---|
| **Axios Interceptor** | 401, 500, network errors | Toast + redirect |
| **React Query Hook** | Feature-specific errors (409, 400) | `onError` callback |
| **Component** | Display error state | Reads `isError` from hook |

### Rule 8.2: Components Use Conditional Rendering, Not Try/Catch
```typescript
// ✅ Good
const { data, isLoading, isError } = useNearbyBusinesses(lat, lng);

if (isLoading) return <Skeleton />;
if (isError) return <EmptyState message="Could not load shops" onRetry={refetch} />;
return <BusinessList businesses={data} />;

// ❌ Bad
try {
  const data = await fetchBusinesses();
} catch (err) {
  setError(err.message);
}
```

### Rule 8.3: Booking Conflict (409) — Special Case
```typescript
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      // Navigate to success screen
    },
    onError: (error) => {
      if (error.status === 409) {
        // Refresh available slots so the taken slot disappears
        queryClient.invalidateQueries({ queryKey: ['availability'] });
        showToast('This slot was just taken. Please choose another.');
      }
    },
  });
};
```

### Rule 8.4: Display Backend Messages Directly
The backend's `message` field is always user-safe. Display it as-is:
```typescript
showToast(error.message); // Backend message, not a technical string
```

---

## 9. Performance Rules

### Rule 9.1: Use `expo-image` Instead of React Native's `Image`
```typescript
// ✅ Good — optimized caching, blur placeholders, transitions
import { Image } from 'expo-image';

// ❌ Bad — no caching, no transitions
import { Image } from 'react-native';
```

### Rule 9.2: FlatList Over ScrollView for Lists
Always use `FlatList` or `SectionList` for any list longer than 5 items. Never render lists inside `ScrollView`.

### Rule 9.3: Memoize Expensive Callbacks
```typescript
// ✅ For functions passed to child components
const handlePress = useCallback((id: string) => {
  router.push(`/business/${id}`);
}, []);

// Don't over-memoize — only when passing to heavy child components
```

### Rule 9.4: Avoid Inline Styles for Complex Objects
```typescript
// ❌ Bad — creates new object on every render
<View style={{ padding: 16, backgroundColor: colors.card, borderRadius: 12 }}>

// ✅ Good — stable reference
const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 12 },
});
<View style={[styles.card, { backgroundColor: colors.card }]}>
```

### Rule 9.5: React Query Stale Time
Always set `staleTime`. Without it, React Query refetches on every mount, which burns battery and data.

---

## 10. Do's and Don'ts

### ✅ DO

| Do | Why |
|---|---|
| Read `backend-docs/` before building a feature | Types, endpoints, and constraints are documented there |
| Keep `api.ts` files under 20 lines | They should be thin wrappers |
| Use `enabled` flag in `useQuery` | Prevents accidental fetches with missing params |
| Disable buttons during mutations | Prevents double-submission |
| Handle 409 Conflict for bookings | Race conditions are expected, not errors |
| Test with `isLoading` and `isError` states | Users will see these states |
| Use `SafeAreaView` from `react-native-safe-area-context` | Works on both iOS and Android |
| Derive types from `database.md` | Single source of truth |
| Invalidate related queries after mutations | Keep UI in sync with server |
| Use `expo-secure-store` for tokens | Encrypted storage, not AsyncStorage |

### ❌ DON'T

| Don't | Why |
|---|---|
| Don't put API calls in components | Breaks the three-layer pattern |
| Don't create a `utils/` folder | It becomes a dumping ground |
| Don't import from another feature's internals | Violates feature isolation |
| Don't duplicate server data into Zustand | React Query already manages it |
| Don't use `try/catch` in components | Use React Query's `isError` instead |
| Don't hardcode business categories | App must scale to dentists, salons, etc. |
| Don't create more than 3 global stores | Sign of architectural problems |
| Don't use `default export` (except in `app/` route files) | Named exports are searchable and refactorable |
| Don't `console.log` in production code | Use proper error boundaries |
| Don't use `any` type | Use `unknown` and narrow, or define proper types |
| Don't bypass the Axios interceptor | Token injection and error handling are centralized |
| Don't use `AsyncStorage` for sensitive data | Use `expo-secure-store` for tokens |
| Don't put a `screens/` folder inside `features/` | Screens belong ONLY in `app/` — no exceptions |
| Don't re-export screens from features in `app/` route files | Define the screen function directly in the route file |

---

## 11. Code Examples

### 11.1 Complete Feature: Toggle Favorite

This is a minimal but complete example of how an entire feature should look.

**Types:**
```typescript
// features/favorites/types.ts
export type ToggleFavoritePayload = {
  business_id: string;
};
```

**API:**
```typescript
// features/favorites/api.ts
import { apiClient } from '@/shared/api/client';
import type { ToggleFavoritePayload } from './types';
import type { ApiResponse } from '@/shared/types/api';

export const toggleFavorite = (payload: ToggleFavoritePayload) =>
  apiClient.post<ApiResponse<null>>('/toggle_favorite.php', payload);
```

**Hook:**
```typescript
// features/favorites/useFavorites.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleFavorite } from './api';

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
```

**Component:**
```tsx
// features/favorites/components/FavoriteButton.tsx
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  isFavorite: boolean;
  onToggle: () => void;
  disabled: boolean;
};

export function FavoriteButton({ isFavorite, onToggle, disabled }: Props) {
  return (
    <Pressable onPress={onToggle} disabled={disabled}>
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={24}
        color={isFavorite ? '#e74c3c' : '#888'}
      />
    </Pressable>
  );
}
```

**Usage in Screen:**
```tsx
// Inside a screen component
const { mutate: toggle, isPending } = useToggleFavorite();

<FavoriteButton
  isFavorite={business.is_favorite}
  onToggle={() => toggle({ business_id: business.id })}
  disabled={isPending}
/>
```

### 11.2 Complete Query Hook with Error Handling

```typescript
// features/booking/useBooking.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAvailability, createBooking } from './api';
import type { BookingPayload } from './types';

export const useAvailability = (
  businessId: string,
  serviceId: string,
  staffId: string | null,
  date: string
) =>
  useQuery({
    queryKey: ['availability', businessId, serviceId, staffId, date],
    queryFn: () => getAvailability(businessId, serviceId, staffId, date),
    staleTime: 0, // Always fresh — race conditions
    enabled: !!businessId && !!serviceId && !!date,
  });

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BookingPayload) => createBooking(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error: { status: number; message: string }) => {
      if (error.status === 409) {
        queryClient.invalidateQueries({ queryKey: ['availability'] });
        // Toast: "This slot was just taken."
      }
    },
  });
};
```

### 11.3 Axios Client Setup

```typescript
// shared/api/client.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach JWT to every request
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Unwrap response envelope and handle global errors
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message ?? 'Something went wrong';

    if (status === 401) {
      await SecureStore.deleteItemAsync('auth_token');
      // Reset auth store and redirect
    }

    return Promise.reject({ status, message });
  }
);
```

### 11.4 Route File (Screen Defined Directly)

```tsx
// src/app/(customer)/home.tsx — THIS FILE IS THE SCREEN
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNearbyBusinesses } from '@/features/discover/useDiscover';
import { BusinessList } from '@/features/discover/components/BusinessList';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { data, isLoading, isError, refetch } = useNearbyBusinesses(30.0444, 31.2357);

  if (isLoading) return <Skeleton />;
  if (isError) return <EmptyState message="Could not load shops" onRetry={refetch} />;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BusinessList businesses={data.data} onPress={(id) => router.push(`/business/${id}`)} />
    </SafeAreaView>
  );
}
```

Screens are defined inside `app/`. They import components and hooks from features and compose them. This is the ONLY correct pattern. There is no `screens/` folder inside features.

---

## 12. Quick Reference Card

```
Where do screens go?
  → ONLY in app/. Never in features/.
  → Each route file IS the screen. It composes feature components.
  → No screens/ folder exists inside any feature. Ever.

Need to add a feature?
  → Create folder in features/ (api.ts, useFeature.ts, types.ts, components/).
  → Add the screen as a route file in app/.

Need to call an API?
  → api.ts (thin call) → useFeature.ts (React Query) → Screen in app/ (render).

Need global state?
  → Is it server data? Use React Query.
  → Is it app-wide client state? Use existing Zustand store.
  → Still need more? Think again. You probably don't.

Need a shared component?
  → Is it used by 3+ features? Put it in shared/components/ui/.
  → Fewer than 3? Keep it in the feature's components/.

Need to handle an error?
  → 401? Axios interceptor handles it.
  → Feature-specific? Handle in hook's onError.
  → Show to user? Component reads isError from hook.

Need to add a translation?
  → Feature translations in features/[name]/translations/.
  → Shared translations in shared/translations/.
  → Register in lib/i18n.ts.
```

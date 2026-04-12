# Maweedi — Project Documentation

> **Last Updated:** March 2026
> **Status:** Architecture Rebuild (Pre-Development)
> **Frontend Stack:** Expo SDK 54 · Expo Router · TypeScript · React Query · Zustand · Axios

---

## 1. Project Overview

**Maweedi** is a high-concurrency booking platform. Phase 1 targets barbershops, with plans to expand to salons, dentists, and other service categories.

There are **two user experiences** inside one codebase:

| Experience | Who | Phase |
|---|---|---|
| **Customer App** | End-users discovering shops and booking appointments | Phase 1 (Now) |
| **Admin / Staff App** | Business owners and employees managing operations | Phase 2 (Planned) |

Routing between experiences is determined by the `role` field inside the JWT payload: `customer`, `admin`, or `staff`.

### Key Product Traits
- **Lazy Authentication** — Users browse freely; login is required only when they attempt to write data (booking, favorites, reviews).
- **Race-Condition Safe** — The backend uses database-level row locking (`FOR UPDATE`). The frontend gracefully handles `409 Conflict` responses.
- **UUID-Based** — Every entity uses `CHAR(36)` UUIDs. No auto-increment IDs anywhere.
- **Soft Deletes** — Core records are never destroyed. Historical data (past appointments referencing deleted services) remains intact.

---

## 2. Architecture Explanation

### 2.1 Core Principle: Extreme Simplicity

The architecture optimizes for **deletion**. Any feature folder should be removable without breaking the rest of the app. We achieve this through:

1. **Feature Isolation** — Each feature owns its API calls, hooks, types, UI, and translations.
2. **Three-Layer Data Pipeline** — `api.ts` → `useFeature.ts` → `Component`. No shortcuts.
3. **No God Files** — No centralized `ApiManager.ts`. No `utils.ts` dumping ground. No `helpers/` folder that grows forever.

### 2.2 The Three Layers

```
┌─────────────────────────────────────────────────────┐
│                    UI Component                      │
│       Receives data via props or hook return.        │
│       ZERO network logic. ZERO business logic.       │
│       Only renders. Only calls callbacks.            │
├─────────────────────────────────────────────────────┤
│                  React Query Hook                    │
│       Calls the api function. Returns:               │
│       { data, isLoading, isError, error }            │
│       Handles caching, retries, stale time.          │
├─────────────────────────────────────────────────────┤
│                    API Function                      │
│       1-2 lines. Calls axios. Returns response.      │
│       No logic. No state. No side effects.           │
└─────────────────────────────────────────────────────┘
```

### 2.3 Why This Works

- **Backend changes** → update `api.ts` → hook and UI remain unchanged.
- **UI redesign** → update component → API and hook remain unchanged.
- **Caching strategy changes** → update hook → API and UI remain unchanged.

Each layer can change independently. This is the **only** abstraction we use, and it earns its keep.

---

## 3. Folder Structure

```
src/
├── app/                          # Expo Router — SCREENS + ROUTING
│   ├── _layout.tsx               # Root layout (providers, theme)
│   ├── index.tsx                 # Entry redirect
│   ├── (onboarding)/             # Onboarding flow routes
│   ├── (customer)/               # Customer tab group
│   │   ├── _layout.tsx           # Bottom tab navigator
│   │   ├── home.tsx              # Screen: composes discover components
│   │   ├── appointments.tsx      # Screen: composes appointment components
│   │   ├── favorites.tsx         # Screen: composes favorite components
│   │   └── profile.tsx           # Screen: composes profile components
│   ├── (admin)/                  # Admin routes (Phase 2)
│   │   └── _layout.tsx
│   ├── business/[id].tsx         # Screen: composes business detail components
│   ├── booking/[id].tsx          # Screen: composes booking flow components
│   └── auth.tsx                  # Screen: composes auth components (modal)
│
├── features/                     # ALL product logic lives here
│   ├── auth/
│   │   ├── api.ts                # login, register, googleLogin
│   │   ├── useAuth.ts            # useMutation for login flows
│   │   ├── types.ts              # LoginPayload, AuthResponse, User
│   │   ├── components/
│   │   │   ├── GoogleSignInButton.tsx
│   │   │   └── PhoneNumberForm.tsx
│   │   └── translations/
│   │       ├── en.ts
│   │       └── ar.ts
│   │
│   ├── discover/
│   │   ├── api.ts                # getNearbyBusinesses, getBusinessDetail
│   │   ├── useDiscover.ts        # useNearbyBusinesses, useBusinessDetail
│   │   ├── types.ts              # Business, BusinessDetail
│   │   ├── components/
│   │   │   ├── BusinessCard.tsx
│   │   │   └── BusinessList.tsx
│   │   └── translations/
│   │
│   ├── services/
│   │   ├── api.ts                # getServices
│   │   ├── useServices.ts        # useServices hook
│   │   ├── types.ts              # Service, Staff, StaffService
│   │   └── components/
│   │       ├── ServiceCard.tsx
│   │       └── StaffPicker.tsx
│   │
│   ├── booking/
│   │   ├── api.ts                # getAvailability, createBooking
│   │   ├── useBooking.ts         # useAvailability, useCreateBooking
│   │   ├── store.ts              # Booking wizard state (multi-step)
│   │   ├── types.ts              # TimeSlot, BookingPayload
│   │   └── components/
│   │       ├── DatePicker.tsx
│   │       ├── TimeSlotGrid.tsx
│   │       └── ConfirmationCard.tsx
│   │
│   ├── appointments/
│   │   ├── api.ts                # getAppointments, cancelAppointment, reschedule
│   │   ├── useAppointments.ts    # useUpcoming, useHistory, useCancel, useReschedule
│   │   ├── types.ts              # Appointment, AppointmentStatus
│   │   └── components/
│   │       └── AppointmentCard.tsx
│   │
│   ├── favorites/
│   │   ├── api.ts                # toggleFavorite, getFavorites
│   │   ├── useFavorites.ts       # useFavorites, useToggleFavorite
│   │   └── components/
│   │
│   ├── reviews/
│   │   ├── api.ts                # addReview
│   │   ├── useReviews.ts         # useAddReview
│   │   ├── types.ts              # Review, ReviewPayload
│   │   └── components/
│   │       └── ReviewForm.tsx
│   │
│   ├── notifications/
│   │   ├── api.ts                # getNotifications, markRead, updateDeviceToken
│   │   ├── useNotifications.ts   # useNotifications, useMarkRead
│   │   ├── types.ts              # Notification
│   │   └── components/
│   │       └── NotificationItem.tsx
│   │
│   ├── profile/
│   │   ├── api.ts                # getProfile, updatePhone
│   │   ├── useProfile.ts         # useProfile, useUpdatePhone
│   │   ├── types.ts              # UserProfile
│   │   └── components/
│   │       └── ProfileHeader.tsx
│   │
│   └── onboarding/
│       ├── components/
│       │   ├── OnboardingSlide.tsx
│       │   └── PermissionsStep.tsx
│       └── translations/
│
├── shared/                       # Truly shared, cross-feature code
│   ├── api/
│   │   └── client.ts             # Axios instance + interceptors
│   ├── components/
│   │   └── ui/                   # Design system primitives
│   │       ├── Button.tsx
│   │       ├── Text.tsx
│   │       ├── Card.tsx
│   │       ├── Skeleton.tsx
│   │       ├── Toast.tsx
│   │       └── EmptyState.tsx
│   ├── hooks/
│   │   ├── useThemeColors.ts
│   │   └── useLocation.ts
│   ├── types/
│   │   └── api.ts                # ApiResponse<T> envelope type
│   ├── constants/
│   │   └── theme.ts              # Colors, spacing, typography tokens
│   └── translations/
│       ├── en.ts                 # Shared strings (buttons, errors)
│       └── ar.ts
│
├── stores/                       # Global-only stores (max 2-3)
│   ├── useAuthStore.ts           # JWT, user session, role
│   └── useSettingsStore.ts       # Language, theme preference
│
└── lib/                          # Pure configuration (no logic)
    └── i18n.ts                   # i18next setup
```

### 3.1 Key Structural Decisions

| Decision | Rationale |
|---|---|
| **Screens live ONLY in `app/`** | Every screen is a route file. Screens import components from features and compose them. No `screens/` folder exists anywhere in `features/`. |
| `features/` exports components, hooks, and API functions — NEVER screens | A feature can be deleted by removing its folder and updating the route file. Nothing else breaks. |
| `shared/` replaces `common/` | Clearer name. Only code used by 3+ features belongs here. |
| `stores/` is top-level, not nested in `providers/` | Global stores are infrastructure, not providers. Max 2-3 files ever. |
| Types live in their feature | No central types file that grows to 500 lines. Each feature owns its types. |

### 3.2 Screen Placement Rule

> **🔒 NON-NEGOTIABLE: Screens belong ONLY to `app/`.**

| Layer | Responsibility |
|---|---|
| `app/` | **Screens + Routing.** Each file IS the screen. It imports components from features, calls hooks, and composes the page layout. |
| `features/` | **Logic + UI Building Blocks.** Exports components, hooks, api functions, types, translations. NEVER exports screens. |

**This rule exists to eliminate decision-making.** There is exactly ONE place where screens live. No exceptions. No `screens/` folder inside any feature. Ever.

**Correct pattern:**
```tsx
// src/app/(customer)/home.tsx — THIS IS THE SCREEN
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNearbyBusinesses } from '@/features/discover/useDiscover';
import { BusinessList } from '@/features/discover/components/BusinessList';
import { Skeleton } from '@/shared/components/ui/Skeleton';

export default function HomeScreen() {
  const { data, isLoading, isError } = useNearbyBusinesses(30.0444, 31.2357);

  if (isLoading) return <Skeleton />;
  if (isError) return <EmptyState message="Could not load shops" />;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BusinessList businesses={data.data} onPress={(id) => router.push(`/business/${id}`)} />
    </SafeAreaView>
  );
}
```

**Why not put screens inside features?**
- It creates ambiguity: "Is the screen in `app/` or `features/`?"
- It couples routing to feature internals.
- It makes `app/` files into pointless 1-line re-exports that add a layer without value.
- It violates the principle: features export building blocks, `app/` assembles them.

---

## 4. Feature System Design

### 4.1 What is a Feature?

A feature is a **self-contained product capability** that maps to one or more backend endpoints. It owns:

- Its network calls (`api.ts`)
- Its data management hooks (`useFeature.ts`)
- Its TypeScript types (`types.ts`)
- Its UI components (`components/`)
- Its translations (`translations/`)
- Optionally, its local state (`store.ts`)

### 4.2 Feature Independence Test

Ask yourself: *"Can I delete this folder and have everything else still compile?"*

If the answer is **no**, you've created a coupling problem. Fix it.

### 4.3 Feature Boundaries

| Feature | Endpoints it consumes | Dependencies on other features |
|---|---|---|
| `auth` | `/auth/google.php`, `/auth/register.php`, `/auth/login.php` | None |
| `discover` | `/businesses.php` | None |
| `services` | `/services.php` | None |
| `booking` | `/availability.php`, `/bookings.php` | Reads from `auth` store (for JWT) |
| `appointments` | `/profile.php`, `/cancel_appointment.php`, `/reschedule.php` | None |
| `favorites` | `/toggle_favorite.php` | None |
| `reviews` | `/add_review.php` | None |
| `notifications` | `/notifications.php`, `/mark_notification_read.php`, `/update_device_token.php` | None |
| `profile` | `/profile.php` | None |

Cross-feature dependencies are handled through:
1. **The auth store** — any feature can read the JWT from `useAuthStore`.
2. **React Query cache** — invalidating another feature's query key is acceptable (e.g., booking success invalidates `['appointments']`).
3. **Navigation** — features can navigate to each other via Expo Router's `router.push()`.

No feature should ever import from another feature's `components/`, `api.ts`, or `useFeature.ts`.

---

## 5. Data Flow (API → Hook → UI)

### 5.1 Complete Example: Fetching Nearby Businesses

**Layer 1 — API Function** (`features/discover/api.ts`)
```typescript
import { apiClient } from '@/shared/api/client';
import type { Business } from './types';
import type { ApiResponse } from '@/shared/types/api';

export const getNearbyBusinesses = (lat: number, lng: number, radiusKm = 5) =>
  apiClient.get<ApiResponse<Business[]>>('/businesses.php', {
    params: { lat, lng, radius_km: radiusKm },
  });
```

**Layer 2 — React Query Hook** (`features/discover/useDiscover.ts`)
```typescript
import { useQuery } from '@tanstack/react-query';
import { getNearbyBusinesses } from './api';

export const useNearbyBusinesses = (lat: number, lng: number) =>
  useQuery({
    queryKey: ['businesses', lat, lng],
    queryFn: () => getNearbyBusinesses(lat, lng),
    staleTime: 5 * 60 * 1000,
  });
```

**Layer 3 — UI Component** (`features/discover/components/BusinessList.tsx`)
```tsx
import { FlatList } from 'react-native';
import { BusinessCard } from './BusinessCard';
import type { Business } from '../types';

type Props = {
  businesses: Business[];
  onPress: (id: string) => void;
};

export function BusinessList({ businesses, onPress }: Props) {
  return (
    <FlatList
      data={businesses}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <BusinessCard business={item} onPress={() => onPress(item.id)} />
      )}
    />
  );
}
```

**Screen (in `app/` — the ONLY place screens exist)**
```tsx
// src/app/(customer)/home.tsx — THIS FILE IS THE SCREEN
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNearbyBusinesses } from '@/features/discover/useDiscover';
import { BusinessList } from '@/features/discover/components/BusinessList';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { data, isLoading, isError } = useNearbyBusinesses(30.0444, 31.2357);

  if (isLoading) return <Skeleton />;
  if (isError) return <EmptyState message="Could not load shops" />;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BusinessList businesses={data.data} onPress={(id) => router.push(`/business/${id}`)} />
    </SafeAreaView>
  );
}
```

> **Note:** The screen function is defined directly in the route file. It is NOT imported from a feature folder. Features provide `BusinessList`, `Skeleton`, and `useNearbyBusinesses` — the screen in `app/` composes them.

### 5.2 Mutation Example: Creating a Booking

```typescript
// features/booking/api.ts
export const createBooking = (payload: BookingPayload) =>
  apiClient.post<ApiResponse<Appointment>>('/bookings.php', payload);

// features/booking/useBooking.ts
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};
```

---

## 6. State Management Strategy

### 6.1 Decision Matrix

| State Type | Tool | Example |
|---|---|---|
| **Server state** (API data) | React Query | Businesses, appointments, availability |
| **Global client state** | Zustand (top-level stores) | Auth session, language, theme |
| **Feature-local client state** | Zustand (feature store) | Booking wizard selections |
| **UI-only state** | React `useState` | Bottom sheet open/closed, input values |

### 6.2 Rules

1. **React Query is the primary state manager.** Most data in this app comes from the server. React Query handles fetching, caching, background refreshing, and garbage collection. Do not duplicate server data into Zustand.

2. **Zustand stores are tiny.** Each store should have fewer than 10 properties. If it's growing larger, you're putting server data where it doesn't belong.

3. **Maximum global stores: 3.**
   - `useAuthStore` — session, user, role, onboarding flag
   - `useSettingsStore` — language, theme
   - *(Maybe)* `useLocationStore` — current coordinates (if needed globally)

4. **Feature stores are optional.** Only create one if you have multi-step wizard state (like the booking flow where the user selects service → staff → date → time across multiple screens).

5. **No store should ever call an API.** Stores hold client-side state. API calls belong in `api.ts` → `useFeature.ts`.

---

## 7. API Handling Rules

### 7.1 The Axios Client (`shared/api/client.ts`)

A single, configured Axios instance that ALL features must use.

```typescript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://api.maweedi.com'; // from env

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// REQUEST: Auto-attach JWT
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE: Unwrap envelope, handle global errors
apiClient.interceptors.response.use(
  (response) => response.data, // Unwrap to { status, data, message }
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Something went wrong';

    if (status === 401) {
      // Clear token, redirect to login
      SecureStore.deleteItemAsync('auth_token');
      // Trigger auth store reset
    }

    // Re-throw with clean message for per-hook handling
    return Promise.reject({ status, message });
  }
);
```

### 7.2 The API Response Envelope

Every backend response follows this shape. We type it once:

```typescript
// shared/types/api.ts
export type ApiResponse<T> = {
  status: 'success' | 'error';
  data: T;
  message: string;
};
```

### 7.3 Rules

1. **Every feature's `api.ts` uses `apiClient`** — never raw `axios` or `fetch`.
2. **API functions are 1-3 lines** — just the HTTP call. No try/catch. No state updates.
3. **Error handling lives in two places only:**
   - **Global** (interceptor): 401 redirects, network errors, generic toasts.
   - **Per-hook** (React Query `onError`): Feature-specific errors like 409 Conflict.
4. **Never pass the JWT manually** — the interceptor handles it.

---

## 8. Error Handling Strategy

### 8.1 Error Layers

```
┌──────────────────────────────────────────────┐
│         Layer 1: Axios Interceptor            │
│   Catches: 401, 500, Network errors          │
│   Action: Global toast, token clearing        │
├──────────────────────────────────────────────┤
│         Layer 2: React Query Hook             │
│   Catches: Feature-specific errors (409, 400) │
│   Action: Feature-specific recovery logic     │
├──────────────────────────────────────────────┤
│         Layer 3: UI Component                 │
│   Reads: isError, error from hook             │
│   Action: Shows error state or retry button   │
└──────────────────────────────────────────────┘
```

### 8.2 Specific Error Handling

| HTTP Status | Meaning | Frontend Action |
|---|---|---|
| `200` / `201` | Success | Proceed normally |
| `400` | Validation error | Show `message` from response near the relevant field |
| `401` | Token expired/invalid | Clear token, redirect to auth flow |
| `404` | Resource not found | Show "Not found" empty state |
| `409` | Conflict (slot taken) | Refresh data, show "Slot taken, pick another" |
| `500` | Server error | Show generic "Something went wrong, try again" |
| Network error | No connection | Show offline banner or retry button |

### 8.3 Rules

- Components never use `try/catch`. They read `isError` from hooks.
- The backend's `message` field is always user-safe. Display it directly.
- Never show raw error objects or stack traces.

---

## 9. Auth Flow

### 9.1 Lazy Authentication Model

```
User opens app
    │
    ▼
Browses freely (no token needed)
    │  GET /businesses.php ✅ (no auth)
    │  GET /services.php ✅ (no auth)
    │  GET /availability.php ✅ (no auth)
    │
    ▼
Attempts protected action (Book, Favorite, Review)
    │
    ▼
App checks: does useAuthStore have a session?
    │
    ├── YES → Proceed with request (JWT in header)
    │
    └── NO → Show Auth Bottom Sheet
              │
              ├── Google Sign-In → sends idToken to backend
              │     POST /auth/google.php { idToken }
              │
              └── Backend validates, returns:
                    {
                      token: "maweedi_jwt",
                      user: { id, name, has_phone, role }
                    }
                    │
                    ├── has_phone: true → Resume action
                    │
                    └── has_phone: false → Show phone input
                          PUT /profile/update_phone.php
                          → Resume action
```

### 9.2 Token Storage

- JWT is stored in `expo-secure-store` (encrypted, not AsyncStorage).
- On app launch, check SecureStore for existing token.
- If token exists, hydrate `useAuthStore` with the decoded user info.
- If token is expired/invalid (401 response), clear and show auth flow.

### 9.3 Auth Store Shape

```typescript
interface AuthState {
  token: string | null;
  user: {
    id: string;
    name: string;
    role: 'customer' | 'admin' | 'staff';
    hasPhone: boolean;
  } | null;
  isAuthenticated: boolean; // computed: token !== null
  setSession: (token: string, user: User) => void;
  clearSession: () => void;
}
```

---

## 10. Role-Based Routing

### 10.1 How It Works

```
App Launch
    │
    ▼
Check token in SecureStore
    │
    ├── No token → Show (customer) layout (guest browsing)
    │
    └── Token exists → Decode JWT → read `role`
          │
          ├── role === 'customer' → (customer) tab layout
          │     Tabs: Home, Appointments, Favorites, Profile
          │
          ├── role === 'admin' → (admin) layout
          │     Tabs: Dashboard, Schedule, Services, Settings
          │
          └── role === 'staff' → (admin) layout (limited)
                Same as admin but with restricted features
```

### 10.2 Implementation

In `app/_layout.tsx`, the root layout reads the role and redirects:

```tsx
const { user } = useAuthStore();
const role = user?.role ?? 'customer';

// Expo Router handles the rest via route groups:
// (customer)/ routes are the default
// (admin)/ routes are only accessible with admin/staff role
```

Guest users (no token) see the customer layout. They can browse everything. They hit the auth wall only when attempting a protected mutation.

---

## 11. Booking Flow (Step-by-Step)

This is the most critical user flow in the entire application.

### Step 1: Discover → Business Profile

```
User sees nearby shops on Home
    │ Data: useNearbyBusinesses(lat, lng)
    │ Endpoint: GET /businesses.php
    │
    ▼
User taps a shop → navigates to /business/[id]
    │ Data: useBusinessDetail(businessId)
    │ Additional: useServices(businessId)
    │ Endpoint: GET /services.php?business_id=xxx
```

### Step 2: Select Service → Pick Staff

```
Business Profile shows services list
    │
    ▼
User taps "Book" on a service
    │ Action: Open Staff Picker Bottom Sheet
    │ Data: Already loaded from useServices (staff are included)
    │
    ▼
Staff Picker filters barbers who offer THIS service
    │ Check: staff.service_ids.includes(selected_service_id)
    │ Option: "Any Available Barber" (staff_id = null)
    │
    ▼
User selects a staff member
    │ Action: Store in booking wizard state:
    │   { businessId, serviceId, staffId }
    │ Navigate to /booking/[businessId]
```

### Step 3: Select Date & Time

```
Booking screen mounts
    │
    ▼
Horizontal week calendar at top
    │ User selects a date (default: today)
    │
    ▼
App fetches available slots
    │ Data: useAvailability(businessId, serviceId, staffId, date)
    │ Endpoint: GET /availability.php?business_id=...&service_id=...&staff_id=...&date=...
    │
    ▼
Time slot grid renders available 30-min blocks
    │ User taps a slot → stored in wizard state
    │
    ▼
"Confirm Booking" button appears
```

### Step 4: Confirm → Auth Check → Submit

```
User taps "Confirm Booking"
    │
    ▼
Is user authenticated?
    │
    ├── NO → Show Auth Bottom Sheet (see Section 9)
    │         After auth → resume booking
    │
    └── YES → Submit booking
              │
              ▼
          Button disabled immediately (prevent double-tap)
              │
              ▼
          POST /bookings.php {
            business_id, service_id, staff_id, start_time
          }
              │
              ├── 201 Success
              │   → Navigate to Success screen
              │   → Invalidate ['appointments'] query
              │
              └── 409 Conflict
                  → Show toast: "Slot was just taken"
                  → Invalidate ['availability'] query (refresh slots)
                  → Re-enable button
```

### Booking Wizard Store

```typescript
// features/booking/store.ts
interface BookingWizardState {
  businessId: string | null;
  serviceId: string | null;
  staffId: string | null;    // null = "Any Barber"
  date: string | null;        // "YYYY-MM-DD"
  startTime: string | null;   // "HH:mm:ss"
  setStep: (partial: Partial<BookingWizardState>) => void;
  reset: () => void;
}
```

This is the **one** feature that legitimately needs a Zustand store because selection spans multiple screens.

---

## 12. Admin Flow (Planned — Phase 2)

### 12.1 Route Group

All admin routes live under `app/(admin)/`. The layout and tabs are separate from the customer experience entirely.

### 12.2 Planned Features

| Feature | Description | Backend Endpoint |
|---|---|---|
| **Dashboard** | Today's appointments, stats | `GET /admin/dashboard.php` |
| **Schedule** | Staff schedule management, day blocking | `GET/PUT /admin/schedules.php` |
| **Appointments** | View, confirm, complete, no-show | `GET/PUT /admin/appointments.php` |
| **Services** | CRUD services and pricing | `GET/POST/PUT /admin/services.php` |
| **Staff** | Manage staff profiles | `GET/POST/PUT /admin/staff.php` |
| **Shop Settings** | Business info, gallery, hours | `PUT /admin/business.php` |

### 12.3 Structure Mirrors Customer

```
features/
  admin-dashboard/
    api.ts
    useAdminDashboard.ts
    types.ts
    components/

  admin-schedule/
    api.ts
    useSchedule.ts
    types.ts
    components/
```

Same pattern. Same three layers. No special admin framework needed.

---

## 13. Scalability Plan

### 13.1 Category Expansion

The `businesses.category` field is an enum: `'barber' | 'salon' | 'dentist' | 'other'`.

**Frontend rule:** Never hardcode "barber" in UI labels or logic. Use the category from the API response to conditionally render labels (e.g., "Barber" vs "Doctor") and icons.

```typescript
// This is fragile:
<Text>Find your barber</Text>

// This is scalable:
<Text>Find your {getCategoryLabel(business.category)}</Text>
```

### 13.2 Feature Addition

Adding a new feature (e.g., "Reviews") requires:

1. Create `features/reviews/` with the standard 4-file pattern.
2. Add a route file in `app/`.
3. Register translations in `lib/i18n.ts`.
4. Done. No other files are touched.

### 13.3 Multi-Language

- i18next with `en` and `ar` (RTL) support.
- Each feature owns its translation files.
- Shared strings (button labels, error messages) live in `shared/translations/`.

### 13.4 Offline Resilience (Future)

React Query's stale-while-revalidate pattern means cached data is shown immediately while fresh data loads in the background. For true offline support later, we can add `persistQueryClient` from React Query without changing any feature code.

---

## 14. Integration with /backend-docs

The `backend-docs/` directory at the project root contains the source of truth for all backend behavior. Every frontend developer and AI agent **must** read these files before building any feature.

| File | What it tells you |
|---|---|
| [database.md](file:///c:/Users/Administrator/Desktop/CutAndGo-1/backend-docs/database.md) | Exact table schemas. Use this to derive TypeScript types. Every enum, every nullable field, every relationship. |
| [openapi.yaml](file:///c:/Users/Administrator/Desktop/CutAndGo-1/backend-docs/openapi.yaml) | Exact request/response shapes for every endpoint. Use this to write `api.ts` functions. |
| [backend.md](file:///c:/Users/Administrator/Desktop/CutAndGo-1/backend-docs/backend.md) | System architecture. Explains what each endpoint does and why. |
| [authentication_guide.md](file:///c:/Users/Administrator/Desktop/CutAndGo-1/backend-docs/authentication_guide.md) | The lazy auth strategy, Google Sign-In flow, phone number catch, JWT format. |
| [frontend_integration_rules.md](file:///c:/Users/Administrator/Desktop/CutAndGo-1/backend-docs/frontend_integration_rules.md) | The 3-step fetching pipeline, Axios interceptors, race condition handling. |
| [frontend_project_brief.md](file:///c:/Users/Administrator/Desktop/CutAndGo-1/backend-docs/frontend_project_brief.md) | Product requirements. Customer flow, admin capabilities, extensibility notes. |
| [frontend_ux_guide.md](file:///c:/Users/Administrator/Desktop/CutAndGo-1/backend-docs/frontend_ux_guide.md) | Step-by-step booking UX. Bottom sheet patterns, screen transitions. |
| [coding_standards.md](file:///c:/Users/Administrator/Desktop/CutAndGo-1/backend-docs/coding_standards.md) | Backend coding patterns. Useful for understanding what the API guarantees. |
| [architecture_guidelines.md](file:///c:/Users/Administrator/Desktop/CutAndGo-1/backend-docs/architecture_guidelines.md) | Backend philosophy: zero-framework, soft deletes, race condition protection. |

### Deriving Types from Database Schema

Always derive frontend types from `database.md`, not from guessing:

```typescript
// From database.md: status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show')
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

// From database.md: category ENUM('barber', 'salon', 'dentist', 'other')
export type BusinessCategory = 'barber' | 'salon' | 'dentist' | 'other';

// From database.md: rating INT CHECK (rating BETWEEN 1 AND 5)
export type Rating = 1 | 2 | 3 | 4 | 5;
```

---

## Appendix A: Tech Stack Summary

| Layer | Technology | Version |
|---|---|---|
| Framework | Expo | SDK 54 |
| Routing | Expo Router | 6.x |
| Language | TypeScript | 5.9 |
| Server State | TanStack React Query | 5.x |
| Client State | Zustand | 5.x |
| HTTP | Axios | 1.x |
| Translations | i18next + react-i18next | 25.x |
| Secure Storage | expo-secure-store | 15.x |
| Auth Provider | @react-native-google-signin | 16.x |
| Animations | react-native-reanimated | 4.x |
| Images | expo-image | 3.x |

## Appendix B: API Endpoint Map

| Endpoint | Method | Auth Required | Feature |
|---|---|---|---|
| `/auth/register.php` | POST | ❌ | auth |
| `/auth/login.php` | POST | ❌ | auth |
| `/auth/google.php` | POST | ❌ | auth |
| `/businesses.php` | GET | ❌ | discover |
| `/services.php` | GET | ❌ | services |
| `/availability.php` | GET | ❌ | booking |
| `/bookings.php` | POST | ✅ | booking |
| `/cancel_appointment.php` | POST | ✅ | appointments |
| `/reschedule_appointment.php` | POST | ✅ | appointments |
| `/profile.php` | GET | ✅ | profile |
| `/toggle_favorite.php` | POST | ✅ | favorites |
| `/add_review.php` | POST | ✅ | reviews |
| `/notifications.php` | GET | ✅ | notifications |
| `/mark_notification_read.php` | POST | ✅ | notifications |
| `/update_device_token.php` | POST | ✅ | notifications |

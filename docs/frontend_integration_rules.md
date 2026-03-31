# Maweedi Frontend Integration Guide 
**(React Native / React / Next.js / Flutter Architecture)**

**Document Purpose:**
This guide dictates the strict architectural rules for the Frontend UI teams. The backend is built purely for high-concurrency, separation, and stateless processing. The frontend must mirror this logic to ensure a stable, beautiful, and fault-tolerant application.

---

## 1. How to Map the Backend to the Frontend 

The backend uses a strict **Feature-Based Architecture**. Your frontend directory should map visually to the backend endpoints.

### Directory Structure Example (React Query + Axios)
Do not build monolithic `ApiManager.ts` files that are 3,000 lines long. Group them strictly by feature:
```text
src/
 ┣ features/
 ┃ ┣ auth/
 ┃ ┃ ┣ api/auth.api.ts         (The raw Axios calls)
 ┃ ┃ ┣ hooks/useLogin.ts       (The React Query Mutation)
 ┃ ┃ ┗ components/LoginForm.tsx
 ┃ ┃
 ┃ ┣ bookings/
 ┃ ┃ ┣ api/bookings.api.ts     (Calls /api/bookings.php, /api/cancel_appointment.php)
 ┃ ┃ ┣ hooks/useBookAppointment.ts 
 ┃ ┃ ┗ ...
 ┃ ┃
 ┃ ┣ discover/
 ┃ ┃ ┣ api/businesses.api.ts   (Calls /api/businesses.php)
 ┃ ┃ ┣ hooks/useNearbyShops.ts 
```

---

## 2. API Communication Layer (Axios Interceptors)

**DO NOT duplicate error handling in every file.** The backend strictly responds using the `sendResponse()` formatter.

Every response you ever receive will look like this:
```json
{
    "status": "success", // or "error"
    "data": { ... },     // or null
    "message": "Message here."
}
```

### The Global Axios Instance (The "Clean" Core)
You must set up a SINGLE Axios instance where your interceptors handle the heavy lifting.

**Request Interceptor (Injecting Identity):**
* Right before the request leaves, the interceptor must check local storage for the JWT token.
* If it exists, blindly attach it: `config.headers.Authorization = 'Bearer {token}'`.
* Doing this means your feature hooks never have to think about authentication manually.

**Response Interceptor (Global Error Handling):**
* **401 Unauthorized:** The token expired. The interceptor should immediately clear the token from storage and forcefully redirect the user to the Login screen.
* **Network / 500 Errors:** Read the payload's `"message"`. Throw a clean toast/snackbar globally showing `response.data.message`.
* **The Benefit:** If `bookings.php` fails because the slot was taken (409 Conflict), the UI automatically toasts "This time slot was just taken. Please choose another." without you having to write `if (error)` a thousand times in your UI components.

---

## 3. The 3-Step Fetching Pipeline

To guarantee separation of concerns on the frontend, exactly 3 layers must exist for every network action.

### Layer 1: The Raw Method (`api/businesses.api.ts`)
This file does nothing but execute the URL. 1 or 2 lines maximum.
```typescript
export const getNearbyShops = async (lat: number, lng: number) => {
    // Axios instance automatically strips out response.data for you 
    return await apiClient.get('/api/businesses.php', { params: { lat, lng } });
};
```

### Layer 2: The React Query Hook (`hooks/useNearbyShops.ts`)
This is where caching, retry-logic, and background refetching happens.
* Use `useQuery` for GET requests.
* Use `useMutation` for POST/PUT (like booking or cancelling).
```typescript
import { useQuery } from '@tanstack/react-query';
import { getNearbyShops } from '../api/businesses.api';

export const useNearbyShops = (lat: number, lng: number) => {
    return useQuery({
        queryKey: ['shops', lat, lng], // Automatic caching based on coordinate changes!
        queryFn: () => getNearbyShops(lat, lng),
        staleTime: 1000 * 60 * 5, // Don't refetch if coordinates haven't changed for 5 mins
    });
};
```

### Layer 3: The UI Component (`screens/Home.tsx`)
The UI is "dumb". It just blindly obeys the hook's state. There is ZERO Axios logic here.
```tsx
import { useNearbyShops } from '../features/discover/hooks/useNearbyShops';

const HomeScreen = ({ userLat, userLng }) => {
    const { data, isLoading, isError } = useNearbyShops(userLat, userLng);

    if (isLoading) return <Spinner />;
    if (isError) return <Text>Could not load shops. Pull to refresh.</Text>;

    return (
        <FlatList 
            data={data.items} 
            renderItem={({ item }) => <ShopCard shop={item} />} 
        />
    );
};
```

---

## 4. Understanding & Supplying the Backend

### Connecting the AI / Frontend Developer to the Backend logic:
To let the frontend developer accurately consume the APIs, give them these 3 things:

1. **The Database Diagram or `docs/database.md`**
   * *Why:* So they know exactly the Typescript Types / Interfaces they need to generate. (e.g., they will know `appointment.status` can confidently only be enum types `pending | confirmed | completed | cancelled | no_show`).
2. **The Output Formatter Knowledge**
   * Explain the strict `{ status, data, message }` JSON envelope.
3. **The Swagger / OpenAPI Specs or Postman Collection**
   * Provide the exact payload shapes (e.g., `bookings.php` demands strictly `{ business_id, service_id, start_time, staff_id }`). 

### Handling the "Race Condition" UI Expectation
Because the backend aggressively protects against race conditions (two people booking the same target), the frontend UI must dynamically degrade gracefully.
* Upon calling `useBookAppointment` mutation, **disable the button**.
* If it returns **Status 409 (Conflict)** because someone beat them to it, the app must gracefully refresh the `useAvailability` query block to immediately wipe the taken time slot off the screen so the user can choose the next available time.

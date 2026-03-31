# Maweedi Project Brief (For Frontend Developers)

## 1. The Core Vision

**Maweedi** is an ultra-fast, high-concurrency booking and appointment platform designed primarily for barbershops, salons, and eventually other service-based businesses (dentists, clinics).

The application is split into two primary experiences within a single architectural ecosystem:

1. **The Customer App:** Where end-users discover local shops, view services, check availability, and book appointments.
2. **The Admin / Staff App:** Where business owners and employees manage their schedules, view incoming appointments, update business details, and manage services.

We determine exactly which experience the user gets based entirely on their **JWT Role (`customer` vs `admin`/`staff`)** upon successfully logging in.

## 2. Core Frontend Architecture (Strict Rules)

The highest priority for this project is **Simplicity, Modularity, Stability, and Separation**. The frontend must be infinitely scalable without ever turning into "spaghetti code."

### Rule 1: Feature-Based Structure
You must organize code completely by the feature it belongs to, **never** by file type (i.e., do not put all API calls in one giant global `api/` folder).

Every single feature (e.g., `bookings/`, `auth/`, `discover/`) should be fully self-contained. If we decide to delete the "reviews" feature tomorrow, we should be able to delete the `features/reviews/` folder and the app should compile perfectly.

### Rule 2: The "Dumb UI" File Makeup
Every feature folder you build will fundamentally follow this exact 4-file pattern:

1. **`api.ts`:** This file executes the raw Axios network request. It should never be more than 1 or 2 lines per method. 
2. **`use[Feature].ts` (The Hook):** A React Query hook (or similar state manager) that calls the `api.ts` file, handles the caching, retries, and captures the `isLoading` / `isError` variables.
3. **`store.ts` (If Needed):** A tiny Zustand/Zustand-like store *only* if this feature requires complex cross-screen global state (like holding onto selected options during a multi-step checkout).
4. **`components/`:** The UI files. **These must be completely "Dumb".** They contain ZERO Axios logic and ZERO complex business logic. They simply read variables from the Hook and render visual JSX.

By forcing this exact separation: The backend can change entirely -> `api.ts` shifts a URL -> The UI never even notices the change occurred.

---

## 3. Global Philosophy & API Constraints

We have completely avoided bloated framework abstractions on the backend. It is pure, raw **PHP 8.x + MariaDB**.

For the frontend team, this means:

- **The API is highly predictable:** No "magic" GraphQL wrappers, just pure REST endpoints.
- **The responses are permanently standardized:** Every single endpoint will _always_ respond with the exact same JSON shape: `{ "status": "success|error", "data": {}, "message": "string" }`.
- **Zero Trust Policy:** The backend natively assumes the frontend might pass bad data. Form validation is critical on the UI, but the backend will safely reject incorrect shapes without crashing.

## 4. The Customer Experience (Phase 1)

Here is the exact macro-flow the customer will experience:

### A. "Lazy" Onboarding

Users should ideally open the app directly to a "Home Screen" without being walled by a strict Login requirement. They should be able to:

- View nearby barbershops (Backend calculates distance using geolocation coordinates).
- Tap a shop to view its gallery, star rating, and description.
- View the "Menu" of services (e.g., Fade, Beard Trim) and select a Barber.
- See available 30-minute time slots.
- **Only when they click "Confirm Booking" do we hit them with Google Sign-In or standard Email/Password Auth.**

### B. The Booking Engine & Race Conditions (Crucial)

Maweedi is designed for high concurrency. If three users try to click 2:00 PM for the exact same barber at the exact same millisecond, the backend handles this via strict `ACID Transactions` and Database Row Locking.

- **Frontend Requirement:** When a user clicks "Book", you must temporarily lock/disable the UI button to prevent multi-taps. If the backend returns a `409 Conflict` (meaning someone else beat them to the slot), the UI must instantly catch this error, gracefully refresh the available time slots, and prompt the user: _"This slot was just taken, please choose another."_

### C. Post-Booking Lifecycle

- **Dashboards:** Users have a profile where they can view "Upcoming", "History", and "Favorites".
- **Modifications:** They can cancel or reschedule appointments. Rescheduling requires re-validating the slot just like a new booking.
- **Push Notifications:** The backend handles push logs. (e.g., an instant confirmation push, and an automated 1-hour cron job reminder push before their appointment). The frontend is responsible for passing the Firebase `fcm_token` up to the server.

## 5. The Admin / Staff Experience (Phase 2 - Upcoming)

When a user logs in, the `role` in the JWT payload will dictate their routing. If they are `admin` or `staff`, the app should route them to a completely different UI Dashboard.

### Expected Admin Capabilities:

- **Schedule Control:** Blocking off vacation days, sickness breaks, or custom operating hours.
- **Real-time Queue:** Viewing a calendar feed of who is coming in today and marking appointments as `completed` or `no_show`.
- **Menu Management:** Adding new services or adjusting prices dynamically.
- **Shop Setup:** Uploading JSON arrays of gallery images via Cloudinary (or similar) into the database.

## 5. Extensibility & Future Scaling

Because the system uses `CHAR(36) UUIDs` instead of standard auto-increment IDs, the data is entirely partitionable.

- **Database scale:** We can easily scale horizontally in the future without primary key collisions.
- **Categories:** The `businesses` table already has `ENUM('barber', 'salon', 'dentist', 'other')`. While we are building strictly for barbers right now, the UI should be built component-based so we can easily swap a "Haircut" card for a "Teeth Whitening" card later.
- **Soft Deletes:** Nothing is truly destroyed. If an admin deletes a service, it just gets `deleted_at = NOW()`. The frontend should be aware that historical data (past appointments) might reference services that are technically "deleted", but still mathematically exist for receipt purposes.

---


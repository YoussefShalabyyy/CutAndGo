# Maweedi Backend Architecture & Developer Guide

**Document Purpose:**
This document serves as the master blueprint for the Maweedi backend. It is designed to be read by **Project Managers, Team Leaders, new Developers, and AI Agents** to understand the system's core philosophy, current state, and the strict rules for adding future features.

As the project grows, this file must be updated to reflect new features and endpoints.

---

## 1. Project Philosophy & Architecture

Maweedi is built to be an extremely high-concurrency booking platform specifically starting with Barbershops, with future extensibility in mind.

### Why Pure PHP? (Zero Framework Bloat)

We purposefully avoided heavy frameworks (like Laravel, Symfony, or CodeIgniter).

- **Ultimate Speed:** Requests do not go through 50 layers of middleware. It is pure hardware-to-logic execution.
- **True Separation of Concerns:** Every endpoint is an isolated file. If you edit `reviews.php`, it is physically impossible to accidentally break `bookings.php`.
- **Absolute Transparency:** What you see is exactly what the server executes. No ORM "magic" making invisible heavy SQL queries.
- **Future-Proof & AI-Friendly:** Future AI code generators will not hallucinate framework-specific syntax. They just write pure, standardized PHP logic and SQL.

### Core Pillars

1. **Stateless RESTful JSON:** All endpoints talk strictly in JSON using the `sendResponse()` helper.
2. **ACID Transactions:** Financial and temporal integrity is guaranteed at the database engine level (MariaDB/MySQL) using strict row-level locking.
3. **UUIDs Only:** All tables use `CHAR(36)` UUIDs to allow offline merging and horizontal scaling later.
4. **Soft Deletes:** Historical analytics are safe. Records are never `DELETED`, they are flagged with `deleted_at`.

---

## 2. The Current System (Core Endpoints)

The `/api/` directory currently handles the **Client App Flow**:

| File               | Purpose                                                     | Key Technical Feature                                                                                                                                                              |
| ------------------ | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `businesses.php`   | Locates barbershops within a radius (default 5km).          | Uses the mathematical **Haversine formula** directly inside SQL to sort by distance instantly without PHP-side loops.                                                              |
| `services.php`     | Fetches the available haircuts/prices & barbers for a shop. | Decouples the "Who" and "What" so users can pick combinations.                                                                                                                     |
| `availability.php` | The "Brain". Generates 30-min available time blocks.        | Dynamically checks `staff_schedules`, subtracts duration times, and checks existing `appointments` to prevent overlaps.                                                            |
| `bookings.php`     | Creates the appointment.                                    | **Anti-Race Condition:** Uses `START TRANSACTION` and `FOR UPDATE` read locks. Also natively pushes an FCM notification upon success. |
| `cancel_appointment.php` / `reschedule.php` | Modifies existing appointments. | Enforces ownership parsing the JWT. Prevents modifications of already completed/cancelled appointments. Automatically logs changes to `appointment_logs`. |
| `profile.php`      | Fetches User History.                                       | Simple joins to categorize past, upcoming, and favorite locations.                                                                                                                 |
| `toggle_favorite.php` | Adds/Removes shops from profile. | Built uniquely as an idempotent toggle saving frontend logic constraints. |
| `add_review.php` | Allows users to rate shops 1-5 stars. | Strict barrier: Only works if the targeted appointment is in a `completed` status. Auto-calculates `rating_avg` on the shop row in the same transaction. |
| `auth/...` | Contains `register.php`, `login.php`, `google.php`. | Pure PHP JWT execution. "Lazy Authentication" design via Google ID tokens. Zero Composer dependencies. |
| `notifications/...` | Contains `notifications.php`, `mark_read.php`, `update_device_token.php`. | Internal "Bell Icon" inbox state management tied directly to users. |

### Background Processes & Crons
- `cron/appointment_reminders.php`: An automated script designed to run every 5 minutes. It aggressively queries upcoming appointments `status = 'pending' | 'confirmed'` matching exactly a 1-hour runway and dispatches cURL requests directly to Firebase to wake up user mobile screens.

---

## 3. Guide to Adding Features (How to keep it Clean)

The most important rule of this backend is **Modularity**. When adding features, do not cram everything into one file. Follow the patterns below.

### Feature 1: Authentication (JWT or Tokens)

When you are ready to add User/Barber Logins:

1. **Do not modify existing API files** (unless an endpoint specifically needs the user's ID).
2. Create `includes/auth_check.php`.
3. In `auth_check.php`, read the `Authorization: Bearer <token>` header. Verify it. On failure, immediately `sendResponse(false, null, 'Unauthorized', 401)`.
4. In endpoints that require login (like `bookings.php`), just add `require_once __DIR__ . '/../includes/auth_check.php';` at the top.
   _Result: Authentication is completely decoupled from booking logic._

### Feature 2: Salon Admin Dashboard (Web Panel)

When building the web panel for the Salon Owner to add barbers and change prices:

1. **Do not use the client `/api/` folder.**
2. Create a new directory: `/api/admin/`.
3. Create isolated endpoints like `/api/admin/add_staff.php` and `/api/admin/update_schedule.php`.
   _Result: If the Admin API goes down or is heavily modified, the Mobile App for end-users remains 100% unaffected._

### Feature 3: Notifications & Reminders

When implementing SMS or Push Notifications:

1. Create a decoupled helper file: `/includes/notifier.php`.
2. Do not let sending an SMS block the response of a booking.
3. _Approach A:_ Use the `appointment_logs` table. Have a background CRON job read the logs and send out SMS for new "created" logs.
4. _Approach B:_ Fire an async cURL or use a background queuing service inside `notifier.php`.
   _Result: The booking endpoint remains lightning fast and doesn't crash if the SMS gateway is offline._

### Feature 4: Cancelling & Rescheduling

When you need to allow users to cancel or change appointments:

1. Create `api/cancel_appointment.php` and `api/reschedule_appointment.php`.
2. Both endpoints must verify ownership using the `user_id`.
3. Cancelling directly sets `status = 'cancelled'`. 
4. Rescheduling recalculates the service time against the new `start_time`, wraps it in a `$pdo->beginTransaction()`, locks the `staff` row, and ensures the new time block does not collide with *other* non-cancelled appointments.
5. Always insert an audit record into `appointment_logs` (e.g., `'user_cancelled'` or `'rescheduled'`) within the same transaction to maintain an unalterable history of state changes.

---

## 4. Instructions for AI Agents

If you are an AI tasked with modifying this codebase, you must adhere to these rules:

- **Never change `config/db.php` emulate prepares to True.** We rely on true prepared statements.
- **Never emit raw HTML/Text.** All outputs must go through `sendResponse($success, $data, $message, $http_code)` from `includes/functions.php`.
- **Always Validate.** Never trust `$_GET` or `file_get_contents('php://input')`.
- **Protect Concurrency.** If editing financial or booking states, always wrap in `$pdo->beginTransaction()` and use `FOR UPDATE` row locks before making changes. Rollback on exception.

# Maweedi Architecture & Scalability Guidelines

**Document Purpose:**
This is the required reading file for anyone (or any AI) making structural changes to the Maweedi ecosystem. This guide ensures the application remains predictable, modular, and permanently immune to scaling breaking-points.

## 1. The "Zero Framework" Philosophy
By not using a framework, you gain immense speed, but you lose framework guardrails. Therefore, you must strictly implement your own discipline:
* **No Composer Dependencies by Default:** If a feature can be written natively in PHP in under 100 lines (e.g., `JwtUtils`), build it yourself. Less dependencies means fewer security vulnerabilities and zero bloat.
* **Controller as the Route:** Because there is no central router, the file path *is* the API route (`api/bookings.php`). If a file gets larger than 250 lines, you are doing too much in one file. Split the logic.

## 2. Directory Separation Rules
Never mix concerns across directories:
* `/api/`: strictly for standard, generic, logged-in Customer Endpoints.
* `/api/auth/`: Only handles the generation of identity (JWT). 
* `/api/admin/` (Upcoming): Strictly endpoints that expect the JWT payload to contain a `role` of `admin` or `staff`. 
* `/includes/`: The "Engine Room". Things that `return` data but never `echo` directly (e.g., `notifier.php`, `auth_check.php`, `jwt_utils.php`). 
* `/cron/`: Asynchronous scripts that execute heavily delayed logic. NEVER put sleep() or heavy blocking loops inside an `/api/` HTTP endpoint.

## 3. Defense Against Race Conditions
Maweedi is a booking app. That means 5 people might try to book the exact same 2:00 PM slot with "Ahmed the Barber" at the exact same millisecond. 
**Rule:** When creating, moving, or claiming a constrained resource:
1. `pdo->beginTransaction();`
2. Run a `SELECT ... FOR UPDATE` on the parent row (Usually the `staff` table row) to "Pause" the database exactly on that Barber.
3. Check availability to ensure the slot isn't already taken by the previous millisecond's successful transaction.
4. INSERT the appointment.
5. `pdo->commit();`

## 4. Scalable Authentication
We use **Stateless Identity** via our custom pure-PHP JWT.
* The system must *never* rely on `$_SESSION`.
* If an endpoint needs a user, it must execute `$user = authenticate();` from `includes/auth_check.php`.
* Doing this guarantees that whether the user is arriving from a Web Browser, an iOS app, an Android app, or Postman, the server behaves identically and doesn't struggle to remember who they are.

## 5. Non-Destructive Databases (Soft Deletes)
Never write `DELETE FROM table WHERE ...` for core entities (Users, Bookings, Shops, Services).
* Instead, write `UPDATE table SET deleted_at = NOW()`.
* **Why?** Data holds value. If a user deletes their account, the barbershop shouldn't suddenly lose 3 years of financial reporting data because the user row vanished and cascaded the deletions. 
* *Exception:* Minor reversible entities like `favorites` or simple `notifications` can be safely hard-deleted to save storage.

## 6. Adding Future Services (SMS, Emails, Payments)
If you decide to add Stripe, Apple Pay, Twilio, etc.:
* Treat them as **Side-Effects**, not Main-Effects.
* The primary goal of an endpoint is to read/write to the Database. Everything else is secondary.
* For example: If you add an SMS `Twilio::send()` function to `bookings.php`, place it *after* `$pdo->commit();`. If the Twilio API crashes, the barbershop must still successfully get the booking in their database. Do not let 3rd party crashes take down your core booking pipeline.
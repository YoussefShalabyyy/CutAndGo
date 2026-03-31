# Authentication Architecture & Google Sign-In Flow

This document details the modular authentication flow for "Maweedi", focusing on late-authentication (Lazy Auth), Google Sign-In integration, and token management via pure PHP.

## 1. The Strategy: "Lazy Authentication"
We want users to experience the "Aha!" moment of the app (seeing barbers, selecting a service, viewing availability) *before* hitting an auth wall. 
Authentication only triggers when writing data (Booking) or viewing personal data (Profile/Saved).

### Extensibility: Supporting Both Google Sign-In & Regular Email/Password
This architecture natively supports adding standard Email/Password authentication later because **the core identity pivot is the Email Address.**

Whether a user signs up via Google today, or via a classic registration form tomorrow, the flow funnels into the exact same outcome:
- If `email` does not exist: Create User (UUID, Email, Name) -> Issue JWT.
- If `email` exists: Verify identity -> Issue JWT.

*If you add standard login later:* You simply add `api/auth/register_email.php`. It will hash a password (saving it in an optional `password_hash` column we can add to `users`), and return the exact same JWT format the Google route does. The frontend handles both transparently.

### Frontend Flow:
1. **Browse (Guest):** The API endpoints `businesses.php`, `services.php`, and `availability.php` **do not** require authentication headers. Anybody can call them. 
2. **Action Trigger (Booking or Profile tab):** 
   - User clicks standard "Confirm Booking".
   - App checks local state `isLoggedIn == false`.
   - App pops up an elegant Bottom Sheet: *"Sign in to secure your reservation"* with a big `[Continue with Google]` button.
3. **The Data Gap:** Google's OAuth response returns `email`, `name`, and `photo`. It **rarely** returns a phone number. Since a Barber needs a phone number to call a no-show, we need a 2-step registration for first-time users.

---

## 2. The Backend Login Sequence

We will create a single, clean endpoint: `POST /api/auth/google_login.php`.

### Step 1: Frontend sends the `idToken`
The frontend successfully completes the Google Sign in and receives the `idToken`. It immediately sends this token to our backend.
```json
{
  "idToken": "eyJhbGciOiJ..."
}
```

### Step 2: Backend Validates the Token (Security)
*Crucial Security Note:* We **never** trust the JSON `{ "email": "me@gmail" }` sent by the frontend because a hacker could send an arbitrary email to log in as someone else. We only trust the securely signed Google `idToken`. 
1. Our PHP backend will take that `idToken` and safely verify its RSA signature using the Google API Client library (or simply hitting Google's public `tokeninfo` endpoint).
2. Once Google says "Yes, this token belongs to Youssef", we reliably extract the `email` and `sub` (Google ID).

### Step 3: Upsert (Update or Insert) User
1. Backend queries the database: `SELECT id, phone FROM users WHERE email = :email`.
2. **If NOT exists (New User):**
   - We generate a new UUID.
   - We `INSERT INTO users (id, full_name, email, phone) VALUES (?, ?, ?, NULL)`. Note that phone is NULL.
3. **If exists (Returning User):**
   - We proceed to step 4.

### Step 4: Issue the Maweedi JWT (JSON Web Token)
We don't keep passing the Google Token around. The backend generates its own native JWT (or a cryptographically secure session token) that represents the user.
```json
{
  "success": true,
  "data": {
    "token": "maweedi_jwt_token_here",
    "user": {
      "id": "usr-1111...",
      "name": "Youssef Shalaby",
      "has_phone": false
    }
  }
}
```

---

## 3. The Phone Number "Catch" (The Missing Piece)

Because `has_phone` is `false` in the login response, the frontend knows what to do:
1. The Google Sign-In sheet morphs into a smooth "Add your phone number" input field.
2. User types `01001234567` and hits Save.
3. Frontend calls `PUT /api/profile/update_phone.php` (passing the new JWT in the header).
4. Backend updates the database.
5. The App resumes the Booking Flow and calls `POST /api/bookings.php`.

### Why this is a great UX:
- Returning users tap Google -> Done. App proceeds to book.
- New users tap Google -> App asks for Phone -> Done. App proceeds to book.
- They are never redirected to a boring "Sign Up" page. It all happens right over the Booking screen.

---

## 4. Protecting Endpoints (The API Middleware)

To maintain our modular architecture, we won't clutter `bookings.php` with token logic. 

We will create `includes/auth_check.php`:
```php
<?php
// includes/auth_check.php
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';

if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    sendResponse(false, null, 'Unauthorized - Missing Token', 401);
}

$jwt = $matches[1];
$user_id = validateMaweediToken($jwt); // Decodes the JWT, verifies the signature

if (!$user_id) {
    sendResponse(false, null, 'Unauthorized - Invalid Token', 401);
}

// If we reach here, the token is valid! 
// $user_id is now safely available to whichever script required this file.
?>
```

In `api/bookings.php`, the literal first 3 lines of code will just be:
```php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth_check.php'; // <-- Locks the endpoint
```
If there is no token, the script dies instantly at `auth_check.php` and returns `401 Unauthorized`. The core booking logic remains completely clean and isolated.
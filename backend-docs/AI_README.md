# Maweedi Backend - AI Instructions & Architecture Context

**ATTENTION ANY AI AGENT READING THIS:**
This file contains the core architectural, philosophical, and structural context for the "Maweedi" backend project. Read this completely before making modifications to the codebase.

## 1. Project Philosophy

- **Lightweight & Pure:** Pure PHP 8.x + MariaDB. NO heavy frameworks (like Laravel or Symfony).
- **Stateless RESTful API:** Clean JSON inputs and outputs.
- **Transactions & Concurrency:** Booking operations strictly use `PDO` transactions with `FOR UPDATE` row-level locks on the `staff` table to prevent race conditions.
- **Soft Deletes:** Deletions use the `deleted_at` timestamp. Queries filter with `deleted_at IS NULL`.
- **Unique Identifiers:** The application strictly uses UUIDs (`CHAR(36)`) for all Primary/Foreign keys.
- **Predictable Output:** Every API endpoint must return a standard JSON envelope using the `sendResponse($success, $data, $message, $statusCode)` function.

## 2. Directory Structure

```
/maweedi-backend
├── /config
│   └── db.php           # PDO connection (ATTR_EMULATE_PREPARES = false)
├── /includes
│   ├── functions.php    # JSON standard output (sendResponse) // future helpers here
├── /api                 # Specific logical endpoints
│   ├── businesses.php   # Haversine distance calculations
│   ├── services.php     # Fetches staff and services relation
│   ├── availability.php # Core availability slot generation logic
│   ├── bookings.php     # High-concurrency transactional booking inserts
│   ├── profile.php      # User history & favorites
├── /tests
│   └── run_tests.php    # Self-contained CLI integration/concurrency test runner
├── /docs                # OpenAPI / Postman specifications
└── .htaccess            # CORS configuration and security headers
```

## 3. Extending the Codebase (AI Instructions)

If asked to add a new endpoint or feature:

1. **Adding an Endpoint:** Create a new file in `/api/` (e.g., `api/reviews.php`).
2. **Include Standard Files:** Always require `config/db.php` and `includes/functions.php`.
3. **Handle Errors:** Wrap logic in a `try/catch (PDOException)` block. Return HTTP 500 via `sendResponse()` on failure and log the error safely.
4. **Validations:** Validate inputs vigorously at the top of the file before hitting the database.
5. **Separation of Concerns:** Keep raw logical configuration isolated. Do not embed giant HTML/XML strings; we only return typed JSON arrays.

## 4. Key Mechanisms

- **Haversine Formula:** Found in `api/businesses.php` to calculate radial distance on-the-fly. Ensure unique PDO bindings (e.g., `:lat`, `:lat2`) when math operators demand variables more than once, as emulated prepares are OFF.
- **Squeeze & Availability Engine:** Found in `api/availability.php`. Takes buffer times, duration limits, and business/staff opening hours to accurately plot free non-overlapping blocks.
- **Race Condition Prevention:** The `api/bookings.php` locks the staff member using `SELECT id FROM staff WHERE id = :staff_id FOR UPDATE` ensuring atomic isolation.

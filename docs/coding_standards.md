# PHP Coding Standards & Implementation Guidelines

**Document Purpose:**
This document defines the strict, structural rules for exactly *how* a PHP file must be coded in the Maweedi backend. Any future developer or AI making edits must follow these specific implementation patterns.

---

## 1. File Structure & Header Requirements

Every endpoint file must look mechanically identical. This ensures predictability.

**The Golden Template for an Endpoint:**
```php
<?php
// 1. Strict Requirements
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/functions.php';

// 1.5 Authentication (If required)
require_once __DIR__ . '/../includes/auth_check.php';
$user = authenticate();
$user_id = $user['user_id'];

// 2. Enforce HTTP Method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { // Or 'GET'
    sendResponse(false, null, 'Only POST requests are accepted.', 405);
}

// 3. Payload Extraction (for POST/PUT)
$input = json_decode(file_get_contents('php://input'), true);

// 4. Mandatory Field Validation
$field_name = $input['field_name'] ?? null;
if (!$field_name) {
    sendResponse(false, null, 'Missing required fields (field_name).', 400);
}

// 5. Try/Catch Block for ALL Logic
try {
    // DB Logic here...
    
    sendResponse(true, $data, 'Success message.', 200);
} catch (PDOException $e) {
    // 6. DB Error handling
    error_log("DB Error in filename.php: " . $e->getMessage());
    sendResponse(false, null, 'Safe user-facing error message.', 500);
}
```

---

## 2. Database Interactions (PDO Strict Rules)

We use raw PDO. Never use risky concatenations. 

### Rule 2A: Never Inject Variables into SQL
**Fatal Error:**
`$pdo->query("SELECT * FROM users WHERE id = $user_id");` // Instantly creates a SQL Injection vulnerability.

**Correct Pattern:**
```php
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id");
$stmt->execute(['id' => $user_id]);
```

### Rule 2B: Use Appropriate Fetch Modes
* Returning **one row**? Use `$stmt->fetch(PDO::FETCH_ASSOC);` (Reduces memory footprint).
* Returning **many rows**? Use `$stmt->fetchAll(PDO::FETCH_ASSOC);`.
* Returning **a count/single column**? Use `$stmt->fetchColumn();`.

### Rule 2C: Database Transactions
If you are doing more than one `INSERT/UPDATE/DELETE`, or interacting with bookings/financials, it must be wrapped in a transaction.
```php
try {
    $pdo->beginTransaction();
    
    // logic...
    
    $pdo->commit();
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log(...)
    sendResponse(...)
}
```

---

## 3. Dealing with UUIDs and JSON

### Inserting Data
Since we use `CHAR(36)` for IDs instead of physical database auto-increments, you must strictly generate a proper, standard v4 UUID in PHP if inserting a new primary entity (like a booking or a log). Alternatively, mapping MySQL's `UUID()` trigger is acceptable.

**PHP Implementation of a UUID trigger:**
```php
$id = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x', mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000, mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff));
```

### Handling JSON Data (e.g., Image Galleries)
When passing data out to the frontend, never leave JSON fields as raw strings. Evaluate them locally so the mobile app gets a native array object.
```php
// If reading from DB:
$gallery_array = json_decode($record['gallery'], true);
```

---

## 4. API Standardization Responses

**Never use `echo` manually.** 
There must only be one exit point of data to the frontend, and it must pass through `sendResponse()` located in `includes/functions.php`.

**Why?**
Because `sendResponse()` guarantees that every single HTTP request the frontend makes will *always* receive this exact shape:
```json
{
    "status": "success", // or "error"
    "data": { ... },     // or null
    "message": "Message"
}
```
If a developer bypasses this and echos a random string, the frontend mobile app parser will crash instantly. Use the helper exclusively. 

---

## 5. Security & Secret Exposure
- **Never return passwords or hashes.** Even if pulling `$user = $stmt->fetch()`, explicitly do `unset($user['password_hash'])` before returning the array to the frontend.
- **Do not leak SQL schema errors.** If a PDO query fails, log `$e->getMessage()` to the backend server log via `error_log()`, but send a generic string like *"A database error occurred."* to the frontend. Exposing table column names to a malicious user via a 500-error trace helps them map your database.
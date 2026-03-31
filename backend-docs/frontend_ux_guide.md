# Frontend UI/UX Booking Flow Blueprint

This document outlines the recommended user experience (UX) and programmatic flow for completing a booking. 
Because the backend is cleanly decoupled, the frontend has ultimate flexibility. However, for maximum conversion and the best user experience—especially considering complex logic like passing `service_id` and `staff_id` dynamically—this is the recommended approach.

---

## 1. Step 1: The Business Profile Screen
This is where the user lands after selecting a barbershop from the map/list.

**UI Layout:**
* **Top Header:** Interactive cover image and swipeable horizontal gallery.
* **Header details:** Shop Name, Address, Rating (Stars + Count), and a "Favorite/Heart" button.
* **Tabs:** Horizontal scrollable tabs: [`Services` (Active), `Reviews`, `Portfolio`, `About`].

**State & Data:** 
* The App calls `GET /api/services?business_id=123`.
* Under the `Services` tab, the UI renders the flat list of the Shop's menu (e.g., "Classic Haircut", "Beard Trim").

---

## 2. Step 2: The Service Trigger -> The "Staff Picker"
**The Action:** The user taps the "Book" button next to "Classic Haircut" (which holds `service_id: srv-1`).

**Recommended UI/UX Setup: The "Bottom Sheet Modal"**
Instead of throwing the user onto an entirely new independent screen (which feels jarring and breaks context), you should trigger a **Bottom Sheet Modal** sliding up over the current screen.

**Why a Bottom Sheet?**
1. **Context Retention:** The user still sees the barbershop in the background. It feels fast and lightweight.
2. **Dynamic Filtering:** Because you already have the data from `/api/services.php` (which includes the `staff` array and their `service_ids` map), the App *immediately* renders this sheet without a loading spinner.
3. **The "Skill Map" in Action:** The list in the Bottom Sheet maps over the `staff` array. It checks: *Does this staff member have `srv-1` in their `service_ids`?*
   - If YES: Render `Staff Name` + `Bio` + `Select Button`.
   - If NO: Filter them out entirely from the list, or gray them out.
4. **The "Any Barber" Option:** Always include a sticky row at the top or bottom of this sheet that says "Any Available Barber / First Available". (This sets `staff_id = null` in your frontend state).

---

## 3. Step 3: Date & Time Selection (The Final Screen)
**The Action:** The user taps a specific barber (or "Any Barber") in the Bottom Sheet. The modal slides down, and the app pushes to a **new, dedicated screen**: The Date/Time Picker.

**Why a new screen?**
Date and Time selection requires high focus, interactive horizontal calendars, and vertical scrolling for time slots. Trying to wedge this into a modal gets cramped, especially on smaller devices.

**UI Layout:**
* **Top:** "Booking Classic Haircut with Omar". 
* **Calendar:** A horizontal week view (Mon 14, Tue 15, Wed 16).
* **Slots:** A grid of available "chips" (e.g., [09:00] [09:30] [10:00]).

**State & Data (The "Brain"):**
* When this screen mounts (or when a new date chip is tapped), the app fires:
  `GET /api/availability?business_id=123&service_id=srv-1&staff_id=stf-1&date=2026-04-14`
* The app renders the slots returned by the backend.

---

## 4. Step 4: Confirmation & Execution
**The Action:** User taps `[09:30]`. 
* A prominent "Confirm Booking" button appears at the very bottom.
* When tapped, the app fires:
  `POST /api/bookings` with `{ user_id, business_id, service_id, staff_id, start_time: "2026-04-14 09:30:00"}`.
* If success (201): Navigate to a "Success" Lottie animation screen, then redirect to the "My Appointments" tab!
* If conflict (409): Show a toast error: "Someone just booked this slot! Please pick another." and seamlessly refresh the `availability` endpoint.

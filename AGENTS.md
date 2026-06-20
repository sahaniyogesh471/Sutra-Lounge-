# Project Instructions & Guardrails

This file contains strict project conventions, security policies, and schema structures. All AI agents, models, and developers MUST adhere to these rules.

## Schema Source of Truth

Do NOT rename any fields, invent alternative field names, or use fake local-only dashboard data. The database is the single source of truth. Do not use services, appointments, or clinic_settings.

### 1. Reservations Collection (`reservations`)
*   `id` (string): Primary Key
*   `full_name` (string): Guest full name
*   `email` (string): Guest email
*   `phone` (string): Guest phone number
*   `party_size` (number): Seat occupancy
*   `table_id` (string): Table mapping ID
*   `reservation_date` (string): YYYY-MM-DD
*   `start_time` (string): HH:MM
*   `end_time` (string): HH:MM
*   `status` (string): current booking status ('pending' | 'confirmed' | 'cancelled' | 'completed')
*   `special_requests` (string): Guest culinary/seating notes
*   `created_at` (string): Timestamp ISO string

### 2. Restaurant Tables Collection (`restaurant_tables`)
*   `id` (string): Primary Key
*   `table_name` (string): Display name
*   `capacity` (number): Max seating capability
*   `area` (string): Display zone (e.g., 'Main Hall', 'VIP Cabin')
*   `is_active` (boolean): Availability state
*   `created_at` (string): Timestamp ISO string

### 3. Menu Items Collection (`menu_items`)
*   `id` (string): Primary Key
*   `name` (string): Delicacy name
*   `description` (string): Culinary profile text
*   `price` (number): Cost in NPR
*   `category` (string): Category mapping (e.g. 'Mains', 'Sandwiches', 'Momo Specialties')
*   `is_featured` (boolean): Spotlight highlight togglable
*   `is_active` (boolean): Visible to the public
*   `created_at` (string): Timestamp ISO string

### 4. Business Hours Collection (`business_hours`)
*   `id` (string): Primary Key (e.g., 'Monday', 'Tuesday')
*   `day` (string): Day of the week
*   `is_open` (boolean): Shop active status for that day
*   `start_time` (string): Open time "HH:MM"
*   `end_time` (string): Close time "HH:MM"

### 5. Blocked Dates Collection (`blocked_dates`)
*   `id` (string): Primary Key
*   `date` (string): YYYY-MM-DD blackout date
*   `reason` (string): Details for closure
*   `created_at` (string): Timestamp ISO string

### 6. Restaurant Settings Collection (`restaurant_settings`)
*   `id` (string): Only 'default' is valid
*   `restaurant_name` (string): Brand name
*   `restaurant_email` (string): Contact email
*   `restaurant_phone` (string): Phone number
*   `restaurant_address` (string): Physical address
*   `slot_interval_minutes` (number): Timeslot cadence size
*   `booking_notice_hours` (number): Lead notice required before scheduling
*   `default_reservation_duration_minutes` (number): Time blocked per reservation slot
*   `max_party_size` (number): Maximum allowable guests per single table

## Security Policy

*   Admin Dashboard requires secure authentication checks. Never use fake client-side credentials protection.
*   The `admin@sutralounge.com.np` credential has admin-level write access to tables, menu items, business hours, blocked dates, and restaurant settings.
*   Read operations for current reservations and menu items must remain open for public customer booking widgets but restricted from administrative mutations.

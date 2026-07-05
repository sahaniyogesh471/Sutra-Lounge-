# Sutra Lounge Admin Login Guide

## Admin Credentials

Use these credentials to log in to the Admin Dashboard:

**Email:** `admin@sutralounge.com`  
**Password:** `AdminPass123!`  
**3-Digit Passcode:** `123`

## How to Access the Admin Panel

### Step 1: Go to the Website
Visit: https://sutra-loungehtd.vercel.app

### Step 2: Find the Admin Button
Scroll to the bottom of the home page. You'll see an **"Admin Desk"** button (usually in the footer area).

### Step 3: Click Admin Desk
Click the "Admin Desk" button. The authentication modal will appear with a beautiful orange header saying "Sutra Lounge Admin".

### Step 4: Login with Email & Password (Recommended)

1. The "Email" tab should be selected by default
2. In the **Email** field, enter: `admin@sutralounge.com`
3. In the **Password** field, enter: `AdminPass123!`
4. Click the **Login** button

**Note:** The password field will show dots (•••••••••••) as you type for security.

### Step 5: Admin Dashboard Opens
After successful login, you'll see the Admin Dashboard with:
- Restaurant metrics (Orders, Revenue, Reservations)
- Menu management options
- Order tracking
- Reservation system
- Photo gallery
- Settings

## Alternative Login Methods

### Option 2: Login with 3-Digit Passcode

1. Click the **"Code"** tab in the auth modal
2. Enter **Email:** `admin@sutralounge.com`
3. Enter the **3-Digit Code:** `123` (shown as three numeric input boxes)
4. Click **Login**

### Option 3: Login with Google

1. Click the **"Google"** tab in the auth modal
2. Click **"Login with Google"**
3. Use a Google account to authenticate
4. *Note: This requires the admin account to be linked with Google*

## Admin Panel Features

Once logged in, you can access:

### Left Sidebar Navigation
- **Dashboard** - View restaurant metrics and activity
- **Menu Cuisines** - Manage menu items and categories
- **Active Orders** - View and manage current orders
- **Reservations** - Manage table bookings
- **Photographs** - Upload and manage restaurant photos
- **Operations Set** - Configure restaurant settings
- **Security** - Change password, passcode, or email
- **Logout** - Sign out of the admin session
- **Back to Site** - Return to the restaurant website

### Key Features
- Real-time order tracking
- Revenue and metrics dashboard
- Menu management
- Reservation system
- Photo gallery management
- Security settings for credential changes
- Audit logging of all admin actions
- 30-minute session timeout for security

## Security Features

- **Password Protection:** All passwords are encrypted with bcrypt (military-grade hashing)
- **Passcode:** 3-digit numeric code for quick authentication
- **Session Timeout:** Admin sessions automatically expire after 30 minutes
- **Failed Login Lockout:** Account locks for 15 minutes after 5 failed attempts
- **Audit Logging:** All admin actions are logged for security tracking
- **Encrypted Connection:** All data is transmitted securely

## Troubleshooting

### "Invalid email or password" Error
- Double-check that you entered the email and password correctly
- Make sure Caps Lock is off (password is case-sensitive!)
- Wait a moment and try again

### "Account temporarily locked" Error
- Your account has had 5 failed login attempts
- Wait 15 minutes for the account to unlock
- Then try again with the correct credentials

### "Please fill out this field" Error
- Make sure you filled in both the Email and Password fields
- Both fields are required

### "Session expired" Error
- Your admin session has timed out after 30 minutes of inactivity
- Click "Admin Desk" again and log back in

## Password & Passcode Requirements

When changing your credentials in the Security settings:

- **Password:** Must be at least 8 characters
- **Passcode:** Must be exactly 3 numeric digits (0-9)
- **Email:** Must be a valid email address

## For Support

If you encounter any issues or need to reset your credentials, contact the developer or refer to the server logs for more details.

---

**Last Updated:** July 5, 2026  
**Status:** Production Ready

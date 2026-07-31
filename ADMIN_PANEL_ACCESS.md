# Admin Panel Dashboard Access Guide

## Quick Access

### Local Development
1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Open in browser:
   ```
   http://localhost:3000
   ```

3. Click the **"Admin"** button in the top-right corner of the homepage

4. Authentication modal opens - Enter credentials (see below)

### Production (Cloudflare Pages)
1. Go to your website:
   ```
   https://sutra-loungehtd.pages.dev
   ```

2. Click the **"Admin"** button in the top-right corner

3. Enter admin credentials

---

## Admin Credentials

### Current Admin Account
**Email:** `admin@sutralounge.com`
**Password:** Set via password manager

**Alternative Access:** Numeric passcode (6 digits)

### Create Admin Account
Admin users are created in Supabase:

1. Go to [Supabase](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor**
4. Execute:
```sql
INSERT INTO admin_users (name, email, is_active)
VALUES ('Your Name', 'youremail@example.com', true);
```

---

## Admin Panel Features

### 1. Overview Dashboard
- **Summary Stats**: Orders, Reservations, Revenue
- **Recent Activity**: Latest bookings and orders
- **Quick Actions**: Add new order, reservation, gallery item
- **Performance Metrics**: Key business indicators

### 2. Orders Management
- **View All Orders**: Complete order history
- **Filter by Status**: Pending, Confirmed, Completed, Cancelled
- **Add New Order**: Manual order entry
- **Edit/Delete Orders**: Update order details
- **Delivery Tracking**: Order status updates
- **Customer Details**: Contact info, order history

### 3. Reservations Management
- **Calendar View**: All reservations by date
- **Booking Details**: Guest count, time, special requests
- **Status Updates**: Confirm, reject, or cancel bookings
- **Guest Info**: Contact details, dining preferences
- **Waitlist**: Manage overflow bookings
- **SMS Integration**: Send updates via WhatsApp

### 4. Menu Management
- **Menu Items**: Add/edit/delete dishes
- **Categories**: Appetizers, Main Courses, Desserts, Drinks
- **Pricing**: Update menu prices in real-time
- **Photos**: Upload dish images
- **Descriptions**: Detailed item information
- **Availability**: Mark items as available/unavailable
- **Highlights**: Feature special dishes

### 5. Gallery Management
- **Upload Photos**: Add restaurant photos
- **Categories**: Interior, Food, Drinks, Exterior, Events
- **Edit Captions**: Add descriptions to images
- **Delete Photos**: Remove unwanted images
- **Organize**: Arrange photo order
- **Batch Upload**: Multiple images at once

### 6. Settings & Configuration
- **Business Hours**: Set opening/closing times
- **Contact Info**: Phone, email, address
- **Cuisine Type**: Define restaurant type
- **Dietary Info**: Vegetarian, Halal, etc.
- **Payment Methods**: Accepted payment options
- **Delivery Zones**: Service areas
- **Tax Settings**: GST, service charge
- **Password Management**: Change admin password

---

## Admin Panel Tabs Explained

### Overview
```
┌─────────────────────────────────────────┐
│  Total Orders    Total Reservations    │
│  $12,450        156 Bookings           │
├─────────────────────────────────────────┤
│  Recent Orders                          │
│  ┌──────────────────────────────────┐   │
│  │ Order #1023 - Pending - $450     │   │
│  │ Order #1022 - Completed - $320   │   │
│  │ Order #1021 - Delivered - $280   │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Orders
- Search by order ID or customer name
- Filter by status (Pending, Confirmed, Ready, Delivered)
- View order details (items, quantities, total)
- Update order status
- Add notes for kitchen

### Reservations
- Calendar showing all bookings
- Filter by status or date
- View guest details and preferences
- Confirm or reject bookings
- Send confirmation via WhatsApp

### Menu
- View all menu items organized by category
- Edit item details (name, description, price)
- Upload/change dish photos
- Mark as available or unavailable
- Set preparation time

### Gallery
- Thumbnail view of all photos
- Filter by category (Interior, Food, Drinks, etc.)
- Upload new photos (drag & drop)
- Edit photo captions
- Delete unwanted photos
- Reorder photos in gallery

### Settings
- Business name and contact information
- Operating hours (Monday-Sunday)
- Default tax and service charge percentages
- Restaurant description and cuisine type
- Payment methods accepted
- Delivery settings
- Change admin password

---

## Session Management

### Session Timeout
- **Duration**: 30 minutes of inactivity
- **Warning**: Alert before timeout (last 5 minutes)
- **Activity**: Mouse movement, keyboard, clicks extend session
- **Auto-logout**: Session expires and requires re-authentication

### Session Features
- **Remember Login**: Optional on next visit
- **Multiple Sessions**: Only one active session per device
- **Session Revocation**: Logout clears session
- **Audit Trail**: All actions logged

---

## Common Tasks

### Add New Menu Item
1. Click **Menu** tab
2. Click **+ Add Item** button
3. Fill in:
   - Item Name
   - Category (Appetizer, Main, Dessert, Drink)
   - Price
   - Description
   - Upload photo
4. Click **Save**

### Create Reservation
1. Click **Reservations** tab
2. Click **+ Add Reservation** button
3. Enter:
   - Guest name
   - Date and time
   - Number of guests
   - Special requests
   - Contact number
4. Click **Create**

### Upload Gallery Photos
1. Click **Gallery** tab
2. Click **+ Upload Photos** button
3. Select category (Interior, Food, Drinks, etc.)
4. Upload photo (drag & drop or click)
5. Add caption (optional)
6. Click **Save**

### Change Business Hours
1. Click **Settings** tab
2. Scroll to **Business Hours**
3. Edit each day:
   - Opening time
   - Closing time
   - Holiday status
4. Click **Save Changes**

### View Today's Orders
1. Click **Overview** tab
2. Scroll to **Today's Orders**
3. See all orders with status
4. Click order to view details

---

## Troubleshooting

### Can't Log In
**Issue**: "Invalid credentials" error
**Solution**:
- Check email is correct
- Verify password is typed correctly
- Try numeric passcode option
- Request password reset

### Session Expired
**Issue**: Logged out unexpectedly
**Solution**:
- Session times out after 30 minutes of inactivity
- Click **Admin** button again to re-authenticate
- Move mouse/type to extend active session

### Changes Not Saving
**Issue**: "Save failed" error
**Solution**:
- Check internet connection
- Verify Supabase is accessible
- Try saving again
- Contact support if issue persists

### Images Not Uploading
**Issue**: Photo upload fails
**Solution**:
- Check file size < 5MB
- Use JPG, PNG, or WebP format
- Check internet connection
- Try uploading to different folder

---

## Security Best Practices

### Password Security
- Use strong password (12+ characters, mix of upper/lower/numbers/symbols)
- Never share password
- Change password regularly (monthly recommended)
- Don't use personal information in password

### Session Security
- Log out when finished
- Don't leave admin panel unattended
- Use HTTPS (enforced)
- Enable two-factor authentication (if available)

### Data Protection
- Regular backups (automatic, daily)
- Data encrypted in transit (SSL/TLS)
- Row-Level Security (RLS) enforced
- Audit logging of all actions

---

## Advanced Features

### Bulk Import
```bash
# Import menu items from CSV
1. Go to Menu tab
2. Click "Import from CSV"
3. Select CSV file
4. Map columns to fields
5. Click "Import"
```

### Export Data
```bash
# Export orders, reservations, menu
1. Click "Export" button
2. Select date range
3. Choose format (CSV, PDF, Excel)
4. Download file
```

### Reports
- Daily/Weekly/Monthly reports
- Revenue analysis
- Popular menu items
- Peak hours analysis
- Customer insights

---

## Support & Help

**Documentation**: See `ADMIN_AUTH_TESTING.md` for authentication details

**Environment Setup**: See `ADMIN_AUTH_ENV_SETUP.md` for configuration

**Issues**: Check browser console for error messages (F12 → Console)

**Contact**: Email support or open GitHub issue

---

## Mobile Access

Admin panel is **fully responsive** on mobile (tested on 411px viewport):

- ✓ Full functionality on mobile
- ✓ Touch-friendly buttons
- ✓ Optimized layout for small screens
- ✓ All features accessible
- ✓ Password-protected access

### Mobile Tips
- Landscape mode: Better for data tables
- Tap "Menu" icon: Toggle navigation
- Double-tap to zoom: If needed
- Pull-to-refresh: Updates data

---

## Admin Panel Dashboard Layout

```
┌─────────────────────────────────────────────────┐
│  Sutra Lounge Admin Panel        [Settings][Logout]
├─────────────────────────────────────────────────┤
│ [Overview] [Orders] [Reservations] [Menu] [Gallery] [Settings]
├─────────────────────────────────────────────────┤
│                                                   │
│  CURRENT TAB CONTENT                             │
│                                                   │
│  [Content updates based on selected tab]         │
│                                                   │
├─────────────────────────────────────────────────┤
│  Session: 25 min remaining  •  Last save: 2min ago
└─────────────────────────────────────────────────┘
```

---

**Admin Panel Status:** ✓ Active and Ready to Use

Start managing your restaurant from the admin dashboard!

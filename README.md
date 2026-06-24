# JJ Luxe Collective MVP V6 Secure Admin

This version protects the admin dashboard with:

- Admin login page
- Admin email and password from `.env.local`
- Secure HTTP-only session cookie
- JWT session verification
- Protected `/admin` route
- Logout button

## Required `.env.local`

```env
MONGODB_URI=your_mongodb_connection_string_here

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=jj_luxe_uploads

ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=choose_a_strong_password
ADMIN_SESSION_SECRET=make_this_a_long_random_secret
```

Example `ADMIN_SESSION_SECRET`:

```text
jj-luxe-super-secret-session-key-2026-change-this
```

## Run

```bash
npm install
npm run dev
```

Admin login:

```text
http://localhost:3000/admin/login
```

Protected admin dashboard:

```text
http://localhost:3000/admin
```


## V8 Orders + Checkout + WhatsApp

Added:
- Orders MongoDB model
- `/api/orders` create/list orders
- `/api/orders/[id]` update/delete orders
- Customer checkout form on cart page
- WhatsApp order summary after checkout
- Admin orders dashboard at `/admin/orders`

Add this to `.env.local` and replace with your real WhatsApp number in international format:

```env
NEXT_PUBLIC_WHATSAPP_NUMBER=233XXXXXXXXX
```

Run:

```bash
npm install
npm run dev
```


## V9 Orders System

Added:
- MongoDB Order model
- `/api/orders` create/list orders
- `/api/orders/[id]` update status/delete orders
- Checkout saves order before opening WhatsApp
- Admin orders dashboard at `/admin/orders`

Required env:
```env
NEXT_PUBLIC_WHATSAPP_NUMBER=233XXXXXXXXX
```

Run:
```bash
npm install
npm run dev
```


## V10 Payments + Deployment + UI Polish

Added:
- Paystack/MoMo payment initialization
- Payment success verification page
- Paid order status
- Admin orders payment tracking
- Deployment guide
- Removed fake hardcoded WhatsApp number
- Dev script uses webpack for compatibility

Required new env:
```env
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
```

Run:
```bash
npm install
npm run dev
```


## V11 Paid Orders

- Checkout creates an order before Paystack payment.
- Paystack initialization stores the payment reference on the order.
- Payment success verifies with Paystack.
- Successful payments automatically update the MongoDB order:
  - status: paid
  - paymentStatus: paid
  - paymentMethod: paystack
  - paidAt: current time
- Check paid orders at /admin/orders.


## V12 Order Status System

Added:
- Order statuses: pending, paid, processing, delivered, cancelled
- Status timestamps: paidAt, processingAt, deliveredAt, cancelledAt
- Status history timeline
- Admin search and status filtering
- Dashboard counters for paid, processing and delivered orders


## V13 WhatsApp Status Updates

Fixed:
- Payment success page now shows "Send Order on WhatsApp" again.

Added:
- Admin can send WhatsApp messages to customers based on order status.
- When status changes to paid, processing, delivered or cancelled, admin is asked whether to open WhatsApp.
- Each order also has a "WhatsApp Customer" button.
- Customer phone numbers are normalized for Ghana format.


## V14 Tracking Page

Added:
- Customer tracking page at `/track-order`
- API route `/api/track-order?q=JJ-XXXXXX`
- Customers can enter short order number or full order ID
- Progress timeline: Paid → Processing → Delivered


## V15 Tracking Navbar Fixed

Fixed:
- Added a guaranteed editable shared Navbar at `components/Navbar.tsx`
- Added Track Order link to the top navigation
- Layout now renders the Navbar globally
- Payment success WhatsApp message includes the tracking page link
- Track page remains available at `/track-order`

Run:
```bash
npm install
npm run dev
```

Open:
```text
http://localhost:3000/track-order
```

## V16 Cart Fixed

Fixed:
- Removed old decreaseQuantity/increaseQuantity calls.
- Cart uses updateQuantity.
- Plus/minus quantity buttons work.
- Layout fixed with one Navbar.

## V17 Premium UI + Admin Privacy

Added:
- Premium luxury UI polish for homepage, navbar and product cards.
- Customer navbar no longer shows admin/orders link.
- Payment success page no longer shows View Admin Orders.
- Removed Jesse/Jeffrey names from customer-facing pages.
- Middleware protects `/admin/*` routes from public access.

## V18 Admin Menu
- Admin-only menu in `/admin`
- Products link: `/admin`
- Orders link: `/admin/orders`
- Hidden from customers

## V19 Admin Products + Home Featured Fix

Fixed:
- `/admin` redirects to `/admin/login`
- Product editor moved to `/admin/products`
- Admin menu links to `/admin/products` and `/admin/orders`
- Login redirects to `/admin/products`
- `/admin/products` and `/admin/orders` require admin login through middleware
- Homepage now loads featured products from `/api/products`, so products added in admin can appear on homepage

## V20 Customer Accounts + OTP

Added:
- Customer account page at `/account`
- OTP login/create-account by email or phone
- Development OTP is shown on screen and printed in terminal
- Customer profile saved to MongoDB
- Cart auto-fills customer name, phone, email and location after login
- Orders can store customerId from session

Before going live:
- Replace development OTP display with real email/SMS sending.

## V21 Login + Sign UP + SMS OTP

Added:
- Visible Login button in navbar
- `/login` page for email/phone + password
- `/signup` page for full name, phone, email, password, confirm password and phone OTP
- Password requires uppercase, lowercase, number and at least 8 characters
- Phone OTP can be sent by Twilio SMS when credentials are configured
- Development mode still shows OTP on screen if Twilio is not configured
- Customer profile remains at `/account`
- Cart auto-fills logged-in customer details

Required for real SMS:
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_PHONE_NUMBER
- CUSTOMER_SESSION_SECRET


## V22 Auth, Track Orders, Admin Fix

Fixed:
- OTP code is no longer shown on the signup screen.
- OTP is sent only to the customer's phone through Twilio Verify.
- Customer login uses email/phone + password.
- Navbar shows the logged-in customer's profile/name at the top-right.
- Track Order now loads all orders for the logged-in customer automatically.
- Orders are linked to the logged-in customer session with customerId.
- Admin login is fixed with .env.local checking and proper cookie protection.

Required `.env.local`:
CUSTOMER_SESSION_SECRET=make-this-a-long-random-customer-secret
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
ADMIN_SESSION_SECRET=make-this-a-long-random-admin-secret
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_VERIFY_SERVICE_SID=VA...

After editing `.env.local`, always restart:
npm run dev

## V23 Login + Admin Navbar Fix

Fixed:
- Customer login redirects to `/` homepage.
- Admin pages no longer show the logged-in customer profile in the navbar.
- Admin pages now show an Admin badge at the top right.
# jjluxecollective

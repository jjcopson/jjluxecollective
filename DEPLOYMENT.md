# Deployment Guide — JJ Luxe Collective

## 1. Create Vercel account
Go to Vercel and create an account.

## 2. Push project to GitHub
Create a new GitHub repository and push this project.

## 3. Import project on Vercel
Choose the repository and deploy it as a Next.js app.

## 4. Add environment variables on Vercel
Add these in Vercel Project Settings → Environment Variables:

```env
MONGODB_URI=your_mongodb_connection_string_here

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=jj_luxe_uploads

NEXT_PUBLIC_WHATSAPP_NUMBER=233XXXXXXXXX

PAYSTACK_SECRET_KEY=sk_test_or_sk_live_key

ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=choose_a_strong_password
ADMIN_SESSION_SECRET=make_this_a_long_random_secret
```

## 5. MongoDB Atlas network access
For deployment, MongoDB Atlas must allow Vercel to connect.
For simple setup, use:

```text
0.0.0.0/0
```

## 6. Paystack keys
Use test key while developing:

```text
sk_test_...
```

Use live key when ready to accept real payment:

```text
sk_live_...
```

## 7. Test before sharing
Test:
- Homepage
- Shop
- Cart
- WhatsApp checkout
- Paystack checkout
- Admin login
- Admin products
- Admin orders

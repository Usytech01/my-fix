# 🛠️ My_Fix — Lagos Home Services Backend

Welcome to the backend codebase for **My_Fix**, the trusted home services marketplace connecting homeowners in Lagos with verified local artisans.

This backend is built on **Supabase** (powered by **PostgreSQL**) and handles database management, geographic proximity searches, user security, and serverless payments.

---

## 🚀 Technology Stack
*   **Database**: PostgreSQL 15 (relational, scalable)
*   **Authentication**: Supabase Auth (Email, Password, Phone SMS OTP)
*   **File Storage**: Supabase Storage (Artisan portfolios, PII documents)
*   **Serverless APIs**: Supabase Edge Functions (Deno / TypeScript)
*   **Geospatial Processing**: PostGIS (for distance calculations in Lagos neighborhoods)
*   **Payment Gateway**: Paystack API (escrow payments)

---

## 📂 Folder Structure

```
my-fix/
├── .gitignore               # Files excluded from git tracking
├── README.md                # This documentation
├── My_Fix_PRD_v1.md         # Full product requirement document
├── myfix_logo.svg           # Core brand identity logo
└── supabase/
    ├── migrations/          # SQL database migration files
    │   └── 20260525000000_init.sql   # Primary DB structure setup
    └── functions/           # Serverless edge functions (TypeScript)
        └── paystack-webhook/
            └── index.ts     # Escrow payment handling webhook
```

---

## 🛠️ Step-by-Step Supabase Cloud Setup

As a learner, here is the easiest way to launch this backend on the Supabase Cloud platform for free:

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in with your GitHub account.
2. Click **New Project** and name it `my-fix`.
3. Set your **Database Password** (write this down! You will need it).
4. Select a region close to Nigeria, such as **Europe (London)** or **Africa (Cape Town)** to minimize latency for users in Lagos.
5. Wait 2-3 minutes for Supabase to provision your virtual machine.

### Step 2: Apply the DB Schema
1. Inside your Supabase Project dashboard, navigate to the **SQL Editor** tab (the `SQL` icon on the left sidebar).
2. Click **New query**.
3. Open the file `supabase/migrations/20260525000000_init.sql` from this codebase, copy all the SQL code inside, and paste it into the editor.
4. Click **Run** in the top-right. Your tables, triggers, and Row Level Security (RLS) policies are now instantly deployed!

### Step 3: Configure Storage Buckets
1. Go to the **Storage** tab in the Supabase Dashboard.
2. Click **New bucket**:
   *   **Bucket 1**: Name it `portfolios`. Set public access to **ON** (so clients can load artisan portfolio pictures).
   *   **Bucket 2**: Name it `verifications`. Set public access to **OFF** (so sensitive documents are private and require authorization keys to see).

---

## 💻 Local Git & GitHub Setup

Since you are running this locally, let's link this folder to your GitHub dashboard!

### Step 1: Check your Local Repository Status
Run this command in your terminal to see the prepared files:
```bash
git status
```

### Step 2: Create a Repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Name your repository exactly: `my-fix` (or `my-fix-backend`).
3. **CRITICAL**: Do NOT check "Add a README file", "Add .gitignore", or "Choose a license". Keep it a completely empty repository so it merges smoothly!
4. Click **Create repository**.

### Step 3: Connect and Push your Code
Copy and run these exact terminal commands inside your local `my-fix` directory to push your code:

```bash
# 1. Add your remote GitHub repository (replace 'YOUR_USERNAME' with your actual username)
git remote add origin https://github.com/YOUR_USERNAME/my-fix.git

# 2. Rename the default branch to 'main'
git branch -M main

# 3. Push all your code up to GitHub!
git push -u origin main
```

---

## ⚡ Escrow State Engine Overview

This database is built around an escrow-state machine:

```
[Pending Booking] 
       │
       ▼ (Client Pays)
[Paid / Held in Escrow]
       │
       ├───────────────────────────────┐
       ▼ (Client Confirms Work)         ▼ (Client Disputes Work within 24h)
[Released to Artisan]            [Escrow Frozen / Held]
                                       │
                                       ▼ (Admin Resolution)
                                [Released or Refunded]
```

This model is fully automated via the RLS policies in the database, protecting both the client's money and the artisan's labor.

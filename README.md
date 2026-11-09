# FluentaRise Academy

A full-stack, modern course marketplace and learning academy platform built with **React**, **TypeScript**, **Tailwind CSS**, and **Supabase PostgreSQL**. Optimized for zero-configuration deployment on **Vercel's Free Hobby Plan**.

---

## 🚀 Features

- **Course Catalog**: Filterable course directory by category, skill level, and search keyword.
- **Course Details**: Curriculum breakdown, instructor profiles, student reviews, and preview modal.
- **Cart & Enrollment**: Persistent shopping cart powered by Zustand with instant drawer preview.
- **Checkout Flow**: 3-step checkout with MoMo (MTN / Airtel MobileMoney) and Bank Transfer payment verification.
- **Database Persistence**: Supabase PostgreSQL integration for orders, with an automatic offline fallback mode.
- **Responsive UI**: Polished, mobile-first design using Tailwind CSS and Lucide icons.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite 7
- **Routing**: React Router v7 (SPA with Vercel rewrites)
- **State Management**: Zustand (persisted cart)
- **Database & Backend**: Supabase (PostgreSQL with Row Level Security)
- **Deployment**: Vercel (Hobby Tier)

---

## 🌐 Deploying to Vercel (Free Hobby Plan)

This repository is pre-configured for Vercel Hobby hosting with `vercel.json` SPA rewrite rules.

### Option 1: Import via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account.
2. Click **Add New...** > **Project**.
3. Import the **`ArseneLabs/FluentArise_Academy`** repository.
4. Vercel will automatically detect the **Vite** preset:
   - **Framework Preset**: `Vite`
   - **Build Command**: `vite build` (or `npm run build`)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. *(Optional)* Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
   *(If omitted, checkout works in offline demo mode without errors!)*
6. Click **Deploy**. Your app will be live in seconds at `https://your-project.vercel.app`!

---

## 🗄️ Supabase Database Setup

To enable persistent order tracking in your own Supabase project:

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Run the SQL script located at:
   ```
   supabase/migrations/20261109082741_create_orders_table.sql
   ```
4. Copy your **Project URL** and **Anon Public Key** from **Project Settings > API** into your Vercel Environment Variables.

---

## 💻 Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ArseneLabs/FluentArise_Academy.git
   cd FluentArise_Academy
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables** (optional):
   ```bash
   cp .env.example .env
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Typecheck & Build**:
   ```bash
   npm run typecheck
   npm run build
   ```

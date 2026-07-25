# Maison Tislit

A luxury e-commerce website for **Maison Tislit** — a Moroccan feminine fashion brand specializing in artisanal djellabas, takchitas, and gandouras. Built with React 19, TypeScript, Vite, Supabase, and Stripe.

![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Vite](https://img.shields.io/badge/Vite-7-purple) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38bdf8) ![Supabase](https://img.shields.io/badge/Supabase-2.105-3ecf8e) ![Stripe](https://img.shields.io/badge/Stripe-9.6-635bff)

---

## Features

### Shopping Experience
- Full product catalog with advanced filtering (category, color, size, price, stock)
- Product detail modal with size guide, reviews, and custom measurements
- Shopping cart with localStorage persistence
- Wishlist with animated fly-heart effect (GSAP)
- Multi-currency support (MAD / EUR / USD) with live conversion
- Bilingual interface (French / English)

### Checkout & Payments
- Two-step checkout (delivery info → payment)
- Stripe integration for card payments
- Cash on Delivery option (5% fee)
- Cloudflare Turnstile CAPTCHA on contact forms

### User Accounts
- Registration with password validation
- Login with rate limiting (5 attempts/min)
- Profile management, order history, and wishlist

### Admin Dashboard
- Protected admin panel (`admin@maison-tislit.com`)
- Product CRUD (stock management)
- Order status management
- Message inbox with read/reply
- User management

### Performance & Visual
- Three.js silk particle background (WebGL, deferred loading)
- GSAP hero reveal animations
- Framer Motion page transitions
- IntersectionObserver scroll-reveal
- Aggressive code splitting (Three.js, Stripe, Supabase, GSAP each get own chunk)
- SEO meta tags via react-helmet-async (OG, Twitter Cards)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 7 |
| **Styling** | Tailwind CSS v4, custom fonts (Cinzel, EB Garamond, Raleway) |
| **Animation** | Framer Motion, GSAP, Three.js |
| **Backend/BaaS** | Supabase (Auth, Database, Edge Functions, Storage) |
| **Payments** | Stripe (PaymentIntent + PaymentElement) |
| **CAPTCHA** | Cloudflare Turnstile |
| **Testing** | Playwright (E2E) |
| **Icons** | Lucide React |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account
- A [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) site key

### Installation

```bash
git clone <repository-url>
cd maison-tislit-e-commerce-website
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

### Database Setup

Run the Supabase migrations to create the required tables:

```bash
npx supabase db push
```

Or apply migrations manually from `supabase/migrations/`.

### Development

```bash
npm run dev
```

The site will be available at `http://localhost:5173`.

### Build

```bash
npm run build
npm run preview
```

---

## Project Structure

```
├── src/
│   ├── pages/              # 16 page components (lazy-loaded)
│   │   ├── HomePage.tsx
│   │   ├── ShopPage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── AccountPage.tsx
│   │   ├── AdminPage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── LookbookPage.tsx
│   │   └── ...
│   ├── components/         # Reusable UI components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductModal.tsx
│   │   ├── AdminGuard.tsx
│   │   ├── Captcha.tsx
│   │   ├── SEO.tsx
│   │   └── ...
│   ├── context/            # React Context providers
│   │   ├── AppContext.tsx
│   │   └── LanguageContext.tsx
│   ├── supabase/           # Supabase client, queries, types
│   ├── translations/       # fr.ts, en.ts
│   └── utils/              # Animation helpers, cn(), flyHeartToCart
├── supabase/
│   ├── functions/          # Edge Functions (create-payment-intent, submit-message)
│   └── migrations/         # SQL schema + seed data
├── tests/                  # Playwright E2E specs
├── public/images/          # Static assets
├── DESIGN.md               # Design system documentation
└── rapport/                # Academic thesis report
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test:e2e` | Run Playwright tests |
| `npm run test:e2e:ui` | Run Playwright tests with UI |

---

## Database Schema

| Table | Description |
|---|---|
| `profiles` | User profiles (extends Supabase auth) |
| `products` | Product catalog with multilingual names, prices, sizes, colors |
| `orders` | Customer orders with status tracking |
| `order_items` | Individual items within an order |
| `messages` | Contact form submissions |
| `reviews` | Product reviews (1–5 stars + comment) |
| `newsletter_subscribers` | Newsletter email list |

All tables have Row Level Security (RLS) enabled.

---

## License

This project is private. All rights reserved.

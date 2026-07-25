# Chapter 4: Implementation

## 4.1 Project Setup and Structure

The project was initialized using Vite with the React + TypeScript template. The directory structure is organized as follows:

```
maison-tislit-e-commerce-website/
├── public/
│   └── images/           # Static assets (product images, HERO.mp4)
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   ├── ProductModal.tsx
│   │   ├── Toast.tsx
│   │   └── WhatsAppButton.tsx
│   ├── context/          # React Context providers
│   │   ├── AppContext.tsx      # Global state (auth, cart, products)
│   │   └── LanguageContext.tsx # i18n state management
│   ├── pages/            # Page-level components
│   │   ├── HomePage.tsx
│   │   ├── ShopPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── ConfirmationPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── AccountPage.tsx
│   │   ├── AdminPage.tsx
│   │   └── ContactPage.tsx
│   ├── supabase/         # Supabase integration
│   │   ├── client.ts     # Supabase client initialization
│   │   ├── queries.ts    # Database query functions
│   │   └── types.ts      # Database row type definitions
│   ├── translations/     # i18n files
│   │   ├── fr.ts         # French translations
│   │   └── en.ts         # English translations
│   ├── utils/
│   │   ├── cn.ts         # Tailwind class merging utility
│   │   └── animations.ts # Scroll-reveal animation hooks
│   ├── App.tsx           # Root component with routing
│   ├── main.tsx          # Application entry point
│   ├── types.ts          # Shared TypeScript interfaces
│   └── index.css         # Tailwind directives + global styles
├── supabase/
│   ├── migrations/       # Database migrations
│   │   └── 00001_schema.sql
│   └── functions/        # Edge Functions
│       └── create-payment-intent/
│           └── index.ts
├── index.html
├── vite.config.ts
└── package.json
```

## 4.2 Authentication System

Authentication is handled by Supabase Auth and wrapped in the AppContext. The implementation covers three operations: login, registration, and logout.

**Login flow:**
```typescript
// src/context/AppContext.tsx (simplified)
const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return false;
  // Fetch user profile
  const profile = await getProfile(data.user.id);
  setUser({ id, name, email });
  setProfile(profile);
  return true;
};
```

**Row Level Security (RLS):**
- Products are readable by anyone (`SELECT` policy for all users).
- Orders are only readable by the owning user or an admin.
- Admin routes and operations are protected by checking `is_admin` on the profiles table.

## 4.3 Product Catalog

Products are stored in the `products` PostgreSQL table and fetched via the `getProducts()` query function:

```typescript
export async function getProducts(): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  return data || [];
}
```

### 4.3.1 Category Filtering

The ShopPage implements client-side filtering by category using React state:

```typescript
const filtered = products
  .filter(p => activeCategory === 'all' || p.category === activeCategory)
  .sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0;
  });
```

### 4.3.2 Product Cards

Each product is displayed as a `ProductCard` component with:
- Product image with hover zoom effect
- Badge display (Bestseller, Nouveau, Premium, Promo)
- Discount percentage when originalPrice is set
- Color chips showing available colors
- Quick-add-to-cart button

## 4.4 Shopping Cart

The cart is managed through React Context and persisted to localStorage:

```typescript
const [cart, setCart] = useState<CartItem[]>(() => {
  const saved = localStorage.getItem('maison-tislit-cart');
  return saved ? JSON.parse(saved) : [];
});
```

**Operations:**
- **Add to cart**: Checks for existing item with same ID, size, and color; increments quantity if found, otherwise adds new item.
- **Remove from cart**: Filters out the matching item.
- **Update quantity**: Changes quantity or removes if zero.
- **Cart persistence**: Cart is saved to localStorage on every change via a `useEffect`.

## 4.5 Checkout & Payment

### 4.5.1 Checkout Flow

The checkout is a two-step process:
1. **Delivery Information**: User fills in name, email, phone, address, and city.
2. **Payment**: User enters card details via Stripe Elements.

### 4.5.2 Stripe Integration

**Server-side (Edge Function):**
```typescript
// supabase/functions/create-payment-intent/index.ts
const paymentIntent = await stripe.paymentIntents.create({
  amount: amount * 100, // Convert to cents
  currency: 'eur',
  automatic_payment_methods: { enabled: true },
});
```

**Client-side:**
```typescript
const { error } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: { card: elements.getElement(CardElement) },
});
```

### 4.5.3 Order Creation

On successful payment, an order is created in the database with:
- User ID, total amount, delivery information
- Order items with product snapshots (name, price, size, color at time of purchase)
- Status set to "pending"

## 4.6 Multilingual Support

The application supports French and English through a custom translation system:

```typescript
// LanguageContext provides current locale and translation function
const { t, locale, setLocale } = useTranslation();

// Usage in components
<h1>{t('shop.ourBoutique')}</h1>
```

Translation files export key-value objects:
```typescript
// fr.ts
const fr = {
  'nav.home': 'Accueil',
  'shop.ourBoutique': 'Notre Boutique',
  // ...
};

// en.ts
const en = {
  'nav.home': 'Home',
  'shop.ourBoutique': 'Our Boutique',
  // ...
};
```

Product names and descriptions are stored in both French and English in the database, and the UI selects the appropriate language based on the current locale.

## 4.7 Admin Dashboard

The admin panel is a protected page accessible only to users with `is_admin = true`. It features:

### 4.7.1 Overview Section
- Statistics cards: Total products, pending orders, unread messages, registered users, revenue.
- Data fetched from the database and displayed in a clean grid layout.

### 4.7.2 Stock Management
- Searchable, filterable product table.
- Add/edit modal with fields for all product attributes.
- Delete with confirmation.

### 4.7.3 Order Management
- Orders displayed in a table with status badges (pending/shipped/delivered).
- One-click status updates.
- Filters by status.

### 4.7.4 Message Management
- Customer inquiries displayed in a read/unread view.
- Reply functionality with inline form.

### 4.7.5 User Management
- Table of registered users with admin status indicator.
- Ability to toggle admin privileges.

## 4.8 Performance Optimizations

- **Lazy loading**: Images use `loading="lazy"` for deferred loading off-screen.
- **CSS**: Tailwind purges unused styles in production builds.
- **Build**: Vite produces optimized chunks with code splitting.

## 4.9 Contact Page

The contact page (`ContactPage.tsx`) provides a way for visitors and customers to get in touch with the Maison Tislit team directly from the website.

### 4.9.1 Page Structure

The page is divided into three sections:

1. **Hero banner**: A full-width brand-colored section with a subtle geometric pattern background, displaying the page title and subtitle. The content uses a CSS keyframe animation (`hero-fade-in`) for a smooth entrance without any JavaScript dependency.
2. **Atelier information + contact form**: A two-column layout showing the atelier's address, phone, email, and business hours on the left, and a contact form on the right.
3. **Support links**: Three cards (Wholesale, Press, Concierge) with email contact links, styled on a brand-colored background.

All page translations (labels, placeholders, success/error messages) are defined in the `fr.ts` and `en.ts` translation files.

### 4.9.2 Contact Form

The form collects four fields:

| Field | Input Type | Table Column |
|-------|-----------|--------------|
| Name | Text input | `messages.name` |
| Email | Email input | `messages.email` |
| Subject | Select dropdown | `messages.subject` |
| Message | Textarea | `messages.body` |

On submission, the form inserts the data directly into the `messages` PostgreSQL table via `supabase.from('messages').insert()`. Submission does not require authentication — the Row Level Security policy permits public inserts (`WITH CHECK (true)`) while restricting read, update, and delete operations to administrators only.

### 4.9.3 Spam Protection

Since the form accepts public submissions, three layers of spam protection are implemented client-side:

1. **Honeypot field**: A hidden input (`_hp`) that is invisible to humans via `display: none` and `tabIndex={-1}`. Automated bots typically fill all form fields, including hidden ones. If the `_hp` field contains a value on submission, the request is silently ignored.
2. **Time check**: The component records the page mount timestamp via a `useRef`. Submissions that occur in under 4 seconds are rejected — legitimate users need at least this long to read and fill out the form.
3. **Send cooldown**: After a successful submission, the send button is disabled for 90 seconds with a countdown timer displayed below it. This prevents rapid repeated submissions.

These measures stop the vast majority of automated spam without requiring a third-party CAPTCHA service, additional API keys, or server-side Edge Functions.

### 4.9.4 Scroll Reveal Animations

The page uses two custom React hooks defined in `src/utils/animations.ts`:

- **`useScrollReveal`**: Applies a fade-in + slide-up animation when an element scrolls into view. The hook sets the element's initial opacity to `0` and `transform: translateY(60px)` on mount (committed via a forced reflow). When the `IntersectionObserver` detects the element's top has reached 85% of the viewport, it enables a CSS transition that animates to `opacity: 1, translateY(0)`. This approach completely avoids the dynamic imports and flickering that plagued the previous GSAP + ScrollTrigger implementation.
- **`useStaggerReveal`**: Same concept but for a list of child elements, each animated with a staggered transition delay (`i * stagger` seconds).

Both hooks check whether the element is already in the viewport on mount; if so, no animation is applied, ensuring in-viewport content is never hidden. A `IntersectionObserver` polyfill check provides graceful degradation.

## 4.10 Key Screenshots

*(Insert screenshots of: Homepage, Shop Page, Product Modal, Cart, Checkout, Admin Dashboard)*

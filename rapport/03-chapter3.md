# Chapter 3: Technologies & Tools

## 3.1 Frontend Stack

### 3.1.1 React

React is a JavaScript library for building user interfaces, developed by Meta. It was chosen for its component-based architecture, which promotes reusability and maintainability. React's virtual DOM ensures efficient rendering, making it suitable for a dynamic e-commerce interface.

**Key advantages for this project:**
- Component reuse (ProductCard, Badge, Modal components)
- Efficient state management via Context API
- Large ecosystem and community support

### 3.1.2 TypeScript

TypeScript adds static type checking to JavaScript, catching errors at compile time rather than runtime. This is particularly valuable for an e-commerce application where data structures (products, orders, cart items) must be consistent across the application.

**Key types defined:**
- `Product`: name, price, category, sizes, colors, image
- `CartItem`: extends Product with quantity, selectedSize, selectedColor
- `User`: id, name, email
- `Page`: union type for routing

### 3.1.3 Vite

Vite is a modern build tool that offers fast development server startup via native ES module serving and optimized production builds via Rollup. It was chosen over Create React App for its significantly faster hot module replacement (HMR) and smaller configuration overhead.

### 3.1.4 Tailwind CSS

Tailwind CSS is a utility-first CSS framework that enables rapid UI development through pre-built classes. It was selected for:

- **Consistency**: Predefined design tokens for colors, spacing, typography.
- **Responsiveness**: Built-in breakpoint prefixes (`sm:`, `md:`, `lg:`).
- **Customization**: The `tailwind.config.js` allows extending the default theme.
- **Performance**: Purges unused CSS in production builds.

## 3.2 Backend Stack

### 3.2.1 Supabase

Supabase is an open-source backend-as-a-service (BaaS) that provides a PostgreSQL database, authentication, storage, and Edge Functions. It was chosen for several reasons:

**PostgreSQL Database:**
- Full relational database with SQL queries, joins, and migrations.
- Row Level Security (RLS) for fine-grained access control.
- Real-time subscriptions (future scalability).

**Authentication (GoTrue):**
- Built-in user management with email/password authentication.
- JWT-based session handling.
- Integration with React via `@supabase/supabase-js`.

**Edge Functions:**
- Deno-based serverless functions for secure operations like Stripe payment intent creation.
- Deployed and managed through Supabase CLI.

**Why Supabase over alternatives:**

| Feature | Supabase | Firebase | Custom Backend |
|---------|----------|----------|----------------|
| Database | PostgreSQL (SQL) | Firestore (NoSQL) | Any |
| Auth | Built-in | Built-in | Manual |
| Pricing | Free tier generous | Pay-as-you-go | Server costs |
| Open Source | Yes | No | N/A |
| Real-time | Yes | Yes | Manual |

### 3.2.2 Stripe

Stripe provides the payment processing infrastructure. The integration uses:

- **Stripe Elements**: Secure payment form components.
- **Payment Intent API**: Creates a payment intent server-side via a Supabase Edge Function.
- **Confirm Card Payment**: Client-side confirmation with Stripe.js.

The payment flow is as follows:

```
1. Client sends cart total to Edge Function
2. Edge Function creates a PaymentIntent via Stripe API
3. Client receives client_secret
4. Client confirms payment with card details via Stripe Elements
5. Stripe processes the payment and returns a result
6. On success, order is created in the database
```

## 3.3 Development Tools

| Tool | Purpose |
|------|---------|
| VS Code | Code editor |
| Git | Version control |
| npm | Package management |
| Supabase CLI | Local development, migrations, function deployment |
| Chrome DevTools | Debugging and performance analysis |

## 3.4 Deployment

The application is deployed as a static site (since Supabase handles the backend):

- **Frontend**: Built with `vite build` and deployed to a hosting service (e.g., Vercel, Netlify, or Supabase Hosting).
- **Backend**: Fully managed by Supabase cloud.
- **Environment Variables**: Supabase URL and anon key configured in the hosting platform.

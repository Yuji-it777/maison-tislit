# Chapter 2: Analysis & Design

## 2.1 Functional Requirements

### 2.1.1 User-Facing Features

| ID | Requirement | Description |
|----|-------------|-------------|
| FR1 | Browse Products | Users can view all products with category filtering and sorting |
| FR2 | Product Details | Users can view product images, descriptions, colors, sizes, and prices |
| FR3 | User Registration | New users can create an account with name, email, and password |
| FR4 | User Login | Registered users can log in securely |
| FR5 | Shopping Cart | Users can add/remove products and update quantities |
| FR6 | Checkout | Users can place orders with delivery information |
| FR7 | Payment | Users can pay via credit/debit card through Stripe |
| FR8 | Order Confirmation | Users receive an order confirmation with details |
| FR9 | Account Management | Users can view order history and account information |
| FR10 | Multilingual | The interface supports French and English |

### 2.1.2 Admin Features

| ID | Requirement | Description |
|----|-------------|-------------|
| FR11 | Product Management | Admin can add, edit, and delete products |
| FR12 | Order Management | Admin can view and update order statuses |
| FR13 | Customer Messages | Admin can view and reply to customer inquiries |
| FR14 | User Management | Admin can view registered users |
| FR15 | Dashboard | Admin sees overview statistics (products, orders, revenue) |

## 2.2 Non-Functional Requirements

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR1 | Security | Passwords hashed, authentication via Supabase, admin-only routes |
| NFR2 | Responsiveness | Fully functional on desktop, tablet, and mobile |
| NFR3 | Performance | Fast page loads, optimized images, lazy loading |
| NFR4 | Scalability | Backend scales via Supabase managed infrastructure |
| NFR5 | Maintainability | Clean code structure, TypeScript for type safety |

## 2.3 System Architecture

The application follows a modern full-stack architecture:

```
┌─────────────────────────────────────────────────┐
│                   Client (Browser)               │
│  ┌─────────────────────────────────────────────┐ │
│  │           React + Vite + TypeScript         │ │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌────────┐ │ │
│  │  │ Auth │  │ Shop │  │ Cart │  │ Admin  │ │ │
│  │  └──────┘  └──────┘  └──────┘  └────────┘ │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────────┐
│                 Backend (Supabase)               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │ PostgreSQL │  │ Auth (GoTrue) │  │ Storage   │ │
│  └────────────┘  └────────────┘  └────────────┘ │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│           Third-Party Services                   │
│  ┌────────────────┐  ┌────────────────────────┐ │
│  │  Stripe API    │  │  Supabase Edge Functions│ │
│  └────────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 2.3.1 Frontend Architecture

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS for utility-first responsive design
- **Routing**: React Router v6 for client-side navigation
- **State Management**: React Context API for global state (auth, cart, language)
- **Icons**: Lucide React for consistent iconography

### 2.3.2 Backend Architecture

- **Database**: PostgreSQL (managed by Supabase)
- **Authentication**: Supabase Auth (GoTrue) with JWT tokens
- **API**: Direct Supabase client queries from the browser (Row Level Security)
- **Payments**: Stripe via a Supabase Edge Function (create-payment-intent)
- **File Storage**: Supabase Storage for product images (future use)

## 2.4 Database Schema

The database consists of the following tables:

### `profiles`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, references auth.users |
| name | TEXT | User's full name |
| email | TEXT | User's email address |
| is_admin | BOOLEAN | Admin flag |
| created_at | TIMESTAMP | Account creation date |

### `products`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key, auto-increment |
| name | TEXT | Product name (French) |
| name_en | TEXT | Product name (English) |
| category | TEXT | Category (djellaba, takchita, gandoura) |
| price | NUMERIC | Current price |
| original_price | NUMERIC | Original price (for discounts) |
| image | TEXT | Image URL path |
| description | TEXT | Description (French) |
| description_en | TEXT | Description (English) |
| sizes | TEXT[] | Available sizes |
| colors | TEXT[] | Available colors |
| badge | TEXT | Badge (Bestseller, Nouveau, etc.) |
| stock | INTEGER | Stock quantity |
| created_at | TIMESTAMP | Product creation date |

### `orders`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key, auto-increment |
| user_id | UUID | References profiles.id |
| status | TEXT | pending, shipped, delivered |
| total | NUMERIC | Order total |
| address | TEXT | Shipping address |
| city | TEXT | Shipping city |
| phone | TEXT | Customer phone |
| created_at | TIMESTAMP | Order date |

### `order_items`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| order_id | BIGINT | References orders.id |
| product_id | BIGINT | References products.id |
| product_name | TEXT | Snapshot of product name |
| quantity | INTEGER | Quantity ordered |
| price | NUMERIC | Price at time of order |
| size | TEXT | Selected size |
| color | TEXT | Selected color |

### `messages`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| name | TEXT | Sender name |
| email | TEXT | Sender email |
| subject | TEXT | Message subject |
| body | TEXT | Message content |
| is_read | BOOLEAN | Read status |
| reply | TEXT | Admin reply |
| created_at | TIMESTAMP | Message date |

## 2.5 Use Case Diagram

```
                    ┌─────────────────────┐
                    │     Visitor          │
                    └────────┬────────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                 ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │ Browse       │ │ Register /   │ │ Contact      │
    │ Products     │ │ Login        │ │ via Form     │
    └──────────────┘ └──────────────┘ └──────────────┘
            │                │
            ▼                ▼
    ┌──────────────┐ ┌──────────────┐
    │ Add to Cart  │ │ View Account │
    └──────────────┘ └──────────────┘
            │
            ▼
    ┌──────────────┐ ┌──────────────┐
    │ Checkout /   │ │ Order        │
    │ Pay (Stripe) │ │ History      │
    └──────────────┘ └──────────────┘

    ┌─────────────────────┐
    │     Admin            │
    └────────┬────────────┘
             │
    ┌────────┼────────┬───────────┐
    ▼        ▼        ▼           ▼
 ┌──────┐ ┌──────┐ ┌──────┐ ┌────────┐
 │Manage│ │Manage│ │Manage│ │View    │
 │Prod. │ │Orders│ │Msgs  │ │Stats   │
 └──────┘ └──────┘ └──────┘ └────────┘
```

## 2.6 UI/UX Design

### 2.6.1 Design System

- **Color Palette**:
  - Primary: Stone (#1a1208, #44403c)
  - Accent: Amber (#d97706, #c9a84c)
  - Background: Stone-50 (#fafaf9), White (#ffffff)
  - Text: Stone-900 (#1c1917), Stone-400 (#a8a29e)

- **Typography**:
  - Headings: Playfair Display (serif, elegant)
  - Body: Raleway (sans-serif, modern)
  - Accent: Cormorant Garamond (serif, refined)

- **Component Patterns**: Rounded cards with subtle shadows, hover animations, clean grid layouts.

### 2.6.2 Page Structure

1. **Home Page**: Hero video, story section, category cards, featured products, brand values
2. **Shop Page**: Filter bar, product grid with cards, sort options
3. **Cart Page**: Item list, quantity controls, order summary
4. **Checkout Page**: Multi-step form (delivery → payment)
5. **Account Page**: Order history, account details
6. **Admin Page**: Sidebar navigation, tabbed sections (overview, stock, orders, messages, users)

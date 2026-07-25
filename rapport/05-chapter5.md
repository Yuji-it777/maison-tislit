# Chapter 5: Testing & Validation

## 5.1 Testing Strategy

Testing was performed at multiple levels to ensure the application functions correctly across all features. Given the project's scope, the testing strategy focused on:

- **Functional testing**: Verifying that each feature works as specified in the requirements.
- **Integration testing**: Ensuring frontend components work correctly with the Supabase backend.
- **Responsive testing**: Verifying the UI renders correctly on different screen sizes.
- **User acceptance testing**: Manual testing by simulating real user flows.

## 5.2 Functional Testing

### 5.2.1 Authentication

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| User registration | Fill registration form, submit | Account created, redirected | ✅ Pass |
| User login | Enter credentials, submit | Logged in, toast notification | ✅ Pass |
| Login with wrong password | Enter incorrect password | Error message displayed | ✅ Pass |
| Logout | Click logout button | Session cleared, redirected to home | ✅ Pass |
| Protected routes | Access /account while logged out | Redirected to login | ✅ Pass |

### 5.2.2 Product Browsing

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| View all products | Navigate to shop | All products displayed | ✅ Pass |
| Filter by category | Click category button | Products filtered correctly | ✅ Pass |
| Sort by price | Select sort option | Products sorted ascending/descending | ✅ Pass |
| Product details | Click product card | Modal opens with details | ✅ Pass |

### 5.2.3 Cart Operations

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| Add to cart | Click add button, logged in | Item added, toast shown | ✅ Pass |
| Add to cart (guest) | Click add button, not logged in | Modal opens for login prompt | ✅ Pass |
| Update quantity | Change quantity in cart | Total updates correctly | ✅ Pass |
| Remove item | Click remove | Item removed from cart | ✅ Pass |
| Cart persistence | Refresh page | Cart items preserved | ✅ Pass |

### 5.2.4 Checkout & Payment

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| Fill delivery form | Enter valid info | Proceed to payment step | ✅ Pass |
| Successful payment | Enter valid test card | Payment succeeds, order created | ✅ Pass |
| Failed payment | Enter declined card | Error message displayed | ✅ Pass |
| Order confirmation | After successful payment | Confirmation page shown | ✅ Pass |

### 5.2.5 Contact Form

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| Submit contact form | Fill all fields, click send | Data inserted into messages table, success toast | ✅ Pass |
| Submit with empty fields | Leave required fields blank | Browser validation prevents submission | ✅ Pass |
| Honeypot spam detection | Fill hidden _hp field programmatically | Request silently ignored | ✅ Pass |
| Rapid submission | Submit form twice in under 90s | Button disabled, cooldown shown | ✅ Pass |
| Admin views message | Navigate to admin → Messages | New submission appears in table | ✅ Pass |

### 5.2.6 Admin Dashboard

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| Create product | Fill add form, save | Product appears in table and shop | ✅ Pass |
| Edit product | Modify fields, update | Changes reflected | ✅ Pass |
| Delete product | Click delete, confirm | Product removed | ✅ Pass |
| Update order status | Click ship/deliver | Status badge updates | ✅ Pass |
| Reply to message | Type reply, send | Reply saved, status changes | ✅ Pass |

## 5.3 Responsive Testing

The application was tested on the following viewport sizes:

| Device | Width | Status |
|--------|-------|--------|
| Mobile | 375px | ✅ Renders correctly |
| Tablet | 768px | ✅ Renders correctly |
| Desktop | 1280px | ✅ Renders correctly |
| Large Desktop | 1920px | ✅ Renders correctly |

## 5.4 Security Testing

| Test Case | Result |
|-----------|--------|
| SQL injection via form inputs | ✅ Prevented by Supabase parameterized queries |
| Unauthorized admin access | ✅ Blocked by RLS policies and client-side checks |
| JWT token validation | ✅ Handled by Supabase Auth |
| Stripe payment secrets | ✅ Processed server-side via Edge Function |
| Contact form spam | ✅ Blocked by honeypot field, time check, and cooldown |

## 5.5 Known Limitations

- **Image management**: Product images are stored in the public directory rather than Supabase Storage (future improvement).
- **Real-time updates**: The app uses polling rather than Supabase real-time subscriptions for simplicity.
- **No automated tests**: Unit and integration tests were not implemented due to time constraints.
- **No search functionality**: Products can only be browsed by category, not searched by keyword.

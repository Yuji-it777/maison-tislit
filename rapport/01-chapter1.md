# Chapter 1: State of the Art & Problem Statement

## 1.1 The Moroccan Traditional Clothing Market

Moroccan traditional clothing — including the djellaba, takchita, gandoura, and caftan — represents centuries of artisanal heritage. These garments are characterized by intricate embroidery, high-quality fabrics such as silk and velvet, and designs that vary by region. The city of Fez, where Maison Tislit is rooted, remains one of the most important centers for traditional textile craftsmanship.

Despite this rich tradition, the market faces several challenges:

- **Limited online presence**: Most traditional clothing sellers operate through physical stores or social media platforms like Instagram and WhatsApp, lacking a structured e-commerce experience.
- **Fragmented customer journey**: Customers often interact across multiple channels (Instagram for discovery, WhatsApp for inquiries, bank transfers for payment) resulting in a disjointed experience.
- **Language barriers**: Many existing platforms cater primarily to French or Arabic speakers, leaving English-speaking customers underserved.

## 1.2 Existing E-commerce Solutions

Several platforms exist in the Moroccan e-commerce space:

| Solution | Type | Strengths | Limitations |
|----------|------|-----------|-------------|
| Hespax | General marketplace | Large audience | Not specialized for traditional clothing |
| Avito.ma | Classified ads | High traffic | No integrated payment or cart system |
| Instagram/Facebook Shop | Social commerce | Easy setup | Limited customization, no proper cart/checkout |
| Shopify/WooCommerce | DIY platform | Feature-rich | Generic templates, monthly fees, limited tailoring |

None of these solutions offer a dedicated, culturally tailored experience for a Moroccan traditional clothing brand with built-in multilingual support, an integrated admin dashboard, and a modern UI.

## 1.3 Problem Statement

Maison Tislit requires a custom-built e-commerce platform that:

1. Showcases traditional Moroccan clothing in a way that reflects its elegance and cultural value.
2. Provides a seamless shopping experience across French, English, and Arabic.
3. Integrates secure online payments via Stripe.
4. Includes an administrative interface for managing products, orders, and customer communications.
5. Supports user accounts with order history and favorites.
6. Delivers all functionality without recurring platform fees or restrictive templates.

## 1.4 Objectives

### Primary Objectives

- Design and develop a full-stack e-commerce website for Maison Tislit.
- Implement a responsive, modern UI that reflects the brand's identity.
- Build a secure authentication and user management system.
- Create a product catalog with categories, filtering, and sorting.
- Develop a shopping cart and checkout flow with Stripe payment integration.
- Build an admin dashboard for product and order management.

### Secondary Objectives

- Implement bilingual support (French and English) with Arabic-ready architecture.
- Add loyalty features such as favorites and order history.
- Ensure mobile responsiveness and accessibility.
- Deploy the application to a production environment.

## 1.5 Methodology

The project follows an iterative development approach:

1. **Requirements gathering**: Defining functional and non-functional requirements based on the brand's needs.
2. **Design**: System architecture, database schema, and UI/UX mockups.
3. **Implementation**: Building the frontend and backend components iteratively.
4. **Testing**: Verifying functionality, performance, and security.
5. **Deployment**: Deploying the application for production use.

## 1.6 Scope

The platform covers the following features:

- **Frontend**: Landing page, shop page, product detail modal, shopping cart, checkout flow, user account page, login/registration pages, and admin panel.
- **Backend**: PostgreSQL database, RESTful API via Supabase, authentication, and Stripe payment integration.
- **Admin**: Product CRUD operations, order management, messaging system, and user management.

Features explicitly out of scope for this version include: mobile native applications, AI-powered recommendations, and a reviews/ratings system.

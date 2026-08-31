# Threaded Roots

Threaded Roots is a traditional-modern textile e-commerce platform designed for fabric businesses that want to showcase their collections online and manage customer orders from one place.

The project combines a heritage-inspired visual identity with a modern shopping experience, inventory management, bank-transfer payment workflow, email notifications, and a protected administrator dashboard.

## Features

### Customer Storefront

* Responsive textile-focused design
* Product collections and categories
* Featured products
* Product search
* Category filtering
* Product details
* Product variants
* Product image galleries
* Shopping cart
* Quantity management
* Delivery checkout
* Pickup checkout
* Order confirmation
* Customer order tracking
* Bank-transfer payment instructions

### Payment Workflow

Threaded Roots uses a manual bank-transfer workflow.

```text
Customer places order
        ↓
Payment details displayed
        ↓
Customer makes bank transfer
        ↓
Customer selects "I've Made Payment"
        ↓
Payment awaiting verification
        ↓
Administrator verifies transfer
        ↓
Payment confirmed
        ↓
Inventory updated
        ↓
Customer receives confirmation email
```

Payments are not automatically considered successful when a customer clicks "I've Made Payment." The administrator must confirm the transfer.

### Administrator Dashboard

Administrators can manage:

* Products
* Product variants
* Product images
* Categories
* Inventory
* Orders
* Customers
* Store settings
* Bank-transfer payment information
* Payment confirmation

### Product Images

Product images are stored using Supabase Storage.

The backend controls image uploads and deletion while customers receive public product image URLs.

## Technology Stack

### Frontend

* React
* Vite
* React Router
* CSS

### Backend

* Node.js
* Express
* PostgreSQL
* JWT authentication
* bcrypt
* Nodemailer
* Multer

### Database & Storage

* Supabase PostgreSQL
* Supabase Storage

### Deployment

* Vercel — Frontend
* Render — Backend
* Supabase — Database and Storage

## Architecture

```text
                Customer Browser
                       │
                       ▼
                 Vercel Frontend
                       │
                    HTTPS
                       │
                       ▼
                 Render Backend
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
     PostgreSQL     Storage       SMTP
      Supabase      Supabase      Email
```

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Frontend

```env
VITE_API_URL=
```

### Backend

```env
PORT=
DATABASE_URL=
JWT_SECRET=
FRONTEND_URL=

SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=

SUPABASE_URL=
SUPABASE_SECRET_KEY=
```

Never commit real credentials to GitHub.

## Administrator Setup

A fresh installation can create the first administrator through:

```text
/admin/setup
```

After an administrator account exists, administrator setup is disabled.

Administrators can then sign in through:

```text
/admin/login
```

## Security

The application includes:

* JWT authentication
* Password hashing with bcrypt
* Role-based authorization
* Protected administrator routes
* Endpoint rate limiting
* CORS restrictions
* Helmet security headers
* Server-side order calculations
* Server-side inventory validation
* Protected payment confirmation
* Private customer order access tokens
* Supabase Storage access through the backend
* Server-side environment secrets

## Project Structure

```text
threaded-roots/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── config/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── vercel.json
│
└── README.md
```

## Reusable Template

Threaded Roots was built as a reusable e-commerce foundation.

The system can be adapted for:

* Textile stores
* Fashion businesses
* Handmade products
* Clothing brands
* Lifestyle stores
* Other small product-based businesses

Store information, categories, products, inventory, payment details, delivery settings, pickup information, and branding can be customized for each deployment.

## Current Project Status

The project is deployed as a portfolio/demo application.

It is not currently associated with a specific client.

Future client deployments should use the client's own production accounts for hosting, database, storage, email, domains, and payment information wherever appropriate.

## Future Improvements

Potential extensions include:

* Customer accounts
* Wishlist functionality
* Product reviews
* Advanced order tracking
* Analytics
* Additional payment providers
* Discount codes
* Custom domains
* Automated deployment workflows
* Additional staff roles
* Advanced image management

-- =========================================================
-- THREADED ROOTS DATABASE SCHEMA
-- =========================================================

-- =========================================================
-- USERS
-- Administrators and future staff accounts.
-- Customer checkout accounts are handled separately.
-- =========================================================

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    role VARCHAR(30) NOT NULL DEFAULT 'admin',

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT users_role_check
        CHECK (role IN ('admin', 'staff'))
);


-- =========================================================
-- CATEGORIES
-- Examples:
-- Ankara
-- Adire
-- Lace
-- Aso-Oke
-- =========================================================

CREATE TABLE categories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- PRODUCTS
-- A textile product may be sold by:
-- yard, meter, or piece.
-- =========================================================

CREATE TABLE products (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    category_id BIGINT
        REFERENCES categories(id)
        ON DELETE SET NULL,

    name VARCHAR(200) NOT NULL,

    description TEXT,

    price NUMERIC(12, 2) NOT NULL
        CHECK (price >= 0),

    unit VARCHAR(20) NOT NULL DEFAULT 'yard',

    material VARCHAR(100),

    pattern VARCHAR(100),

    color VARCHAR(100),

    width VARCHAR(50),

    brand VARCHAR(100),

    featured BOOLEAN NOT NULL DEFAULT FALSE,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT products_unit_check
        CHECK (
            unit IN ('yard', 'meter', 'piece')
        )
);


-- =========================================================
-- PRODUCT IMAGES
-- Images are stored in Supabase Storage.
-- image_url = public URL
-- storage_path = actual Storage path
-- =========================================================

CREATE TABLE product_images (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    product_id BIGINT NOT NULL
        REFERENCES products(id)
        ON DELETE CASCADE,

    image_url TEXT NOT NULL,

    storage_path TEXT,

    is_primary BOOLEAN NOT NULL DEFAULT FALSE,

    sort_order INTEGER NOT NULL DEFAULT 0
        CHECK (sort_order >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- PRODUCT VARIANTS
-- Useful for colours, patterns, collections, etc.
-- =========================================================

CREATE TABLE product_variants (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    product_id BIGINT NOT NULL
        REFERENCES products(id)
        ON DELETE CASCADE,

    variant_name VARCHAR(100) NOT NULL,

    variant_value VARCHAR(100) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT product_variant_unique
        UNIQUE (
            product_id,
            variant_name,
            variant_value
        )
);


-- =========================================================
-- INVENTORY
--
-- NUMERIC is intentional because textile quantities may be
-- fractional, e.g. 1.5 yards.
--
-- If a product has variants, variant_id points to the
-- corresponding variant.
--
-- If it has no variants, variant_id is NULL.
-- =========================================================

CREATE TABLE inventory (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    product_id BIGINT NOT NULL
        REFERENCES products(id)
        ON DELETE CASCADE,

    variant_id BIGINT
        REFERENCES product_variants(id)
        ON DELETE CASCADE,

    quantity NUMERIC(10, 2) NOT NULL DEFAULT 0
        CHECK (quantity >= 0),

    low_stock_threshold NUMERIC(10, 2) NOT NULL DEFAULT 5
        CHECK (low_stock_threshold >= 0),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- CUSTOMERS
--
-- We keep customers separate from admin users.
-- A future customer account can optionally be linked
-- to a user later if we decide to support customer login.
-- =========================================================

CREATE TABLE customers (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    phone VARCHAR(40) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- ORDERS
-- =========================================================

CREATE TABLE orders (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    customer_id BIGINT
        REFERENCES customers(id)
        ON DELETE SET NULL,

    customer_name VARCHAR(150) NOT NULL,

    customer_email VARCHAR(255) NOT NULL,

    customer_phone VARCHAR(40) NOT NULL,

    fulfillment_method VARCHAR(20) NOT NULL DEFAULT 'delivery',

    status VARCHAR(30) NOT NULL DEFAULT 'pending',

    payment_status VARCHAR(30) NOT NULL DEFAULT 'pending_verification',

    subtotal NUMERIC(12, 2) NOT NULL
        CHECK (subtotal >= 0),

    delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0
        CHECK (delivery_fee >= 0),

    total_amount NUMERIC(12, 2) NOT NULL
        CHECK (total_amount >= 0),

    delivery_address TEXT,

    delivery_city VARCHAR(100),

    delivery_state VARCHAR(100),

    delivery_country VARCHAR(100) DEFAULT 'Nigeria',

    delivery_postal_code VARCHAR(30),

    customer_note TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT orders_fulfillment_method_check
        CHECK (
            fulfillment_method
            IN ('delivery', 'pickup')
        ),

    CONSTRAINT orders_status_check
        CHECK (
            status IN (
                'pending',
                'processing',
                'ready',
                'dispatched',
                'delivered',
                'ready_for_pickup',
                'collected',
                'cancelled'
            )
        ),

    CONSTRAINT orders_payment_status_check
        CHECK (
            payment_status IN (
                'pending_verification',
                'confirmed',
                'failed'
            )
        ),

    CONSTRAINT orders_total_check
        CHECK (
            total_amount = subtotal + delivery_fee
        ),

    CONSTRAINT orders_delivery_address_check
        CHECK (
            fulfillment_method = 'pickup'
            OR delivery_address IS NOT NULL
        )
);


-- =========================================================
-- ORDER ITEMS
--
-- Quantity is NUMERIC because a customer may buy:
-- 1.5 yards
-- 2.25 meters
-- etc.
--
-- unit_price and unit are stored here as snapshots so
-- historical orders remain correct if the product changes.
-- =========================================================

CREATE TABLE order_items (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    order_id BIGINT NOT NULL
        REFERENCES orders(id)
        ON DELETE CASCADE,

    product_id BIGINT
        REFERENCES products(id)
        ON DELETE SET NULL,

    variant_id BIGINT
        REFERENCES product_variants(id)
        ON DELETE SET NULL,

    product_name VARCHAR(200) NOT NULL,

    variant_name VARCHAR(100),

    variant_value VARCHAR(100),

    quantity NUMERIC(10, 2) NOT NULL
        CHECK (quantity > 0),

    unit VARCHAR(20) NOT NULL,

    unit_price NUMERIC(12, 2) NOT NULL
        CHECK (unit_price >= 0),

    line_total NUMERIC(12, 2) NOT NULL
        CHECK (line_total >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT order_items_unit_check
        CHECK (
            unit IN ('yard', 'meter', 'piece')
        ),

    CONSTRAINT order_items_total_check
        CHECK (
            line_total =
            ROUND(quantity * unit_price, 2)
        )
);


-- =========================================================
-- STORE SETTINGS
-- Singleton row used for the main business configuration.
-- =========================================================

CREATE TABLE store_settings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    store_name VARCHAR(150) NOT NULL,

    tagline VARCHAR(255),

    description TEXT,

    email VARCHAR(255),

    phone VARCHAR(40),

    whatsapp VARCHAR(40),

    address TEXT,

    delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0
        CHECK (delivery_fee >= 0),

    delivery_estimate VARCHAR(150),

    pickup_location TEXT,

    pickup_hours VARCHAR(255),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT store_settings_singleton
        CHECK (id = 1)
);


-- =========================================================
-- STORE PAYMENT INFORMATION
--
-- Because this project uses manual bank transfer instead
-- of Paystack, the owner needs to manage these details.
-- =========================================================

CREATE TABLE store_payment_info (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    store_settings_id BIGINT NOT NULL UNIQUE
        REFERENCES store_settings(id)
        ON DELETE CASCADE,

    bank_name VARCHAR(150) NOT NULL,

    account_name VARCHAR(150) NOT NULL,

    account_number VARCHAR(50) NOT NULL,

    payment_instructions TEXT,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- PAYMENTS
--
-- One payment record is associated with an order.
--
-- Manual transfer workflow:
--
-- pending
--     ↓
-- customer says "I've Made Payment"
--     ↓
-- awaiting_confirmation
--     ↓
-- admin confirms
--     ↓
-- confirmed
-- =========================================================

CREATE TABLE payments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    order_id BIGINT NOT NULL UNIQUE
        REFERENCES orders(id)
        ON DELETE CASCADE,

    provider VARCHAR(30) NOT NULL DEFAULT 'bank_transfer',

    reference VARCHAR(150),

    amount NUMERIC(12, 2) NOT NULL
        CHECK (amount >= 0),

    status VARCHAR(30) NOT NULL DEFAULT 'pending',

    customer_marked_paid_at TIMESTAMPTZ,

    confirmed_at TIMESTAMPTZ,

    confirmed_by BIGINT
        REFERENCES users(id)
        ON DELETE SET NULL,

    admin_note TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT payments_provider_check
        CHECK (
            provider IN ('bank_transfer')
        ),

    CONSTRAINT payments_status_check
        CHECK (
            status IN (
                'pending',
                'awaiting_confirmation',
                'confirmed',
                'failed'
            )
        )
);


-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX idx_products_category
    ON products(category_id);

CREATE INDEX idx_products_featured
    ON products(featured);

CREATE INDEX idx_products_active
    ON products(active);

CREATE INDEX idx_product_images_product
    ON product_images(product_id);

CREATE INDEX idx_product_variants_product
    ON product_variants(product_id);

CREATE INDEX idx_inventory_product
    ON inventory(product_id);

CREATE INDEX idx_inventory_variant
    ON inventory(variant_id);

CREATE INDEX idx_orders_customer
    ON orders(customer_id);

CREATE INDEX idx_orders_status
    ON orders(status);

CREATE INDEX idx_orders_payment_status
    ON orders(payment_status);

CREATE INDEX idx_orders_created_at
    ON orders(created_at DESC);

CREATE INDEX idx_order_items_order
    ON order_items(order_id);

CREATE INDEX idx_payments_status
    ON payments(status);


-- =========================================================
-- INVENTORY UNIQUENESS
--
-- Prevent duplicate inventory records for the same
-- product/variant combination.
-- =========================================================

CREATE UNIQUE INDEX inventory_product_variant_unique
    ON inventory(product_id, variant_id)
    WHERE variant_id IS NOT NULL;

CREATE UNIQUE INDEX inventory_product_no_variant_unique
    ON inventory(product_id)
    WHERE variant_id IS NULL;


-- =========================================================
-- PRIMARY IMAGE UNIQUENESS
--
-- A product can have many images, but only one primary image.
-- =========================================================

CREATE UNIQUE INDEX product_one_primary_image
    ON product_images(product_id)
    WHERE is_primary = TRUE;


-- =========================================================
-- UPDATED_AT FUNCTION
-- =========================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;

    RETURN NEW;
END;
$$;


-- =========================================================
-- UPDATED_AT TRIGGERS
-- =========================================================

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER update_inventory_updated_at
BEFORE UPDATE ON inventory
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER update_store_settings_updated_at
BEFORE UPDATE ON store_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER update_store_payment_info_updated_at
BEFORE UPDATE ON store_payment_info
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
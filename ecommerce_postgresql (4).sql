-- ==========================================================
-- ECOMMERCE DATABASE
-- PostgreSQL 17
-- Shopee Lite - improved version
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==========================================================
-- COMMON UPDATED_AT TRIGGER
-- ==========================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================================
-- ROLES
-- ==========================================================

CREATE TABLE roles(
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name VARCHAR(30) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles(role_name)
VALUES
('Admin'),
('Seller'),
('Customer');

-- ==========================================================
-- USERS
-- ==========================================================

CREATE TABLE users(
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash TEXT NOT NULL,
    avatar TEXT,
    gender VARCHAR(10)
        CHECK(gender IS NULL OR gender IN ('MALE','FEMALE','OTHER')),
    birthday DATE,
    status VARCHAR(20)
        DEFAULT 'ACTIVE'
        CHECK(status IN ('ACTIVE','BLOCKED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ==========================================================
-- USER ROLE
-- ==========================================================

CREATE TABLE user_roles(
    user_id UUID REFERENCES users(user_id)
        ON DELETE CASCADE,
    role_id UUID REFERENCES roles(role_id)
        ON DELETE CASCADE,
    PRIMARY KEY(user_id, role_id)
);

-- ==========================================================
-- ADDRESS
-- ==========================================================

CREATE TABLE addresses(
    address_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    receiver_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    province VARCHAR(120) NOT NULL,
    district VARCHAR(120) NOT NULL,
    ward VARCHAR(120) NOT NULL,
    detail_address TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_addresses_user
ON addresses(user_id);

CREATE UNIQUE INDEX uq_addresses_one_default_per_user
ON addresses(user_id)
WHERE is_default = TRUE;

-- ==========================================================
-- SHOP
-- ==========================================================

CREATE TABLE shops(
    shop_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID UNIQUE
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    shop_name VARCHAR(150) NOT NULL,
    logo TEXT,
    description TEXT,
    rating NUMERIC(2,1)
        DEFAULT 5.0
        CHECK(rating BETWEEN 0 AND 5),
    total_followers INT
        DEFAULT 0
        CHECK(total_followers >= 0),
    status VARCHAR(20)
        DEFAULT 'ACTIVE'
        CHECK(status IN ('ACTIVE','INACTIVE','BANNED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_shops_updated_at
BEFORE UPDATE ON shops
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ==========================================================
-- SHOP FOLLOWERS
-- ==========================================================

CREATE TABLE shop_followers(
    shop_id UUID REFERENCES shops(shop_id)
        ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id)
        ON DELETE CASCADE,
    followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(shop_id, user_id)
);

-- ==========================================================
-- BRAND
-- ==========================================================

CREATE TABLE brands(
    brand_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_name VARCHAR(120) UNIQUE NOT NULL,
    logo TEXT,
    description TEXT
);

-- ==========================================================
-- CATEGORY
-- ==========================================================

CREATE TABLE categories(
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID
        REFERENCES categories(category_id)
        ON DELETE SET NULL,
    category_name VARCHAR(150) NOT NULL,
    image TEXT,
    description TEXT,
    status VARCHAR(20)
        DEFAULT 'ACTIVE'
        CHECK(status IN ('ACTIVE','INACTIVE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_category_parent
ON categories(parent_id);

-- ==========================================================
-- PRODUCT
-- ==========================================================

CREATE TABLE products(
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL
        REFERENCES shops(shop_id),
    brand_id UUID
        REFERENCES brands(brand_id),
    category_id UUID
        REFERENCES categories(category_id),
    product_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    thumbnail TEXT,
    status VARCHAR(20)
        DEFAULT 'ACTIVE'
        CHECK(status IN ('ACTIVE','INACTIVE','BANNED','OUT_OF_STOCK')),
    average_rating NUMERIC(2,1)
        DEFAULT 0
        CHECK(average_rating BETWEEN 0 AND 5),
    review_count INT
        DEFAULT 0
        CHECK(review_count >= 0),
    sold_quantity INT
        DEFAULT 0
        CHECK(sold_quantity >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_shop
ON products(shop_id);

CREATE INDEX idx_product_category
ON products(category_id);

CREATE INDEX idx_product_brand
ON products(brand_id);

CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ==========================================================
-- PRODUCT IMAGES
-- ==========================================================

CREATE TABLE product_images(
    image_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL
        REFERENCES products(product_id)
        ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INT DEFAULT 1 CHECK(display_order > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_images_product
ON product_images(product_id);

-- ==========================================================
-- ATTRIBUTES
-- Examples: Color, Size, RAM, Storage
-- ==========================================================

CREATE TABLE attributes(
    attribute_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attribute_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE attribute_values(
    value_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attribute_id UUID NOT NULL
        REFERENCES attributes(attribute_id)
        ON DELETE CASCADE,
    value_name VARCHAR(100) NOT NULL,
    UNIQUE(attribute_id, value_name)
);

CREATE INDEX idx_attribute_values_attribute
ON attribute_values(attribute_id);

-- ==========================================================
-- PRODUCT VARIANTS (SKU)
-- Inventory is stored in inventory table only.
-- ==========================================================

CREATE TABLE product_variants(
    variant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL
        REFERENCES products(product_id)
        ON DELETE CASCADE,
    sku VARCHAR(80) UNIQUE NOT NULL,
    price NUMERIC(12,2) NOT NULL
        CHECK(price >= 0),
    original_price NUMERIC(12,2)
        CHECK(original_price IS NULL OR original_price >= price),
    weight NUMERIC(8,2)
        CHECK(weight IS NULL OR weight >= 0),
    status VARCHAR(20)
        DEFAULT 'ACTIVE'
        CHECK(status IN ('ACTIVE','INACTIVE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_variant_product
ON product_variants(product_id);

CREATE TRIGGER trg_product_variants_updated_at
BEFORE UPDATE ON product_variants
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE variant_attribute_values(
    variant_id UUID
        REFERENCES product_variants(variant_id)
        ON DELETE CASCADE,
    value_id UUID
        REFERENCES attribute_values(value_id)
        ON DELETE CASCADE,
    PRIMARY KEY(variant_id, value_id)
);

-- ==========================================================
-- INVENTORY
-- ==========================================================

CREATE TABLE inventory(
    inventory_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID UNIQUE
        REFERENCES product_variants(variant_id)
        ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK(quantity >= 0),
    CHECK(reserved_quantity >= 0),
    CHECK(reserved_quantity <= quantity)
);

CREATE TRIGGER trg_inventory_updated_at
BEFORE UPDATE ON inventory
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ==========================================================
-- CART
-- ==========================================================

CREATE TABLE carts(
    cart_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_carts_updated_at
BEFORE UPDATE ON carts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE cart_items(
    cart_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL
        REFERENCES carts(cart_id)
        ON DELETE CASCADE,
    variant_id UUID NOT NULL
        REFERENCES product_variants(variant_id),
    quantity INT NOT NULL
        CHECK(quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cart_id, variant_id)
);

CREATE INDEX idx_cart_items_cart
ON cart_items(cart_id);

-- ==========================================================
-- WISHLISTS AND VIEWS
-- ==========================================================

CREATE TABLE wishlists(
    wishlist_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    product_id UUID NOT NULL
        REFERENCES products(product_id)
        ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

CREATE TABLE product_views(
    view_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID
        REFERENCES users(user_id)
        ON DELETE SET NULL,
    product_id UUID
        REFERENCES products(product_id)
        ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_views_product
ON product_views(product_id);

CREATE INDEX idx_product_views_user
ON product_views(user_id);

-- ==========================================================
-- PAYMENT AND SHIPPING METHODS
-- ==========================================================

CREATE TABLE payment_methods(
    payment_method_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    method_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO payment_methods(method_name)
VALUES
('COD'),
('VNPay'),
('MoMo'),
('PayPal'),
('Stripe');

CREATE TABLE shipping_methods(
    shipping_method_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    method_name VARCHAR(100) UNIQUE NOT NULL,
    shipping_fee NUMERIC(12,2) DEFAULT 0 CHECK(shipping_fee >= 0),
    estimated_days INT CHECK(estimated_days IS NULL OR estimated_days > 0),
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO shipping_methods(method_name, shipping_fee)
VALUES
('Standard', 30000),
('Fast', 50000),
('Express', 80000);

-- ==========================================================
-- VOUCHERS
-- ==========================================================

CREATE TABLE vouchers(
    voucher_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID
        REFERENCES shops(shop_id)
        ON DELETE CASCADE,
    voucher_code VARCHAR(50) UNIQUE NOT NULL,
    voucher_name VARCHAR(150) NOT NULL,
    discount_type VARCHAR(20) NOT NULL
        CHECK(discount_type IN ('PERCENT','FIXED')),
    discount_value NUMERIC(12,2) NOT NULL
        CHECK(discount_value > 0),
    max_discount NUMERIC(12,2)
        CHECK(max_discount IS NULL OR max_discount >= 0),
    min_order_amount NUMERIC(12,2) DEFAULT 0
        CHECK(min_order_amount >= 0),
    usage_limit INT
        CHECK(usage_limit IS NULL OR usage_limit >= 0),
    used_count INT DEFAULT 0
        CHECK(used_count >= 0),
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NOT NULL,
    status VARCHAR(20)
        DEFAULT 'ACTIVE'
        CHECK(status IN ('ACTIVE','INACTIVE','EXPIRED')),
    CHECK(end_at > start_at),
    CHECK(discount_type <> 'PERCENT' OR discount_value <= 100),
    CHECK(usage_limit IS NULL OR used_count <= usage_limit)
);

CREATE INDEX idx_vouchers_shop
ON vouchers(shop_id);

-- ==========================================================
-- ORDERS
-- ==========================================================

CREATE TABLE orders(
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code VARCHAR(30) UNIQUE NOT NULL,
    user_id UUID NOT NULL
        REFERENCES users(user_id),
    address_id UUID
        REFERENCES addresses(address_id),
    payment_method_id UUID
        REFERENCES payment_methods(payment_method_id),
    shipping_method_id UUID
        REFERENCES shipping_methods(shipping_method_id),
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0
        CHECK(subtotal >= 0),
    shipping_fee NUMERIC(12,2) DEFAULT 0
        CHECK(shipping_fee >= 0),
    discount NUMERIC(12,2) DEFAULT 0
        CHECK(discount >= 0),
    total_amount NUMERIC(12,2) NOT NULL
        CHECK(total_amount >= 0),
    note TEXT,
    order_status VARCHAR(30)
        DEFAULT 'PENDING'
        CHECK(order_status IN
        (
            'PENDING',
            'CONFIRMED',
            'PACKING',
            'SHIPPING',
            'COMPLETED',
            'CANCELLED',
            'RETURNED'
        )),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK(total_amount = subtotal + shipping_fee - discount)
);

CREATE INDEX idx_orders_user
ON orders(user_id);

CREATE INDEX idx_orders_status
ON orders(order_status);

CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE order_vouchers(
    order_id UUID
        REFERENCES orders(order_id)
        ON DELETE CASCADE,
    voucher_id UUID
        REFERENCES vouchers(voucher_id),
    discount_amount NUMERIC(12,2) NOT NULL
        CHECK(discount_amount >= 0),
    PRIMARY KEY(order_id, voucher_id)
);

-- One order can be split into shop-level packages.
CREATE TABLE order_shop_groups(
    order_shop_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL
        REFERENCES orders(order_id)
        ON DELETE CASCADE,
    shop_id UUID NOT NULL
        REFERENCES shops(shop_id),
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0
        CHECK(subtotal >= 0),
    shipping_fee NUMERIC(12,2) DEFAULT 0
        CHECK(shipping_fee >= 0),
    discount NUMERIC(12,2) DEFAULT 0
        CHECK(discount >= 0),
    total_amount NUMERIC(12,2) NOT NULL
        CHECK(total_amount >= 0),
    group_status VARCHAR(30)
        DEFAULT 'PENDING'
        CHECK(group_status IN
        (
            'PENDING',
            'CONFIRMED',
            'PACKING',
            'SHIPPING',
            'COMPLETED',
            'CANCELLED',
            'RETURNED'
        )),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(order_shop_id, order_id),
    UNIQUE(order_id, shop_id),
    CHECK(total_amount = subtotal + shipping_fee - discount)
);

CREATE INDEX idx_order_shop_groups_order
ON order_shop_groups(order_id);

CREATE INDEX idx_order_shop_groups_shop
ON order_shop_groups(shop_id);

CREATE TRIGGER trg_order_shop_groups_updated_at
BEFORE UPDATE ON order_shop_groups
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE order_items(
    order_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL
        REFERENCES orders(order_id)
        ON DELETE CASCADE,
    order_shop_id UUID NOT NULL
        REFERENCES order_shop_groups(order_shop_id)
        ON DELETE CASCADE,
    variant_id UUID NOT NULL
        REFERENCES product_variants(variant_id),
    quantity INT NOT NULL
        CHECK(quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL
        CHECK(unit_price >= 0),
    discount NUMERIC(12,2) DEFAULT 0
        CHECK(discount >= 0),
    subtotal NUMERIC(12,2) NOT NULL
        CHECK(subtotal >= 0),
    FOREIGN KEY(order_shop_id, order_id)
        REFERENCES order_shop_groups(order_shop_id, order_id)
        ON DELETE CASCADE,
    CHECK(subtotal = quantity * unit_price - discount)
);

CREATE INDEX idx_order_items_order
ON order_items(order_id);

CREATE INDEX idx_order_items_order_shop
ON order_items(order_shop_id);

-- ==========================================================
-- REVIEWS
-- ==========================================================

CREATE TABLE product_reviews(
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    product_id UUID NOT NULL
        REFERENCES products(product_id)
        ON DELETE CASCADE,
    order_item_id UUID UNIQUE
        REFERENCES order_items(order_item_id)
        ON DELETE SET NULL,
    rating INT NOT NULL
        CHECK(rating BETWEEN 1 AND 5),
    comment TEXT,
    status VARCHAR(20)
        DEFAULT 'VISIBLE'
        CHECK(status IN ('VISIBLE','HIDDEN')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id, order_item_id)
);

CREATE INDEX idx_product_reviews_product
ON product_reviews(product_id);

CREATE TRIGGER trg_product_reviews_updated_at
BEFORE UPDATE ON product_reviews
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ==========================================================
-- ORDER STATUS HISTORY
-- ==========================================================

CREATE TABLE order_status_history(
    history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL
        REFERENCES orders(order_id)
        ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL
        CHECK(status IN
        (
            'PENDING',
            'CONFIRMED',
            'PACKING',
            'SHIPPING',
            'COMPLETED',
            'CANCELLED',
            'RETURNED'
        )),
    note TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_history_order
ON order_status_history(order_id);

-- ==========================================================
-- PAYMENTS
-- ==========================================================

CREATE TABLE payments(
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE
        REFERENCES orders(order_id)
        ON DELETE CASCADE,
    transaction_code VARCHAR(150),
    amount NUMERIC(12,2) NOT NULL
        CHECK(amount >= 0),
    payment_status VARCHAR(20)
        DEFAULT 'PENDING'
        CHECK(payment_status IN
        (
            'PENDING',
            'SUCCESS',
            'FAILED',
            'REFUNDED'
        )),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- SHIPMENTS
-- ==========================================================

CREATE TABLE shipments(
    shipment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_shop_id UUID UNIQUE
        REFERENCES order_shop_groups(order_shop_id)
        ON DELETE CASCADE,
    tracking_number VARCHAR(100) UNIQUE,
    carrier VARCHAR(100),
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    shipment_status VARCHAR(30)
        DEFAULT 'PREPARING'
        CHECK(shipment_status IN
        (
            'PREPARING',
            'SHIPPING',
            'DELIVERED',
            'FAILED',
            'RETURNED'
        ))
);

CREATE INDEX idx_shipments_tracking
ON shipments(tracking_number);

-- ==========================================================
-- RETURNS AND REFUNDS
-- ==========================================================

CREATE TABLE return_requests(
    return_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL
        REFERENCES order_items(order_item_id),
    user_id UUID NOT NULL
        REFERENCES users(user_id),
    reason TEXT NOT NULL,
    return_status VARCHAR(30)
        DEFAULT 'REQUESTED'
        CHECK(return_status IN
        (
            'REQUESTED',
            'APPROVED',
            'REJECTED',
            'RETURNING',
            'RECEIVED',
            'REFUNDED'
        )),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_return_requests_updated_at
BEFORE UPDATE ON return_requests
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE refunds(
    refund_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id UUID UNIQUE
        REFERENCES return_requests(return_id)
        ON DELETE CASCADE,
    payment_id UUID
        REFERENCES payments(payment_id),
    amount NUMERIC(12,2) NOT NULL
        CHECK(amount >= 0),
    refund_status VARCHAR(20)
        DEFAULT 'PENDING'
        CHECK(refund_status IN ('PENDING','SUCCESS','FAILED')),
    refunded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- AUDIT LOGS
-- ==========================================================

CREATE TABLE audit_logs(
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID
        REFERENCES users(user_id)
        ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user
ON audit_logs(user_id);

-- ==========================================================
-- NOTIFICATIONS
-- ==========================================================

CREATE TABLE notifications(
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    notification_type VARCHAR(50)
        DEFAULT 'SYSTEM',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user
ON notifications(user_id);

-- ==========================================================
-- BANNERS AND PROMOTIONAL CONTENT
-- ==========================================================

CREATE TABLE banners(
    banner_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    image TEXT,
    target_url TEXT,
    priority INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    start_at TIMESTAMP,
    end_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- FLASH SALES
-- ==========================================================

CREATE TABLE flash_sales(
    flash_sale_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    badge VARCHAR(100),
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NOT NULL,
    status VARCHAR(20)
        DEFAULT 'ACTIVE'
        CHECK(status IN ('ACTIVE','INACTIVE','EXPIRED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE flash_sale_items(
    flash_sale_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flash_sale_id UUID NOT NULL
        REFERENCES flash_sales(flash_sale_id)
        ON DELETE CASCADE,
    variant_id UUID NOT NULL
        REFERENCES product_variants(variant_id)
        ON DELETE CASCADE,
    sale_price NUMERIC(12,2) NOT NULL
        CHECK(sale_price >= 0),
    max_quantity INT
        CHECK(max_quantity >= 0),
    sold_quantity INT DEFAULT 0
        CHECK(sold_quantity >= 0)
);

CREATE INDEX idx_flash_sale_items_variant
ON flash_sale_items(variant_id);

-- ==========================================================
-- PRODUCT PROMOTIONS + COMBO
-- ==========================================================

CREATE TABLE product_promotions(
    promotion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL
        REFERENCES shops(shop_id)
        ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    promotion_type VARCHAR(30) NOT NULL
        CHECK(promotion_type IN ('DISCOUNT','BUNDLE','FLASH_SALE','COUPON')),
    description TEXT,
    discount_pct NUMERIC(5,2)
        CHECK(discount_pct >= 0 AND discount_pct <= 100),
    discount_amount NUMERIC(12,2)
        CHECK(discount_amount >= 0),
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE promotion_products(
    promotion_id UUID NOT NULL
        REFERENCES product_promotions(promotion_id)
        ON DELETE CASCADE,
    product_id UUID NOT NULL
        REFERENCES products(product_id)
        ON DELETE CASCADE,
    variant_id UUID
        REFERENCES product_variants(variant_id)
        ON DELETE CASCADE,
    bundle_price NUMERIC(12,2),
    PRIMARY KEY(promotion_id, product_id)
);

-- ==========================================================
-- PRODUCT BUNDLES
-- ==========================================================

CREATE TABLE product_bundles(
    bundle_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL
        REFERENCES shops(shop_id)
        ON DELETE CASCADE,
    bundle_name VARCHAR(200) NOT NULL,
    description TEXT,
    bundle_price NUMERIC(12,2) NOT NULL
        CHECK(bundle_price >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    start_at TIMESTAMP,
    end_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bundle_items(
    bundle_id UUID NOT NULL
        REFERENCES product_bundles(bundle_id)
        ON DELETE CASCADE,
    variant_id UUID NOT NULL
        REFERENCES product_variants(variant_id)
        ON DELETE CASCADE,
    quantity INT NOT NULL
        CHECK(quantity > 0),
    PRIMARY KEY(bundle_id, variant_id)
);

-- ==========================================================
-- CHAT AND AUTO-REPLY
-- ==========================================================

CREATE TABLE chat_threads(
    thread_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL
        REFERENCES shops(shop_id)
        ON DELETE CASCADE,
    user_id UUID NOT NULL
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    order_id UUID
        REFERENCES orders(order_id)
        ON DELETE SET NULL,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_threads_shop
ON chat_threads(shop_id);

CREATE TABLE chat_messages(
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL
        REFERENCES chat_threads(thread_id)
        ON DELETE CASCADE,
    sender_id UUID
        REFERENCES users(user_id)
        ON DELETE SET NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auto_replies(
    auto_reply_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL
        REFERENCES shops(shop_id)
        ON DELETE CASCADE,
    trigger_text VARCHAR(255) NOT NULL,
    response_text TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- PRODUCT REVIEW IMAGES
-- ==========================================================

CREATE TABLE product_review_images(
    review_image_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL
        REFERENCES product_reviews(review_id)
        ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

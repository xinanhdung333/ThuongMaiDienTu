import {
  User, Address, Shop, Brand, Category, Product, ProductImage, ProductVariant, Inventory,
  CartItem, WishlistItem, PaymentMethod, ShippingMethod, Voucher, Order, OrderShopGroup,
  OrderItem, ProductReview, OrderStatusHistory, Payment, Shipment, ReturnRequest, Refund,
  ProductWithDetails, CartItemWithDetails, OrderWithDetails, ProductReviewWithUser, UserRole,
  OrderShopGroupWithDetails
} from '@/types';

// Helper to generate UUIDs
const generateId = (): string => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Keys for LocalStorage
const KEYS = {
  INVENTORY_HISTORY: 'lumina_inventory_history',
  USERS: 'lumina_users',
  ADDRESSES: 'lumina_addresses',
  SHOPS: 'lumina_shops',
  BRANDS: 'lumina_brands',
  CATEGORIES: 'lumina_categories',
  PRODUCTS: 'lumina_products',
  PRODUCT_IMAGES: 'lumina_product_images',
  VARIANTS: 'lumina_variants',
  INVENTORY: 'lumina_inventory',
  CART_ITEMS: 'lumina_cart_items',
  WISHLIST: 'lumina_wishlist',
  VOUCHERS: 'lumina_vouchers',
  ORDERS: 'lumina_orders',
  ORDER_GROUPS: 'lumina_order_groups',
  ORDER_ITEMS: 'lumina_order_items',
  ORDER_HISTORY: 'lumina_order_history',
  PAYMENTS: 'lumina_payments',
  SHIPMENTS: 'lumina_shipments',
  REVIEWS: 'lumina_reviews',
  CURRENT_USER_ID: 'lumina_current_user_id',
  NOTIFICATIONS: 'lumina_notifications'
};


// SEED DATA DECLARATIONS
const seedCategories: Category[] = [
  { category_id: 'cat-1', category_name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80', status: 'ACTIVE', created_at: new Date().toISOString() },
  { category_id: 'cat-2', category_name: 'Fashion & Apparel', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80', status: 'ACTIVE', created_at: new Date().toISOString() },
  { category_id: 'cat-3', category_name: 'Beauty & Cosmetics', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80', status: 'ACTIVE', created_at: new Date().toISOString() },
  { category_id: 'cat-4', category_name: 'Home & Living', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&q=80', status: 'ACTIVE', created_at: new Date().toISOString() },
  { category_id: 'cat-5', category_name: 'Sports & Outdoors', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80', status: 'ACTIVE', created_at: new Date().toISOString() },
  { category_id: 'cat-6', category_name: 'Books & Stationery', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80', status: 'ACTIVE', created_at: new Date().toISOString() },
];

const seedBrands: Brand[] = [
  { brand_id: 'brand-1', brand_name: 'Lumina Tech', logo: '', description: 'Premium electronic accessories' },
  { brand_id: 'brand-2', brand_name: 'VibeFit', logo: '', description: 'Activewear and sports garments' },
  { brand_id: 'brand-3', brand_name: 'GlowUp Cosmetics', logo: '', description: 'Organic skincare and beauty products' },
  { brand_id: 'brand-4', brand_name: 'CasaDesign', logo: '', description: 'Scandi-inspired home decor' },
  { brand_id: 'brand-5', brand_name: 'Aura', logo: '', description: 'Premium lifestyle brand' },
];

const seedShops: Shop[] = [
  {
    shop_id: 'shop-1',
    owner_id: 'user-seller',
    shop_name: 'Lumina Official Store',
    logo: 'https://images.unsplash.com/photo-1516841273335-e39b37888115?w=150&q=80',
    description: 'Welcome to the official Lumina Store. We specialize in cutting edge, beautifully designed products.',
    rating: 4.8,
    total_followers: 12400,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    shop_id: 'shop-2',
    owner_id: 'user-seller-2',
    shop_name: 'VibeFit Apparel Shop',
    logo: 'https://images.unsplash.com/photo-1518002171953-a080ee81be25?w=150&q=80',
    description: 'High performance activewear designed for style and durability.',
    rating: 4.6,
    total_followers: 5300,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    shop_id: 'shop-3',
    owner_id: 'user-seller-3',
    shop_name: 'GlowUp Skincare Lab',
    logo: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=150&q=80',
    description: 'Clean organic cosmetics. Unleash your natural beauty.',
    rating: 4.9,
    total_followers: 8900,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const seedUsers: User[] = [
  {
    user_id: 'user-admin',
    full_name: 'Lumina Administrator',
    email: 'admin@lumina.com',
    phone: '0987654321',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    gender: 'MALE',
    status: 'ACTIVE',
    roles: ['Admin', 'Customer'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    user_id: 'user-seller',
    full_name: 'Alex Mercer (Lumina Seller)',
    email: 'seller@lumina.com',
    phone: '0912345678',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    gender: 'MALE',
    status: 'ACTIVE',
    roles: ['Seller', 'Customer'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    user_id: 'user-buyer',
    full_name: 'Emma Watson (Default Buyer)',
    email: 'buyer@lumina.com',
    phone: '0901234567',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    gender: 'FEMALE',
    status: 'ACTIVE',
    roles: ['Customer'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const seedAddresses: Address[] = [
  {
    address_id: 'addr-1',
    user_id: 'user-buyer',
    receiver_name: 'Emma Watson',
    phone: '0901234567',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    detail_address: '120 Lê Lợi, Tòa nhà Lumina, Tầng 5',
    is_default: true,
    created_at: new Date().toISOString()
  },
  {
    address_id: 'addr-2',
    user_id: 'user-buyer',
    receiver_name: 'Emma Watson (Home)',
    phone: '0901234567',
    province: 'Hà Nội',
    district: 'Quận Hoàn Kiếm',
    ward: 'Phường Tràng Tiền',
    detail_address: '45 Lý Thường Kiệt',
    is_default: false,
    created_at: new Date().toISOString()
  }
];

const seedProducts: Product[] = [
  // Shop 1 Electronics
  {
    product_id: 'prod-1',
    shop_id: 'shop-1',
    brand_id: 'brand-1',
    category_id: 'cat-1',
    product_name: 'Lumina Pro Wireless Mechanical Keyboard',
    slug: 'lumina-pro-wireless-mechanical-keyboard',
    description: 'A premium 75% mechanical keyboard with customizable RGB backlighting, hot-swappable switches, and triple-mode connectivity (Bluetooth, 2.4GHz wireless, USB-C). Ergonomic design with dye-sub keycaps for a satisfying typing experience.',
    thumbnail: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80',
    status: 'ACTIVE',
    average_rating: 4.8,
    review_count: 142,
    sold_quantity: 480,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    product_id: 'prod-2',
    shop_id: 'shop-1',
    brand_id: 'brand-1',
    category_id: 'cat-1',
    product_name: 'Lumina Arc ANC Wireless Headphones',
    slug: 'lumina-arc-anc-wireless-headphones',
    description: 'Immerse yourself in pure high-fidelity sound. Features Active Noise Cancellation, 40-hour battery life, quick charging (10 mins for 5 hours), and ultra-soft memory foam earcups for all-day comfort.',
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    status: 'ACTIVE',
    average_rating: 4.7,
    review_count: 98,
    sold_quantity: 320,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    product_id: 'prod-3',
    shop_id: 'shop-1',
    brand_id: 'brand-1',
    category_id: 'cat-1',
    product_name: 'Lumina Glide Ergonomic Wireless Mouse',
    slug: 'lumina-glide-ergonomic-wireless-mouse',
    description: 'Precision tracking on any surface, including glass. Features a natural ergonomic grip, silent clicks, side scrolls, and custom programming keys to speed up your workflow.',
    thumbnail: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80',
    status: 'ACTIVE',
    average_rating: 4.6,
    review_count: 73,
    sold_quantity: 210,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // Shop 2 Fashion
  {
    product_id: 'prod-4',
    shop_id: 'shop-2',
    brand_id: 'brand-2',
    category_id: 'cat-2',
    product_name: 'VibeFit Breathe Tech Running Tee',
    slug: 'vibefit-breathe-tech-running-tee',
    description: 'Ultra-lightweight running t-shirt engineered with micro-mesh breathability, moisture-wicking technology, and flat-lock stitching to prevent chafing on long active sessions.',
    thumbnail: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80',
    status: 'ACTIVE',
    average_rating: 4.5,
    review_count: 55,
    sold_quantity: 190,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    product_id: 'prod-5',
    shop_id: 'shop-2',
    brand_id: 'brand-2',
    category_id: 'cat-2',
    product_name: 'VibeFit Pro Compression Joggers',
    slug: 'vibefit-pro-compression-joggers',
    description: 'Modern athletic joggers offering a tapered fit with 4-way stretch fabric. Includes double side-zip phone pockets, an elastic waistband, and reflective ankle strips for night jogs.',
    thumbnail: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&q=80',
    status: 'ACTIVE',
    average_rating: 4.4,
    review_count: 42,
    sold_quantity: 110,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // Shop 3 Beauty
  {
    product_id: 'prod-6',
    shop_id: 'shop-3',
    brand_id: 'brand-3',
    category_id: 'cat-3',
    product_name: 'GlowUp Hyaluronic Acid Hydrating Serum',
    slug: 'glowup-hyaluronic-acid-hydrating-serum',
    description: 'Drench your skin with deep hydration. Formulated with pure botanical hyaluronic acid, vitamin B5, and soothing chamomile extract to restore plumpness and glow to dry skin.',
    thumbnail: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
    status: 'ACTIVE',
    average_rating: 4.9,
    review_count: 230,
    sold_quantity: 750,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    product_id: 'prod-7',
    shop_id: 'shop-3',
    brand_id: 'brand-3',
    category_id: 'cat-3',
    product_name: 'GlowUp Matte Mineral Sunscreen SPF 50',
    slug: 'glowup-matte-mineral-sunscreen-spf-50',
    description: 'Broad-spectrum UVA/UVB physical protection with zinc oxide. Leaves a smooth, matte finish that functions beautifully under makeup without leaving any white cast.',
    thumbnail: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&q=80',
    status: 'ACTIVE',
    average_rating: 4.8,
    review_count: 168,
    sold_quantity: 520,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // Shop 1 Home & Living
  {
    product_id: 'prod-8',
    shop_id: 'shop-1',
    brand_id: 'brand-4',
    category_id: 'cat-4',
    product_name: 'CasaDesign Nordic Ceramic Flower Vase',
    slug: 'casadesign-nordic-ceramic-flower-vase',
    description: 'A beautiful minimalist ceramic vase displaying clean geometric contours. The perfect decor piece for Pampas grass, dry branches, or fresh cut flowers to enhance your living room styling.',
    thumbnail: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&q=80',
    status: 'ACTIVE',
    average_rating: 4.5,
    review_count: 36,
    sold_quantity: 85,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const seedProductImages: ProductImage[] = [
  // Keyboard Images
  { image_id: 'img-1-1', product_id: 'prod-1', image_url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80', display_order: 1, created_at: new Date().toISOString() },
  { image_id: 'img-1-2', product_id: 'prod-1', image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', display_order: 2, created_at: new Date().toISOString() },
  { image_id: 'img-1-3', product_id: 'prod-1', image_url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80', display_order: 3, created_at: new Date().toISOString() },

  // Headphones
  { image_id: 'img-2-1', product_id: 'prod-2', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', display_order: 1, created_at: new Date().toISOString() },
  { image_id: 'img-2-2', product_id: 'prod-2', image_url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80', display_order: 2, created_at: new Date().toISOString() },

  // Mouse
  { image_id: 'img-3-1', product_id: 'prod-3', image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80', display_order: 1, created_at: new Date().toISOString() },

  // T-Shirt
  { image_id: 'img-4-1', product_id: 'prod-4', image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80', display_order: 1, created_at: new Date().toISOString() },
  { image_id: 'img-4-2', product_id: 'prod-4', image_url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80', display_order: 2, created_at: new Date().toISOString() },

  // Joggers
  { image_id: 'img-5-1', product_id: 'prod-5', image_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80', display_order: 1, created_at: new Date().toISOString() },

  // Skincare Hydrator
  { image_id: 'img-6-1', product_id: 'prod-6', image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80', display_order: 1, created_at: new Date().toISOString() },
  { image_id: 'img-6-2', product_id: 'prod-6', image_url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&q=80', display_order: 2, created_at: new Date().toISOString() },

  // Sunscreen
  { image_id: 'img-7-1', product_id: 'prod-7', image_url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80', display_order: 1, created_at: new Date().toISOString() },

  // Vase
  { image_id: 'img-8-1', product_id: 'prod-8', image_url: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800&q=80', display_order: 1, created_at: new Date().toISOString() }
];

const seedVariants: ProductVariant[] = [
  // Keyboard: Blue Switch, Brown Switch
  {
    variant_id: 'var-1-1',
    product_id: 'prod-1',
    sku: 'SKU-KBD-BLUE',
    price: 1450000,
    original_price: 1800000,
    weight: 950,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attributeValues: [
      { attribute_name: 'Switch Type', value_name: 'Clicky Blue', value_id: 'val-sw-blue' },
      { attribute_name: 'Color Theme', value_name: 'Carbon Slate', value_id: 'val-col-carbon' }
    ]
  },
  {
    variant_id: 'var-1-2',
    product_id: 'prod-1',
    sku: 'SKU-KBD-BROWN',
    price: 1450000,
    original_price: 1800000,
    weight: 950,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attributeValues: [
      { attribute_name: 'Switch Type', value_name: 'Tactile Brown', value_id: 'val-sw-brown' },
      { attribute_name: 'Color Theme', value_name: 'Carbon Slate', value_id: 'val-col-carbon' }
    ]
  },
  {
    variant_id: 'var-1-3',
    product_id: 'prod-1',
    sku: 'SKU-KBD-WHITE-BROWN',
    price: 1550000,
    original_price: 1900000,
    weight: 950,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attributeValues: [
      { attribute_name: 'Switch Type', value_name: 'Tactile Brown', value_id: 'val-sw-brown' },
      { attribute_name: 'Color Theme', value_name: 'Chalk White', value_id: 'val-col-white' }
    ]
  },

  // Headphones: Charcoal Black, Chalk White
  {
    variant_id: 'var-2-1',
    product_id: 'prod-2',
    sku: 'SKU-HP-BLACK',
    price: 2890000,
    original_price: 3500000,
    weight: 280,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attributeValues: [
      { attribute_name: 'Color', value_name: 'Charcoal Black', value_id: 'val-color-black' }
    ]
  },
  {
    variant_id: 'var-2-2',
    product_id: 'prod-2',
    sku: 'SKU-HP-WHITE',
    price: 2990000,
    original_price: 3600000,
    weight: 280,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attributeValues: [
      { attribute_name: 'Color', value_name: 'Chalk White', value_id: 'val-color-white' }
    ]
  },

  // Mouse: Graphite Grey
  {
    variant_id: 'var-3-1',
    product_id: 'prod-3',
    sku: 'SKU-MS-GREY',
    price: 890000,
    original_price: 1100000,
    weight: 95,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attributeValues: [
      { attribute_name: 'Color', value_name: 'Graphite Grey', value_id: 'val-color-grey' }
    ]
  },

  // Running Tee: Red (M/L), Black (M/L)
  {
    variant_id: 'var-4-1',
    product_id: 'prod-4',
    sku: 'SKU-TEE-RED-M',
    price: 250000,
    original_price: 320000,
    weight: 120,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attributeValues: [
      { attribute_name: 'Color', value_name: 'Crimson Red', value_id: 'val-color-red' },
      { attribute_name: 'Size', value_name: 'Medium', value_id: 'val-size-m' }
    ]
  },
  {
    variant_id: 'var-4-2',
    product_id: 'prod-4',
    sku: 'SKU-TEE-RED-L',
    price: 250000,
    original_price: 320000,
    weight: 130,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attributeValues: [
      { attribute_name: 'Color', value_name: 'Crimson Red', value_id: 'val-color-red' },
      { attribute_name: 'Size', value_name: 'Large', value_id: 'val-size-l' }
    ]
  },
  {
    variant_id: 'var-4-3',
    product_id: 'prod-4',
    sku: 'SKU-TEE-BLK-M',
    price: 250000,
    original_price: 320000,
    weight: 120,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attributeValues: [
      { attribute_name: 'Color', value_name: 'Midnight Black', value_id: 'val-color-blk' },
      { attribute_name: 'Size', value_name: 'Medium', value_id: 'val-size-m' }
    ]
  },

  // Joggers: Dark Grey (M/L)
  {
    variant_id: 'var-5-1',
    product_id: 'prod-5',
    sku: 'SKU-JOG-GREY-M',
    price: 490000,
    original_price: 650000,
    weight: 350,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attributeValues: [
      { attribute_name: 'Color', value_name: 'Dark Grey', value_id: 'val-color-dgrey' },
      { attribute_name: 'Size', value_name: 'Medium', value_id: 'val-size-m' }
    ]
  },
  {
    variant_id: 'var-5-2',
    product_id: 'prod-5',
    sku: 'SKU-JOG-GREY-L',
    price: 490000,
    original_price: 650000,
    weight: 360,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attributeValues: [
      { attribute_name: 'Color', value_name: 'Dark Grey', value_id: 'val-color-dgrey' },
      { attribute_name: 'Size', value_name: 'Large', value_id: 'val-size-l' }
    ]
  },

  // Hydrating Serum: 30ml, 50ml
  {
    variant_id: 'var-6-1',
    product_id: 'prod-6',
    sku: 'SKU-SRM-30ML',
    price: 320000,
    original_price: 390000,
    weight: 50,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attributeValues: [
      { attribute_name: 'Volume', value_name: '30ml Bottles', value_id: 'val-vol-30' }
    ]
  },
  {
    variant_id: 'var-6-2',
    product_id: 'prod-6',
    sku: 'SKU-SRM-50ML',
    price: 480000,
    original_price: 590000,
    weight: 80,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attributeValues: [
      { attribute_name: 'Volume', value_name: '50ml Bottles', value_id: 'val-vol-50' }
    ]
  },

  // Sunscreen: Standard
  {
    variant_id: 'var-7-1',
    product_id: 'prod-7',
    sku: 'SKU-SUN-50G',
    price: 290000,
    original_price: 350000,
    weight: 60,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attributeValues: [
      { attribute_name: 'Weight', value_name: '50g Tube', value_id: 'val-wt-50' }
    ]
  },

  // Ceramic Vase: Standard
  {
    variant_id: 'var-8-1',
    product_id: 'prod-8',
    sku: 'SKU-VASE-STD',
    price: 199000,
    original_price: 250000,
    weight: 500,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attributeValues: [
      { attribute_name: 'Color', value_name: 'Chalk White', value_id: 'val-col-white' }
    ]
  }
];

const seedInventory: Inventory[] = [
  { inventory_id: 'inv-1-1', variant_id: 'var-1-1', quantity: 25, reserved_quantity: 0, updated_at: new Date().toISOString() },
  { inventory_id: 'inv-1-2', variant_id: 'var-1-2', quantity: 18, reserved_quantity: 0, updated_at: new Date().toISOString() },
  { inventory_id: 'inv-1-3', variant_id: 'var-1-3', quantity: 8, reserved_quantity: 0, updated_at: new Date().toISOString() },
  { inventory_id: 'inv-2-1', variant_id: 'var-2-1', quantity: 30, reserved_quantity: 0, updated_at: new Date().toISOString() },
  { inventory_id: 'inv-2-2', variant_id: 'var-2-2', quantity: 15, reserved_quantity: 0, updated_at: new Date().toISOString() },
  { inventory_id: 'inv-3-1', variant_id: 'var-3-1', quantity: 45, reserved_quantity: 0, updated_at: new Date().toISOString() },
  { inventory_id: 'inv-4-1', variant_id: 'var-4-1', quantity: 60, reserved_quantity: 0, updated_at: new Date().toISOString() },
  { inventory_id: 'inv-4-2', variant_id: 'var-4-2', quantity: 40, reserved_quantity: 0, updated_at: new Date().toISOString() },
  { inventory_id: 'inv-4-3', variant_id: 'var-4-3', quantity: 50, reserved_quantity: 0, updated_at: new Date().toISOString() },
  { inventory_id: 'inv-5-1', variant_id: 'var-5-1', quantity: 20, reserved_quantity: 0, updated_at: new Date().toISOString() },
  { inventory_id: 'inv-5-2', variant_id: 'var-5-2', quantity: 12, reserved_quantity: 0, updated_at: new Date().toISOString() },
  { inventory_id: 'inv-6-1', variant_id: 'var-6-1', quantity: 100, reserved_quantity: 0, updated_at: new Date().toISOString() },
  { inventory_id: 'inv-6-2', variant_id: 'var-6-2', quantity: 85, reserved_quantity: 0, updated_at: new Date().toISOString() },
  { inventory_id: 'inv-7-1', variant_id: 'var-7-1', quantity: 90, reserved_quantity: 0, updated_at: new Date().toISOString() },
  { inventory_id: 'inv-8-1', variant_id: 'var-8-1', quantity: 5, reserved_quantity: 0, updated_at: new Date().toISOString() }
];

const seedVouchers: Voucher[] = [
  // Shop 1 Vouchers
  {
    voucher_id: 'vch-1',
    shop_id: 'shop-1',
    voucher_code: 'LUMINA50',
    voucher_name: 'Lumina 50k discount',
    discount_type: 'FIXED',
    discount_value: 50000,
    min_order_amount: 500000,
    usage_limit: 100,
    used_count: 24,
    start_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    end_at: new Date(Date.now() + 86400000 * 10).toISOString(),
    status: 'ACTIVE'
  },
  {
    voucher_id: 'vch-2',
    shop_id: 'shop-1',
    voucher_code: 'LUM10PCT',
    voucher_name: 'Lumina 10% Discount',
    discount_type: 'PERCENT',
    discount_value: 10,
    max_discount: 100000,
    min_order_amount: 300000,
    usage_limit: 50,
    used_count: 12,
    start_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    end_at: new Date(Date.now() + 86400000 * 10).toISOString(),
    status: 'ACTIVE'
  },
  // Shop 2 Vouchers
  {
    voucher_id: 'vch-3',
    shop_id: 'shop-2',
    voucher_code: 'VIBEFIT20',
    voucher_name: 'VibeFit Sports Special',
    discount_type: 'FIXED',
    discount_value: 20000,
    min_order_amount: 200000,
    usage_limit: 200,
    used_count: 55,
    start_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    end_at: new Date(Date.now() + 86400000 * 10).toISOString(),
    status: 'ACTIVE'
  },
  // Global (System) Vouchers
  {
    voucher_id: 'vch-global-1',
    voucher_code: 'LUMINAFREE',
    voucher_name: 'Free shipping on orders over 1M',
    discount_type: 'FIXED',
    discount_value: 30000,
    min_order_amount: 1000000,
    usage_limit: 500,
    used_count: 82,
    start_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    end_at: new Date(Date.now() + 86400000 * 20).toISOString(),
    status: 'ACTIVE'
  }
];

const seedReviews: ProductReview[] = [
  {
    review_id: 'rev-1',
    user_id: 'user-buyer',
    product_id: 'prod-1',
    order_item_id: 'oi-dummy-1',
    rating: 5,
    comment: 'Exceptional keyboard! Swappable switches are very easy to replace. Battery lasts for weeks with RGB off. Highly recommended.',
    status: 'VISIBLE',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    review_id: 'rev-2',
    user_id: 'user-admin',
    product_id: 'prod-1',
    order_item_id: 'oi-dummy-2',
    rating: 4,
    comment: 'Typing feel is excellent. The brown switches have a perfect bump. The chalk keycaps get dirty slightly fast, but that is to be expected.',
    status: 'VISIBLE',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  {
    review_id: 'rev-3',
    user_id: 'user-buyer',
    product_id: 'prod-6',
    order_item_id: 'oi-dummy-3',
    rating: 5,
    comment: 'Best hydration serum ever. Absorbs immediately and doesn’t leave a sticky feeling. My skin has never looked better.',
    status: 'VISIBLE',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  }
];

const seedNotifications = [
  { id: 'not-1', title: 'Welcome to Lumina!', content: 'Thank you for registering. Start exploring the marketplace now!', is_read: false, created_at: new Date().toISOString() },
  { id: 'not-2', title: 'Shop Follower Coupon', content: 'Lumina Official Store just sent you a discount code! Use LUMINA50 now.', is_read: false, created_at: new Date(Date.now() - 3600000 * 4).toISOString() }
];

// INITIALIZATION LOGIC
export const initializeDb = () => {
  const getItem = (key: string) => localStorage.getItem(key);
  const setItem = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  if (!getItem(KEYS.USERS)) setItem(KEYS.USERS, seedUsers);
  if (!getItem(KEYS.ADDRESSES)) setItem(KEYS.ADDRESSES, seedAddresses);
  if (!getItem(KEYS.SHOPS)) setItem(KEYS.SHOPS, seedShops);
  if (!getItem(KEYS.BRANDS)) setItem(KEYS.BRANDS, seedBrands);
  if (!getItem(KEYS.CATEGORIES)) setItem(KEYS.CATEGORIES, seedCategories);
  if (!getItem(KEYS.PRODUCTS)) setItem(KEYS.PRODUCTS, seedProducts);
  if (!getItem(KEYS.PRODUCT_IMAGES)) setItem(KEYS.PRODUCT_IMAGES, seedProductImages);
  if (!getItem(KEYS.VARIANTS)) setItem(KEYS.VARIANTS, seedVariants);
  if (!getItem(KEYS.INVENTORY)) setItem(KEYS.INVENTORY, seedInventory);
  if (!getItem(KEYS.VOUCHERS)) setItem(KEYS.VOUCHERS, seedVouchers);
  if (!getItem(KEYS.REVIEWS)) setItem(KEYS.REVIEWS, seedReviews);
  if (!getItem(KEYS.NOTIFICATIONS)) setItem(KEYS.NOTIFICATIONS, seedNotifications);
  if (!getItem(KEYS.INVENTORY_HISTORY)) setItem(KEYS.INVENTORY_HISTORY, []);
  if (!getItem('lumina_views')) setItem('lumina_views', []);

  if (!getItem(KEYS.CART_ITEMS)) setItem(KEYS.CART_ITEMS, []);
  if (!getItem(KEYS.WISHLIST)) setItem(KEYS.WISHLIST, []);
  if (!getItem(KEYS.ORDERS)) setItem(KEYS.ORDERS, []);
  if (!getItem(KEYS.ORDER_GROUPS)) setItem(KEYS.ORDER_GROUPS, []);
  if (!getItem(KEYS.ORDER_ITEMS)) setItem(KEYS.ORDER_ITEMS, []);
  if (!getItem(KEYS.ORDER_HISTORY)) setItem(KEYS.ORDER_HISTORY, []);
  if (!getItem(KEYS.PAYMENTS)) setItem(KEYS.PAYMENTS, []);
  if (!getItem(KEYS.SHIPMENTS)) setItem(KEYS.SHIPMENTS, []);
  if (!getItem('lumina_return_requests')) setItem('lumina_return_requests', []);
  if (!getItem('lumina_refunds')) setItem('lumina_refunds', []);
  if (!getItem('lumina_audit_logs')) setItem('lumina_audit_logs', []);

  if (!getItem(KEYS.CURRENT_USER_ID)) {
    localStorage.setItem(KEYS.CURRENT_USER_ID, 'user-buyer'); // default to Emma Watson
  }
};

// MOCK API CLIENT DATABASE HANDLERS
export const db = {
  // Common get/set wrappers
  get: <T>(key: string): T => {
    initializeDb();
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : ([] as any);
  },
  // Product view tracking and seller analytics
  recordProductView: (productId: string, shopId?: string) => {
    const views = db.get<any[]>('lumina_views');
    const idx = views.findIndex(v => v.product_id === productId);
    if (idx === -1) {
      views.push({ product_id: productId, shop_id: shopId || null, count: 1, last_at: new Date().toISOString() });
    } else {
      views[idx].count += 1;
      views[idx].last_at = new Date().toISOString();
    }
    db.set('lumina_views', views);
  },
  getProductViews: (productId: string) => {
    const views = db.get<any[]>('lumina_views');
    const v = views.find(x => x.product_id === productId);
    return v ? v.count : 0;
  },
  getSellerAnalytics: (shopId: string) => {
    const groups = db.get<OrderShopGroup[]>(KEYS.ORDER_GROUPS).filter(g => g.shop_id === shopId);
    const revenue = groups.reduce((s, g) => s + (g.total_amount || 0), 0);
    const ordersCount = groups.length;

    const orderItems = db.get<OrderItem[]>(KEYS.ORDER_ITEMS).filter(it => {
      const group = db.get<OrderShopGroup[]>(KEYS.ORDER_GROUPS).find(g => g.order_shop_id === it.order_shop_id);
      return group?.shop_id === shopId;
    });
    const productsSold = orderItems.reduce((s, it) => s + (it.quantity || 0), 0);

    const products = db.getProducts().filter(p => p.shop.shop_id === shopId);
    const topProducts = products.slice().sort((a, b) => (b.sold_quantity || 0) - (a.sold_quantity || 0)).slice(0, 5);

    const views = db.get<any[]>('lumina_views').filter(v => v.shop_id === shopId);
    const totalViews = views.reduce((s, v) => s + (v.count || 0), 0);

    // Subtract refunds for this shop
    const refunds = db.get<any[]>('lumina_refunds');
    const returnRequests = db.get<any[]>('lumina_return_requests');
    let refundsForShop = 0;
    refunds.forEach(rf => {
      const req = returnRequests.find(rr => rr.return_id === rf.return_id);
      if (!req) return;
      const orderItem = db.get<OrderItem[]>(KEYS.ORDER_ITEMS).find(it => it.order_item_id === req.order_item_id);
      if (!orderItem) return;
      const group = db.get<OrderShopGroup[]>(KEYS.ORDER_GROUPS).find(g => g.order_shop_id === orderItem.order_shop_id);
      if (group && group.shop_id === shopId) {
        refundsForShop += (rf.amount || 0);
      }
    });

    const netRevenue = Math.max(0, revenue - refundsForShop);

    const conversion = totalViews > 0 ? Number((ordersCount / totalViews).toFixed(4)) : 0;

    return {
      revenue: netRevenue,
      ordersCount,
      productsSold,
      totalViews,
      conversion,
      topProducts,
      refunds: refundsForShop
    };
  },
  // Time-series data for seller (daily revenue/orders) for the last `days`
  getSellerTimeSeries: (shopId: string, days = 14) => {
    const result: { date: string; revenue: number; orders: number }[] = [];
    const groups = db.get<OrderShopGroup[]>(KEYS.ORDER_GROUPS).filter(g => g.shop_id === shopId);
    for (let i = days - 1; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const dayKey = day.toISOString().slice(0, 10);
      const groupsForDay = groups.filter(g => (new Date(g.created_at).toISOString().slice(0, 10)) === dayKey);
      const revenue = groupsForDay.reduce((s, g) => s + (g.total_amount || 0), 0);
      const orders = groupsForDay.length;
      result.push({ date: dayKey, revenue, orders });
    }
    return result;
  },
  set: (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  },

  // USERS
  getCurrentUser: (): User | null => {
    const userId = localStorage.getItem(KEYS.CURRENT_USER_ID);
    if (!userId) return null;
    const users = db.get<User[]>(KEYS.USERS);
    return users.find(u => u.user_id === userId) || null;
  },
  setCurrentUser: (userId: string) => {
    localStorage.setItem(KEYS.CURRENT_USER_ID, userId);
  },
  getUsers: () => db.get<User[]>(KEYS.USERS),
  findUserByEmail: (email: string): User | null => {
    const users = db.get<User[]>(KEYS.USERS);
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },
  login: (email: string, pass: string): User | null => {
    const user = db.findUserByEmail(email);
    if (!user) return null;
    const namePrefix = email.split('@')[0];
    const expectedPassword = `${namePrefix}123`;
    if (pass !== expectedPassword) return null;
    if (user.status === 'BLOCKED') return null;
    return user;
  },
  updateUser: (updatedUser: Partial<User>) => {
    const users = db.get<User[]>(KEYS.USERS);
    const index = users.findIndex(u => u.user_id === updatedUser.user_id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedUser, updated_at: new Date().toISOString() };
      db.set(KEYS.USERS, users);
      return users[index];
    }
    return null;
  },
  registerUser: (fullName: string, email: string, phone: string, pass: string, roles: UserRole[] = ['Customer']): User | null => {
    const users = db.get<User[]>(KEYS.USERS);
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return null;
    }
    const newUser: User = {
      user_id: generateId(),
      full_name: fullName,
      email,
      phone,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      gender: 'OTHER',
      status: 'ACTIVE',
      roles,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    users.push(newUser);
    db.set(KEYS.USERS, users);

    // Auto-create shop placeholder if register role changes later
    return newUser;
  },

  // ADDRESSES
  getAddresses: (userId: string): Address[] => {
    const addresses = db.get<Address[]>(KEYS.ADDRESSES);
    return addresses.filter(a => a.user_id === userId);
  },
  addAddress: (userId: string, address: Omit<Address, 'address_id' | 'user_id' | 'created_at'>): Address => {
    const addresses = db.get<Address[]>(KEYS.ADDRESSES);
    if (address.is_default) {
      addresses.forEach(a => { if (a.user_id === userId) a.is_default = false; });
    }
    // If it's the first address, make it default automatically
    const userAddrs = addresses.filter(a => a.user_id === userId);
    const isDefault = userAddrs.length === 0 ? true : address.is_default;

    const newAddress: Address = {
      ...address,
      address_id: generateId(),
      user_id: userId,
      is_default: isDefault,
      created_at: new Date().toISOString()
    };
    addresses.push(newAddress);
    db.set(KEYS.ADDRESSES, addresses);
    return newAddress;
  },
  updateAddress: (addressId: string, updated: Partial<Address>): Address | null => {
    const addresses = db.get<Address[]>(KEYS.ADDRESSES);
    const index = addresses.findIndex(a => a.address_id === addressId);
    if (index !== -1) {
      const userId = addresses[index].user_id;
      if (updated.is_default) {
        addresses.forEach(a => { if (a.user_id === userId) a.is_default = false; });
      }
      addresses[index] = { ...addresses[index], ...updated };
      db.set(KEYS.ADDRESSES, addresses);
      return addresses[index];
    }
    return null;
  },
  deleteAddress: (addressId: string): boolean => {
    const addresses = db.get<Address[]>(KEYS.ADDRESSES);
    const index = addresses.findIndex(a => a.address_id === addressId);
    if (index !== -1) {
      const address = addresses[index];
      addresses.splice(index, 1);

      // If we deleted the default, set another default
      if (address.is_default && addresses.length > 0) {
        const nextDefault = addresses.find(a => a.user_id === address.user_id);
        if (nextDefault) nextDefault.is_default = true;
      }
      db.set(KEYS.ADDRESSES, addresses);
      return true;
    }
    return false;
  },

  // SHOPS
  getShops: () => db.get<Shop[]>(KEYS.SHOPS),
  getShop: (shopId: string): Shop | null => {
    const shops = db.get<Shop[]>(KEYS.SHOPS);
    return shops.find(s => s.shop_id === shopId) || null;
  },
  getShopByOwner: (ownerId: string): Shop | null => {
    const shops = db.get<Shop[]>(KEYS.SHOPS);
    return shops.find(s => s.owner_id === ownerId) || null;
  },
  createShop: (ownerId: string, shopName: string, logo: string, description: string): Shop => {
    const shops = db.get<Shop[]>(KEYS.SHOPS);
    const existing = shops.find(s => s.owner_id === ownerId);
    if (existing) return existing;

    const newShop: Shop = {
      shop_id: generateId(),
      owner_id: ownerId,
      shop_name: shopName,
      logo,
      description,
      rating: 5.0,
      total_followers: 0,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    shops.push(newShop);
    db.set(KEYS.SHOPS, shops);

    // Add Seller role to user
    const users = db.get<User[]>(KEYS.USERS);
    const userIndex = users.findIndex(u => u.user_id === ownerId);
    if (userIndex !== -1 && !users[userIndex].roles.includes('Seller')) {
      users[userIndex].roles.push('Seller');
      db.set(KEYS.USERS, users);
    }
    return newShop;
  },
  updateShop: (shopId: string, updated: Partial<Shop>): Shop | null => {
    const shops = db.get<Shop[]>(KEYS.SHOPS);
    const idx = shops.findIndex(s => s.shop_id === shopId);
    if (idx !== -1) {
      shops[idx] = { ...shops[idx], ...updated, updated_at: new Date().toISOString() };
      db.set(KEYS.SHOPS, shops);
      return shops[idx];
    }
    return null;
  },
  // Cascade delete a shop and its related products, variants, images, inventory, vouchers, and related order data
  deleteShopCascade: (shopId: string): boolean => {
    // Remove shop
    const shops = db.get<Shop[]>(KEYS.SHOPS);
    const shopIdx = shops.findIndex(s => s.shop_id === shopId);
    if (shopIdx === -1) return false;
    shops.splice(shopIdx, 1);
    db.set(KEYS.SHOPS, shops);

    // Remove products, collect variant ids
    const products = db.get<Product[]>(KEYS.PRODUCTS);
    const variants = db.get<ProductVariant[]>(KEYS.VARIANTS);
    const images = db.get<ProductImage[]>(KEYS.PRODUCT_IMAGES);
    const inventories = db.get<Inventory[]>(KEYS.INVENTORY);
    const vouchers = db.get<Voucher[]>(KEYS.VOUCHERS);

    const productIds = products.filter(p => p.shop_id === shopId).map(p => p.product_id);
    const variantIds = variants.filter(v => productIds.includes(v.product_id)).map(v => v.variant_id);

    // Remove products
    const remainingProducts = products.filter(p => p.shop_id !== shopId);
    db.set(KEYS.PRODUCTS, remainingProducts);

    // Remove variants
    const remainingVariants = variants.filter(v => !variantIds.includes(v.variant_id));
    db.set(KEYS.VARIANTS, remainingVariants);

    // Remove images
    const remainingImages = images.filter(img => !productIds.includes(img.product_id));
    db.set(KEYS.PRODUCT_IMAGES, remainingImages);

    // Remove inventories
    const remainingInventories = inventories.filter(inv => !variantIds.includes(inv.variant_id));
    db.set(KEYS.INVENTORY, remainingInventories);

    // Remove vouchers belonging to shop
    const remainingVouchers = vouchers.filter(v => v.shop_id !== shopId);
    db.set(KEYS.VOUCHERS, remainingVouchers);

    // Remove order groups, items, shipments for this shop; adjust parent orders/payments
    const orderGroups = db.get<OrderShopGroup[]>(KEYS.ORDER_GROUPS);
    const orderItems = db.get<OrderItem[]>(KEYS.ORDER_ITEMS);
    const shipments = db.get<Shipment[]>(KEYS.SHIPMENTS);
    const payments = db.get<Payment[]>(KEYS.PAYMENTS);
    const orders = db.get<Order[]>(KEYS.ORDERS);
    const orderHistory = db.get<OrderStatusHistory[]>(KEYS.ORDER_HISTORY);

    const groupsToRemove = orderGroups.filter(g => g.shop_id === shopId).map(g => g.order_shop_id);

    // Remove order items tied to removed groups
    const remainingOrderItems = orderItems.filter(oi => !groupsToRemove.includes(oi.order_shop_id));
    db.set(KEYS.ORDER_ITEMS, remainingOrderItems);

    // Remove shipments for those groups
    const remainingShipments = shipments.filter(s => !groupsToRemove.includes(s.order_shop_id));
    db.set(KEYS.SHIPMENTS, remainingShipments);

    // Remove the groups themselves
    const remainingOrderGroups = orderGroups.filter(g => g.shop_id !== shopId);
    db.set(KEYS.ORDER_GROUPS, remainingOrderGroups);

    // Adjust parent orders: subtract removed group amounts; if no groups remain, delete the order and its payments/history
    groupsToRemove.forEach(removedGroupId => {
      const origGroup = orderGroups.find(g => g.order_shop_id === removedGroupId);
      if (!origGroup) return;
      const parentOrder = orders.find(o => o.order_id === origGroup.order_id);
      if (!parentOrder) return;

      parentOrder.subtotal = Math.max(0, (parentOrder.subtotal || 0) - (origGroup.subtotal || 0));
      parentOrder.shipping_fee = Math.max(0, (parentOrder.shipping_fee || 0) - (origGroup.shipping_fee || 0));
      parentOrder.discount = Math.max(0, (parentOrder.discount || 0) - (origGroup.discount || 0));
      parentOrder.total_amount = Math.max(0, (parentOrder.total_amount || 0) - (origGroup.total_amount || 0));
      parentOrder.updated_at = new Date().toISOString();

      const groupsStill = remainingOrderGroups.filter(g => g.order_id === parentOrder.order_id);
      if (groupsStill.length === 0) {
        // delete order
        const idx = orders.findIndex(o => o.order_id === parentOrder.order_id);
        if (idx !== -1) orders.splice(idx, 1);

        // delete payments and history for this order
        const remainingPayments = payments.filter(p => p.order_id !== parentOrder.order_id);
        db.set(KEYS.PAYMENTS, remainingPayments);

        const remainingHistory = orderHistory.filter(h => h.order_id !== parentOrder.order_id);
        db.set(KEYS.ORDER_HISTORY, remainingHistory);
      }
    });

    // Persist updated orders and reconcile payment amounts for remaining payments
    db.set(KEYS.ORDERS, orders);
    payments.forEach(p => {
      const ord = orders.find(o => o.order_id === p.order_id);
      if (ord) p.amount = ord.total_amount;
    });
    db.set(KEYS.PAYMENTS, payments.filter(p => orders.some(o => o.order_id === p.order_id)));

    // Remove return requests and refunds referencing removed order items
    const returnRequests = db.get<any[]>('lumina_return_requests');
    const refunds = db.get<any[]>('lumina_refunds');
    const remainingReturnRequests = returnRequests.filter(rr => remainingOrderItems.some(oi => oi.order_item_id === rr.order_item_id));
    db.set('lumina_return_requests', remainingReturnRequests);
    const remainingRefunds = refunds.filter(rf => remainingReturnRequests.some(rr => rr.return_id === rf.return_id));
    db.set('lumina_refunds', remainingRefunds);

    db.recordAudit(db.getCurrentUser() ? db.getCurrentUser()!.user_id : null, `Cascade deleted shop ${shopId} and related products/variants/orders`, 'SHOP_CASCADE_DELETED');
    return true;
  },

  // CATEGORIES & BRANDS
  getCategories: () => db.get<Category[]>(KEYS.CATEGORIES),
  getBrands: () => db.get<Brand[]>(KEYS.BRANDS),

  // PRODUCTS WITH DETAILS
  getProducts: (): ProductWithDetails[] => {
    const products = db.get<Product[]>(KEYS.PRODUCTS);
    const shops = db.get<Shop[]>(KEYS.SHOPS);
    const brands = db.get<Brand[]>(KEYS.BRANDS);
    const categories = db.get<Category[]>(KEYS.CATEGORIES);
    const images = db.get<ProductImage[]>(KEYS.PRODUCT_IMAGES);
    const variants = db.get<ProductVariant[]>(KEYS.VARIANTS);
    const inventories = db.get<Inventory[]>(KEYS.INVENTORY);

    return products.map(p => {
      const shop = shops.find(s => s.shop_id === p.shop_id) || seedShops[0];
      const brand = brands.find(b => b.brand_id === p.brand_id);
      const category = categories.find(c => c.category_id === p.category_id);
      const pImages = images.filter(i => i.product_id === p.product_id).sort((a, b) => a.display_order - b.display_order);

      const pVariants = variants.filter(v => v.product_id === p.product_id).map(v => {
        const inv = inventories.find(i => i.variant_id === v.variant_id);
        return { ...v, inventory: inv };
      });

      return {
        ...p,
        shop,
        brand,
        category,
        images: pImages,
        variants: pVariants
      };
    });
  },
  getProduct: (idOrSlug: string): ProductWithDetails | null => {
    const all = db.getProducts();
    return all.find(p => p.product_id === idOrSlug || p.slug === idOrSlug) || null;
  },

  // PRODUCT CRUD helpers (basic, operate on underlying tables)
  addProduct: (
    shopId: string,
    productData: Omit<Product, 'product_id' | 'shop_id' | 'created_at' | 'updated_at'>,
    variants: Omit<ProductVariant, 'variant_id' | 'product_id' | 'created_at' | 'updated_at'>[] = [],
    images: Omit<ProductImage, 'image_id' | 'product_id' | 'created_at'>[] = [],
    inventories: Omit<Inventory, 'inventory_id' | 'variant_id' | 'updated_at'>[] = []
  ): ProductWithDetails => {
    const products = db.get<Product[]>(KEYS.PRODUCTS);
    const variantsTable = db.get<ProductVariant[]>(KEYS.VARIANTS);
    const imagesTable = db.get<ProductImage[]>(KEYS.PRODUCT_IMAGES);
    const inventoryTable = db.get<Inventory[]>(KEYS.INVENTORY);

    const newProductId = generateId();
    const newProduct: Product = {
      ...productData,
      product_id: newProductId,
      shop_id: shopId,
      status: productData.status || 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Product;

    products.push(newProduct);

    // Add variants and inventories
    variants.forEach((v) => {
      const vid = generateId();
      const newVar: ProductVariant = {
        ...v,
        variant_id: vid,
        product_id: newProductId,
        status: v.status || 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as ProductVariant;
      variantsTable.push(newVar);

      // corresponding inventory
      const invPayload = inventories.shift();
      const newInv: Inventory = invPayload
        ? { ...invPayload, inventory_id: generateId(), variant_id: vid, updated_at: new Date().toISOString() }
        : { inventory_id: generateId(), variant_id: vid, quantity: 0, reserved_quantity: 0, updated_at: new Date().toISOString() };
      inventoryTable.push(newInv);
    });

    // Add images
    images.forEach((img, idx) => {
      const newImg: ProductImage = { image_id: generateId(), product_id: newProductId, image_url: img.image_url, display_order: idx + 1, created_at: new Date().toISOString() };
      imagesTable.push(newImg);
    });

    // persist
    db.set(KEYS.PRODUCTS, products);
    db.set(KEYS.VARIANTS, variantsTable);
    db.set(KEYS.PRODUCT_IMAGES, imagesTable);
    db.set(KEYS.INVENTORY, inventoryTable);

    return db.getProduct(newProductId)!;
  },

  updateProduct: (productId: string, patch: Partial<Product>): ProductWithDetails | null => {
    const products = db.get<Product[]>(KEYS.PRODUCTS);
    const idx = products.findIndex(p => p.product_id === productId);
    if (idx === -1) return null;
    products[idx] = { ...products[idx], ...patch, updated_at: new Date().toISOString() };
    db.set(KEYS.PRODUCTS, products);
    return db.getProduct(productId);
  },

  deleteProduct: (productId: string): boolean => {
    const products = db.get<Product[]>(KEYS.PRODUCTS);
    const variants = db.get<ProductVariant[]>(KEYS.VARIANTS);
    const images = db.get<ProductImage[]>(KEYS.PRODUCT_IMAGES);
    const inventory = db.get<Inventory[]>(KEYS.INVENTORY);

    const pIdx = products.findIndex(p => p.product_id === productId);
    if (pIdx === -1) return false;
    products.splice(pIdx, 1);

    // remove related variants/images/inventory
    const variantIds = variants.filter(v => v.product_id === productId).map(v => v.variant_id);
    const remainingVariants = variants.filter(v => v.product_id !== productId);
    const remainingImages = images.filter(i => i.product_id !== productId);
    const remainingInventory = inventory.filter(inv => !variantIds.includes(inv.variant_id));

    db.set(KEYS.PRODUCTS, products);
    db.set(KEYS.VARIANTS, remainingVariants);
    db.set(KEYS.PRODUCT_IMAGES, remainingImages);
    db.set(KEYS.INVENTORY, remainingInventory);

    return true;
  },

  // VARIANTS / INVENTORY UPDATES
  updateVariant: (variantId: string, patch: Partial<ProductVariant>): ProductVariant | null => {
    const variants = db.get<ProductVariant[]>(KEYS.VARIANTS);
    const idx = variants.findIndex(v => v.variant_id === variantId);
    if (idx === -1) return null;
    variants[idx] = { ...variants[idx], ...patch, updated_at: new Date().toISOString() };
    db.set(KEYS.VARIANTS, variants);
    return variants[idx];
  },

  addVariant: (productId: string, variantData: Omit<ProductVariant, 'variant_id' | 'product_id' | 'created_at' | 'updated_at'>, initialInventoryQty: number = 0) => {
    const variants = db.get<ProductVariant[]>(KEYS.VARIANTS);
    const inventory = db.get<Inventory[]>(KEYS.INVENTORY);
    const vid = generateId();
    const newVar: ProductVariant = { ...variantData as any, variant_id: vid, product_id: productId, status: variantData.status || 'ACTIVE', created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as ProductVariant;
    variants.push(newVar);
    inventory.push({ inventory_id: generateId(), variant_id: vid, quantity: initialInventoryQty, reserved_quantity: 0, updated_at: new Date().toISOString() });
    db.set(KEYS.VARIANTS, variants);
    db.set(KEYS.INVENTORY, inventory);
    return newVar;
  },

  deleteVariant: (variantId: string) => {
    const variants = db.get<ProductVariant[]>(KEYS.VARIANTS);
    const inventories = db.get<Inventory[]>(KEYS.INVENTORY);
    const idx = variants.findIndex(v => v.variant_id === variantId);
    if (idx === -1) return false;
    variants.splice(idx, 1);
    const remainingInv = inventories.filter(i => i.variant_id !== variantId);
    db.set(KEYS.VARIANTS, variants);
    db.set(KEYS.INVENTORY, remainingInv);
    return true;
  },

  updateInventoryQuantity: (variantId: string, quantity: number): Inventory | null => {
    const inventories = db.get<Inventory[]>(KEYS.INVENTORY);
    const idx = inventories.findIndex(i => i.variant_id === variantId);
    if (idx === -1) return null;
    inventories[idx] = { ...inventories[idx], quantity, updated_at: new Date().toISOString() };
    db.set(KEYS.INVENTORY, inventories);
    return inventories[idx];
  },

  // Inventory history recording
  recordInventoryChange: (userId: string | undefined, variantId: string, delta: number, reason: string) => {
    const history = db.get<any[]>(KEYS.INVENTORY_HISTORY);
    const entry = {
      id: generateId(),
      variant_id: variantId,
      user_id: userId || null,
      delta,
      reason,
      created_at: new Date().toISOString()
    };
    history.push(entry);
    db.set(KEYS.INVENTORY_HISTORY, history);
    return entry;
  },

  getInventoryHistory: (variantId: string) => {
    const history = db.get<any[]>(KEYS.INVENTORY_HISTORY);
    return history.filter(h => h.variant_id === variantId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // Product images helper
  addProductImage: (productId: string, imageUrl: string) => {
    const images = db.get<ProductImage[]>(KEYS.PRODUCT_IMAGES);
    const nextOrder = images.filter(i => i.product_id === productId).length + 1;
    const newImg: ProductImage = { image_id: generateId(), product_id: productId, image_url: imageUrl, display_order: nextOrder, created_at: new Date().toISOString() };
    images.push(newImg);
    db.set(KEYS.PRODUCT_IMAGES, images);
    return newImg;
  },

  removeProductImage: (imageId: string) => {
    const images = db.get<ProductImage[]>(KEYS.PRODUCT_IMAGES);
    const idx = images.findIndex(i => i.image_id === imageId);
    if (idx === -1) return false;
    images.splice(idx, 1);
    db.set(KEYS.PRODUCT_IMAGES, images);
    return true;
  },

  // Admin role helpers
  addRoleToUser: (userId: string, role: UserRole) => {
    const users = db.get<User[]>(KEYS.USERS);
    const idx = users.findIndex(u => u.user_id === userId);
    if (idx === -1) return null;
    if (!users[idx].roles.includes(role)) users[idx].roles.push(role);
    db.set(KEYS.USERS, users);
    return users[idx];
  },

  removeRoleFromUser: (userId: string, role: UserRole) => {
    const users = db.get<User[]>(KEYS.USERS);
    const idx = users.findIndex(u => u.user_id === userId);
    if (idx === -1) return null;
    users[idx].roles = users[idx].roles.filter(r => r !== role);
    db.set(KEYS.USERS, users);
    return users[idx];
  },

  // CART
  getCartItems: (userId: string): CartItemWithDetails[] => {
    const allCartItems = db.get<CartItem[]>(KEYS.CART_ITEMS);
    const userCartItems = allCartItems.filter(item => {
      // For simplicity, we directly assume card_id matches userId or cart_id has mapping.
      // Let's assume cart_id === userId
      return item.cart_id === userId;
    });

    const products = db.getProducts();
    const inventories = db.get<Inventory[]>(KEYS.INVENTORY);

    return userCartItems.map(item => {
      let matchedProd: ProductWithDetails | null = null;
      let matchedVar: ProductVariant | null = null;

      for (const p of products) {
        const v = p.variants.find(v => v.variant_id === item.variant_id);
        if (v) {
          matchedProd = p;
          matchedVar = v;
          break;
        }
      }

      const inv = inventories.find(i => i.variant_id === item.variant_id) || {
        inventory_id: 'dummy',
        variant_id: item.variant_id,
        quantity: 99,
        reserved_quantity: 0,
        updated_at: ''
      };

      return {
        cart_item_id: item.cart_item_id,
        quantity: item.quantity,
        variant: matchedVar || seedVariants[0],
        product: matchedProd || seedProducts[0],
        shop: matchedProd?.shop || seedShops[0],
        inventory: inv
      };
    }).filter(item => item.product && item.variant);
  },
  addToCart: (userId: string, variantId: string, quantity: number): boolean => {
    const allCartItems = db.get<CartItem[]>(KEYS.CART_ITEMS);
    const inventories = db.get<Inventory[]>(KEYS.INVENTORY);

    // Check available stock
    const stock = inventories.find(i => i.variant_id === variantId);
    if (!stock || (stock.quantity - stock.reserved_quantity) < quantity) {
      return false; // Insufficient stock
    }

    const existingIndex = allCartItems.findIndex(item => item.cart_id === userId && item.variant_id === variantId);
    if (existingIndex !== -1) {
      const nextQty = allCartItems[existingIndex].quantity + quantity;
      if (stock.quantity - stock.reserved_quantity < nextQty) {
        return false;
      }
      allCartItems[existingIndex].quantity = nextQty;
    } else {
      allCartItems.push({
        cart_item_id: generateId(),
        cart_id: userId,
        variant_id: variantId,
        quantity: quantity,
        created_at: new Date().toISOString()
      });
    }

    db.set(KEYS.CART_ITEMS, allCartItems);
    return true;
  },
  updateCartQty: (cartItemId: string, newQty: number): boolean => {
    const allCartItems = db.get<CartItem[]>(KEYS.CART_ITEMS);
    const idx = allCartItems.findIndex(i => i.cart_item_id === cartItemId);
    if (idx !== -1) {
      const item = allCartItems[idx];
      const inventories = db.get<Inventory[]>(KEYS.INVENTORY);
      const stock = inventories.find(i => i.variant_id === item.variant_id);

      if (newQty <= 0) {
        allCartItems.splice(idx, 1);
        db.set(KEYS.CART_ITEMS, allCartItems);
        return true;
      }

      if (stock && (stock.quantity - stock.reserved_quantity) >= newQty) {
        allCartItems[idx].quantity = newQty;
        db.set(KEYS.CART_ITEMS, allCartItems);
        return true;
      }
    }
    return false;
  },
  removeFromCart: (cartItemId: string) => {
    const allCartItems = db.get<CartItem[]>(KEYS.CART_ITEMS);
    const filtered = allCartItems.filter(i => i.cart_item_id !== cartItemId);
    db.set(KEYS.CART_ITEMS, filtered);
  },
  clearCart: (userId: string) => {
    const allCartItems = db.get<CartItem[]>(KEYS.CART_ITEMS);
    const filtered = allCartItems.filter(i => i.cart_id !== userId);
    db.set(KEYS.CART_ITEMS, filtered);
  },

  // WISHLIST
  getWishlist: (userId: string): ProductWithDetails[] => {
    const wishes = db.get<WishlistItem[]>(KEYS.WISHLIST);
    const userWishes = wishes.filter(w => w.user_id === userId);
    const allProds = db.getProducts();
    return userWishes.map(w => allProds.find(p => p.product_id === w.product_id)!).filter(Boolean);
  },
  toggleWishlist: (userId: string, productId: string): boolean => {
    const wishes = db.get<WishlistItem[]>(KEYS.WISHLIST);
    const idx = wishes.findIndex(w => w.user_id === userId && w.product_id === productId);
    let added = false;
    if (idx !== -1) {
      wishes.splice(idx, 1);
    } else {
      wishes.push({
        wishlist_id: generateId(),
        user_id: userId,
        product_id: productId,
        created_at: new Date().toISOString()
      });
      added = true;
    }
    db.set(KEYS.WISHLIST, wishes);
    return added;
  },

  // VOUCHERS
  getVouchers: (): Voucher[] => db.get<Voucher[]>(KEYS.VOUCHERS),
  getShopVouchers: (shopId: string): Voucher[] => {
    return db.getVouchers().filter(v => v.shop_id === shopId && v.status === 'ACTIVE');
  },
  getSystemVouchers: (): Voucher[] => {
    return db.getVouchers().filter(v => !v.shop_id && v.status === 'ACTIVE');
  },
  // Create a voucher (shop-level or system-level)
  createVoucher: (voucher: Partial<Voucher>) => {
    const vouchers = db.get<Voucher[]>(KEYS.VOUCHERS);
    const v: Voucher = {
      voucher_id: generateId(),
      shop_id: voucher.shop_id || undefined,
      voucher_code: (voucher.voucher_code || `V${Math.random().toString(36).substring(2, 8).toUpperCase()}`).toUpperCase(),
      voucher_name: voucher.voucher_name || 'Untitled Voucher',
      discount_type: voucher.discount_type || 'FIXED',
      discount_value: voucher.discount_value || 0,
      min_order_amount: voucher.min_order_amount || 0,
      usage_limit: voucher.usage_limit || undefined,
      used_count: 0,
      start_at: voucher.start_at || new Date().toISOString(),
      end_at: voucher.end_at || new Date(Date.now() + 86400000 * 30).toISOString(),
      status: voucher.status || 'ACTIVE'
    } as Voucher;
    vouchers.push(v);
    db.set(KEYS.VOUCHERS, vouchers);
    db.recordAudit(v.shop_id || null, `Created voucher ${v.voucher_code}`, 'VOUCHER_CREATED');
    return v;
  },
  deleteVoucher: (voucherId: string) => {
    const vouchers = db.get<Voucher[]>(KEYS.VOUCHERS);
    const idx = vouchers.findIndex(v => v.voucher_id === voucherId);
    if (idx === -1) return false;
    const removed = vouchers.splice(idx, 1)[0];
    db.set(KEYS.VOUCHERS, vouchers);
    db.recordAudit(removed.shop_id || null, `Deleted voucher ${removed.voucher_code}`, 'VOUCHER_DELETED');
    return true;
  },
  validateVoucher: (code: string, shopId?: string, orderAmount: number = 0): { valid: boolean; discount: number; message: string; voucher?: Voucher } => {
    const vouchers = db.getVouchers();
    const v = vouchers.find(x => x.voucher_code.toUpperCase() === code.trim().toUpperCase());

    if (!v) return { valid: false, discount: 0, message: 'Invalid voucher code.' };
    if (v.status !== 'ACTIVE') return { valid: false, discount: 0, message: 'Voucher is no longer active.' };

    const now = new Date();
    if (now < new Date(v.start_at) || now > new Date(v.end_at)) {
      return { valid: false, discount: 0, message: 'Voucher has expired or is not yet active.' };
    }

    if (v.usage_limit !== undefined && v.used_count >= v.usage_limit) {
      return { valid: false, discount: 0, message: 'Voucher usage limit reached.' };
    }

    if (v.shop_id && shopId && v.shop_id !== shopId) {
      return { valid: false, discount: 0, message: 'Voucher does not apply to items in this shop.' };
    }

    if (orderAmount < v.min_order_amount) {
      return { valid: false, discount: 0, message: `Minimum order amount of ₫${v.min_order_amount.toLocaleString()} not met.` };
    }

    let discount = 0;
    if (v.discount_type === 'FIXED') {
      discount = v.discount_value;
    } else {
      discount = (orderAmount * v.discount_value) / 100;
      if (v.max_discount) {
        discount = Math.min(discount, v.max_discount);
      }
    }

    return { valid: true, discount, message: 'Voucher applied successfully!', voucher: v };
  },

  // ORDERS AND TRANSACTIONS (Multi-shop package splits)
  getOrders: (userId: string): OrderWithDetails[] => {
    const orders = db.get<Order[]>(KEYS.ORDERS).filter(o => o.user_id === userId);
    return orders.map(order => db.getOrderDetails(order.order_id)!).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  getOrderDetails: (orderId: string): OrderWithDetails | null => {
    const orders = db.get<Order[]>(KEYS.ORDERS);
    const order = orders.find(o => o.order_id === orderId);
    if (!order) return null;

    const addresses = db.get<Address[]>(KEYS.ADDRESSES);
    const address = addresses.find(a => a.address_id === order.address_id);

    const paymentMethods: PaymentMethod[] = [
      { payment_method_id: 'pay-cod', method_name: 'COD', is_active: true },
      { payment_method_id: 'pay-vnpay', method_name: 'VNPay', is_active: true },
      { payment_method_id: 'pay-momo', method_name: 'MoMo', is_active: true }
    ];
    const pMethod = paymentMethods.find(p => p.payment_method_id === order.payment_method_id) || { payment_method_id: 'pay-cod', method_name: 'COD', is_active: true };

    const shippingMethods: ShippingMethod[] = [
      { shipping_method_id: 'ship-std', method_name: 'Standard', shipping_fee: 30000, estimated_days: 3, is_active: true },
      { shipping_method_id: 'ship-fast', method_name: 'Fast', shipping_fee: 50000, estimated_days: 2, is_active: true }
    ];
    const sMethod = shippingMethods.find(s => s.shipping_method_id === order.shipping_method_id) || { shipping_method_id: 'ship-std', method_name: 'Standard', shipping_fee: 30000, is_active: true };

    const payments = db.get<Payment[]>(KEYS.PAYMENTS);
    const payment = payments.find(p => p.order_id === orderId);

    const histories = db.get<OrderStatusHistory[]>(KEYS.ORDER_HISTORY).filter(h => h.order_id === orderId).sort((a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime());

    const shops = db.get<Shop[]>(KEYS.SHOPS);
    const groupItems = db.get<OrderItem[]>(KEYS.ORDER_ITEMS);
    const products = db.getProducts();
    const shipments = db.get<Shipment[]>(KEYS.SHIPMENTS);

    const shopGroups = db.get<OrderShopGroup[]>(KEYS.ORDER_GROUPS)
      .filter(g => g.order_id === orderId)
      .map(group => {
        const shop = shops.find(s => s.shop_id === group.shop_id) || seedShops[0];
        const shipment = shipments.find(s => s.order_shop_id === group.order_shop_id);

        const items = groupItems.filter(i => i.order_shop_id === group.order_shop_id).map(item => {
          let matchedProd: Product | null = null;
          let matchedVar: ProductVariant | null = null;

          for (const p of products) {
            const v = p.variants.find(v => v.variant_id === item.variant_id);
            if (v) {
              matchedProd = p;
              matchedVar = v;
              break;
            }
          }

          return {
            ...item,
            product: matchedProd || seedProducts[0],
            variant: matchedVar || seedVariants[0]
          };
        });

        return {
          ...group,
          shop,
          shipment,
          items
        };
      });

    return {
      ...order,
      address,
      paymentMethod: pMethod as any,
      shippingMethod: sMethod as any,
      payment,
      shopGroups,
      statusHistory: histories
    };
  },
  // ADMIN: get all orders
  getAllOrders: (): OrderWithDetails[] => {
    const orders = db.get<Order[]>(KEYS.ORDERS);
    return orders.map(o => db.getOrderDetails(o.order_id)!).filter(Boolean).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  createOrder: (
    userId: string,
    addressId: string,
    paymentMethodId: string,
    shippingMethodId: string,
    checkoutItems: { cartItemId: string; shopId: string; variantId: string; quantity: number; price: number }[],
    vouchersApplied: { shopId?: string; code: string; discount: number }[],
    note?: string
  ): Order | null => {
    // 1. Fetch tables
    const inventories = db.get<Inventory[]>(KEYS.INVENTORY);
    const products = db.getProducts();

    // 2. Validate inventory availability
    for (const item of checkoutItems) {
      const inv = inventories.find(i => i.variant_id === item.variantId);
      if (!inv || (inv.quantity - inv.reserved_quantity) < item.quantity) {
        return null; // Out of stock on checkout item
      }
    }

    // 3. Keep stock reserved
    inventories.forEach(inv => {
      const match = checkoutItems.find(item => item.variantId === inv.variant_id);
      if (match) {
        inv.reserved_quantity += match.quantity;
      }
    });
    db.set(KEYS.INVENTORY, inventories);

    // 4. Calculate Subtotals grouped by Shop
    const shopGroupAmounts: Record<string, { subtotal: number; shippingFee: number; discount: number; items: typeof checkoutItems }> = {};
    checkoutItems.forEach(item => {
      if (!shopGroupAmounts[item.shopId]) {
        shopGroupAmounts[item.shopId] = { subtotal: 0, shippingFee: 15000, discount: 0, items: [] }; // flat 15k shipping per shop
      }
      shopGroupAmounts[item.shopId].subtotal += item.price * item.quantity;
      shopGroupAmounts[item.shopId].items.push(item);
    });

    // 5. Apply Vouchers (shop-level and system-level)
    let globalDiscount = 0;
    vouchersApplied.forEach(va => {
      if (va.shopId) {
        if (shopGroupAmounts[va.shopId]) {
          shopGroupAmounts[va.shopId].discount = va.discount;
        }
      } else {
        globalDiscount += va.discount;
      }
    });

    // Subtotal and totals
    let orderSubtotal = 0;
    let orderShippingFee = 0;
    let orderDiscount = globalDiscount;

    Object.keys(shopGroupAmounts).forEach(shopId => {
      const g = shopGroupAmounts[shopId];
      orderSubtotal += g.subtotal;
      orderShippingFee += g.shippingFee;
      orderDiscount += g.discount;
    });

    const totalAmount = orderSubtotal + orderShippingFee - orderDiscount;
    const orderId = generateId();
    const orderCode = 'LMN-' + Math.floor(100000 + Math.random() * 900000);

    const newOrder: Order = {
      order_id: orderId,
      order_code: orderCode,
      user_id: userId,
      address_id: addressId,
      payment_method_id: paymentMethodId,
      shipping_method_id: shippingMethodId,
      subtotal: orderSubtotal,
      shipping_fee: orderShippingFee,
      discount: orderDiscount,
      total_amount: Math.max(0, totalAmount),
      note,
      order_status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save Order
    const orders = db.get<Order[]>(KEYS.ORDERS);
    orders.push(newOrder);
    db.set(KEYS.ORDERS, orders);

    // 6. Create Order Shop Groups (packages) and Order Items
    const shopGroups = db.get<OrderShopGroup[]>(KEYS.ORDER_GROUPS);
    const orderItems = db.get<OrderItem[]>(KEYS.ORDER_ITEMS);
    const shipments = db.get<Shipment[]>(KEYS.SHIPMENTS);

    Object.keys(shopGroupAmounts).forEach(shopId => {
      const g = shopGroupAmounts[shopId];
      const orderShopId = generateId();
      const shopGroupTotal = g.subtotal + g.shippingFee - g.discount;

      const newGroup: OrderShopGroup = {
        order_shop_id: orderShopId,
        order_id: orderId,
        shop_id: shopId,
        subtotal: g.subtotal,
        shipping_fee: g.shippingFee,
        discount: g.discount,
        total_amount: Math.max(0, shopGroupTotal),
        group_status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      shopGroups.push(newGroup);

      // Create shipment entry
      shipments.push({
        shipment_id: generateId(),
        order_shop_id: orderShopId,
        tracking_number: 'TRK' + Math.floor(10000000 + Math.random() * 90000000),
        carrier: 'Standard Express',
        shipment_status: 'PREPARING'
      });

      // Create Order Items
      g.items.forEach(item => {
        const itemDiscount = 0; // simple item level discount
        const subtotal = item.price * item.quantity - itemDiscount;

        orderItems.push({
          order_item_id: generateId(),
          order_id: orderId,
          order_shop_id: orderShopId,
          variant_id: item.variantId,
          quantity: item.quantity,
          unit_price: item.price,
          discount: itemDiscount,
          subtotal
        });
      });
    });

    db.set(KEYS.ORDER_GROUPS, shopGroups);
    db.set(KEYS.ORDER_ITEMS, orderItems);
    db.set(KEYS.SHIPMENTS, shipments);

    // 7. Add Order Status History
    const histories = db.get<OrderStatusHistory[]>(KEYS.ORDER_HISTORY);
    histories.push({
      history_id: generateId(),
      order_id: orderId,
      status: 'PENDING',
      note: 'Order successfully created. Waiting for confirmation/payment.',
      changed_at: new Date().toISOString()
    });
    db.set(KEYS.ORDER_HISTORY, histories);

    // 8. Create Payment record
    const payments = db.get<Payment[]>(KEYS.PAYMENTS);
    payments.push({
      payment_id: generateId(),
      order_id: orderId,
      transaction_code: 'TXN-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      amount: Math.max(0, totalAmount),
      payment_status: paymentMethodId.includes('cod') ? 'PENDING' : 'SUCCESS',
      paid_at: paymentMethodId.includes('cod') ? undefined : new Date().toISOString(),
      created_at: new Date().toISOString()
    });
    db.set(KEYS.PAYMENTS, payments);

    // 9. Clear purchased items from Cart
    const allCartItems = db.get<CartItem[]>(KEYS.CART_ITEMS);
    const cartIdsToKeep = allCartItems.filter(c => !checkoutItems.some(item => item.cartItemId === c.cart_item_id));
    db.set(KEYS.CART_ITEMS, cartIdsToKeep);

    // Update vouchers count
    const vouchers = db.get<Voucher[]>(KEYS.VOUCHERS);
    vouchersApplied.forEach(va => {
      const match = vouchers.find(v => v.voucher_code.toUpperCase() === va.code.toUpperCase());
      if (match) {
        match.used_count += 1;
      }
    });
    db.set(KEYS.VOUCHERS, vouchers);

    return newOrder;
  },
  // RETURN / REFUND helpers
  createReturnRequest: (orderId: string, orderItemId: string, userId: string, reason: string) => {
    const requests = db.get<any[]>('lumina_return_requests');
    const id = generateId();
    const req = {
      return_id: id,
      order_id: orderId,
      order_item_id: orderItemId,
      user_id: userId,
      reason,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    requests.push(req);
    db.set('lumina_return_requests', requests);
    db.recordAudit(userId, `Created return request ${id} for order ${orderId}`, 'RETURN_REQUEST_CREATED');
    return req;
  },
  getReturnRequests: () => db.get<any[]>('lumina_return_requests'),
  updateReturnRequestStatus: (returnId: string, status: string, adminId?: string, note?: string) => {
    const requests = db.get<any[]>('lumina_return_requests');
    const idx = requests.findIndex(r => r.return_id === returnId);
    if (idx === -1) return null;
    requests[idx].status = status;
    requests[idx].updated_at = new Date().toISOString();
    if (note) requests[idx].note = note;
    db.set('lumina_return_requests', requests);
    db.recordAudit(adminId || 'system', `Return ${returnId} set to ${status}${note ? ': ' + note : ''}`, 'RETURN_REQUEST_UPDATED');
    return requests[idx];
  },
  // Refund recording (mock)
  recordRefund: (returnId: string, amount: number, method: string, processedBy?: string) => {
    const refunds = db.get<any[]>('lumina_refunds');
    const r = { refund_id: generateId(), return_id: returnId, amount, method, processed_by: processedBy || null, created_at: new Date().toISOString() };

    // Persist refund
    refunds.push(r);
    db.set('lumina_refunds', refunds);

    // Try to reconcile refund to order/shop totals and inventory
    const returnReq = db.get<any[]>('lumina_return_requests').find(rr => rr.return_id === returnId);
    if (returnReq) {
      const orderItem = db.get<OrderItem[]>(KEYS.ORDER_ITEMS).find(oi => oi.order_item_id === returnReq.order_item_id);
      if (orderItem) {
        // Adjust order shop group totals
        const shopGroups = db.get<OrderShopGroup[]>(KEYS.ORDER_GROUPS);
        const groupIdx = shopGroups.findIndex(g => g.order_shop_id === orderItem.order_shop_id);
        if (groupIdx !== -1) {
          shopGroups[groupIdx].total_amount = Math.max(0, (shopGroups[groupIdx].total_amount || 0) - amount);
          shopGroups[groupIdx].updated_at = new Date().toISOString();
          db.set(KEYS.ORDER_GROUPS, shopGroups);
        }

        // Adjust parent order total
        const orders = db.get<Order[]>(KEYS.ORDERS);
        const parentOrderIdx = orders.findIndex(o => o.order_id === orderItem.order_id);
        if (parentOrderIdx !== -1) {
          orders[parentOrderIdx].total_amount = Math.max(0, (orders[parentOrderIdx].total_amount || 0) - amount);
          orders[parentOrderIdx].updated_at = new Date().toISOString();
          db.set(KEYS.ORDERS, orders);
        }

        // Restock inventory (simple approach: restock returned quantity)
        const inventories = db.get<Inventory[]>(KEYS.INVENTORY);
        const invIdx = inventories.findIndex(i => i.variant_id === orderItem.variant_id);
        if (invIdx !== -1) {
          inventories[invIdx].quantity = (inventories[invIdx].quantity || 0) + (orderItem.quantity || 0);
          inventories[invIdx].updated_at = new Date().toISOString();
          // reduce reserved_quantity if any
          inventories[invIdx].reserved_quantity = Math.max(0, (inventories[invIdx].reserved_quantity || 0) - (orderItem.quantity || 0));
          db.set(KEYS.INVENTORY, inventories);
        }

        // Decrease product sold quantity
        const variants = db.get<ProductVariant[]>(KEYS.VARIANTS);
        const products = db.get<Product[]>(KEYS.PRODUCTS);
        const v = variants.find(x => x.variant_id === orderItem.variant_id);
        if (v) {
          const prodIdx = products.findIndex(p => p.product_id === v.product_id);
          if (prodIdx !== -1) {
            products[prodIdx].sold_quantity = Math.max(0, (products[prodIdx].sold_quantity || 0) - (orderItem.quantity || 0));
            db.set(KEYS.PRODUCTS, products);
          }
        }
      }
    }

    db.recordAudit(processedBy || 'system', `Refund recorded ${r.refund_id} for return ${returnId} amount ${amount}`, 'REFUND_RECORDED');
    return r;
  },
  getRefunds: () => db.get<any[]>('lumina_refunds'),

  // Audit log
  recordAudit: (userId: string | null, message: string, action: string) => {
    const logs = db.get<any[]>('lumina_audit_logs');
    const entry = { id: generateId(), user_id: userId, action, message, created_at: new Date().toISOString() };
    logs.push(entry);
    db.set('lumina_audit_logs', logs);
    return entry;
  },
  getAuditLogs: () => db.get<any[]>('lumina_audit_logs'),
  updateOrderStatus: (orderId: string, status: Order['order_status'], note?: string): boolean => {
    const orders = db.get<Order[]>(KEYS.ORDERS);
    const index = orders.findIndex(o => o.order_id === orderId);
    if (index === -1) return false;

    orders[index].order_status = status;
    orders[index].updated_at = new Date().toISOString();
    db.set(KEYS.ORDERS, orders);

    // Update all shop groups
    const shopGroups = db.get<OrderShopGroup[]>(KEYS.ORDER_GROUPS);
    shopGroups.forEach(g => {
      if (g.order_id === orderId) {
        g.group_status = status as any;
        g.updated_at = new Date().toISOString();
      }
    });
    db.set(KEYS.ORDER_GROUPS, shopGroups);

    // Log status history
    const histories = db.get<OrderStatusHistory[]>(KEYS.ORDER_HISTORY);
    histories.push({
      history_id: generateId(),
      order_id: orderId,
      status,
      note: note || `Order status updated to ${status}`,
      changed_at: new Date().toISOString()
    });
    db.set(KEYS.ORDER_HISTORY, histories);

    // If completed or cancelled, handle stock adjustment
    if (status === 'CANCELLED') {
      const orderItems = db.get<OrderItem[]>(KEYS.ORDER_ITEMS).filter(i => i.order_id === orderId);
      const inventories = db.get<Inventory[]>(KEYS.INVENTORY);

      orderItems.forEach(item => {
        const inv = inventories.find(i => i.variant_id === item.variant_id);
        if (inv) {
          inv.reserved_quantity = Math.max(0, inv.reserved_quantity - item.quantity);
        }
      });
      db.set(KEYS.INVENTORY, inventories);
    } else if (status === 'COMPLETED') {
      // confirm stock deduction and update product sold counts
      const orderItems = db.get<OrderItem[]>(KEYS.ORDER_ITEMS).filter(i => i.order_id === orderId);
      const inventories = db.get<Inventory[]>(KEYS.INVENTORY);
      const products = db.get<Product[]>(KEYS.PRODUCTS);

      orderItems.forEach(item => {
        // deduct physical stock
        const inv = inventories.find(i => i.variant_id === item.variant_id);
        if (inv) {
          inv.quantity = Math.max(0, inv.quantity - item.quantity);
          inv.reserved_quantity = Math.max(0, inv.reserved_quantity - item.quantity);
        }

        // add to product sold count
        const pVariant = db.get<ProductVariant[]>(KEYS.VARIANTS).find(v => v.variant_id === item.variant_id);
        if (pVariant) {
          const prod = products.find(p => p.product_id === pVariant.product_id);
          if (prod) {
            prod.sold_quantity += item.quantity;
          }
        }
      });

      db.set(KEYS.INVENTORY, inventories);
      db.set(KEYS.PRODUCTS, products);

      // mark payment success
      const payments = db.get<Payment[]>(KEYS.PAYMENTS);
      const p = payments.find(pay => pay.order_id === orderId);
      if (p) {
        p.payment_status = 'SUCCESS';
        p.paid_at = new Date().toISOString();
        db.set(KEYS.PAYMENTS, payments);
      }
    }

    return true;
  },
  getSellerOrders: (shopId: string): OrderShopGroupWithDetails[] => {
    const groups = db.get<OrderShopGroup[]>(KEYS.ORDER_GROUPS).filter(g => g.shop_id === shopId);
    const orders = db.get<Order[]>(KEYS.ORDERS);
    const shipments = db.get<Shipment[]>(KEYS.SHIPMENTS);
    const orderItems = db.get<OrderItem[]>(KEYS.ORDER_ITEMS);
    const products = db.getProducts();

    return groups.map(g => {
      const order = orders.find(o => o.order_id === g.order_id)!;
      const shipment = shipments.find(s => s.order_shop_id === g.order_shop_id);

      const items = orderItems.filter(i => i.order_shop_id === g.order_shop_id).map(item => {
        let matchedProd: Product | null = null;
        let matchedVar: ProductVariant | null = null;

        for (const p of products) {
          const v = p.variants.find(v => v.variant_id === item.variant_id);
          if (v) {
            matchedProd = p;
            matchedVar = v;
            break;
          }
        }

        return {
          ...item,
          product: matchedProd || seedProducts[0],
          variant: matchedVar || seedVariants[0]
        };
      });

      return {
        ...g,
        order_code: order?.order_code,
        created_at: order?.created_at,
        shipment,
        items,
        shop: seedShops.find(s => s.shop_id === shopId)!
      };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  updateSellerOrderStatus: (orderShopId: string, status: OrderShopGroup['group_status']): boolean => {
    const groups = db.get<OrderShopGroup[]>(KEYS.ORDER_GROUPS);
    const idx = groups.findIndex(g => g.order_shop_id === orderShopId);
    if (idx === -1) return false;

    groups[idx].group_status = status;
    groups[idx].updated_at = new Date().toISOString();
    db.set(KEYS.ORDER_GROUPS, groups);

    // Also update shipment status
    const shipments = db.get<Shipment[]>(KEYS.SHIPMENTS);
    const shipIdx = shipments.findIndex(s => s.order_shop_id === orderShopId);
    if (shipIdx !== -1) {
      if (status === 'SHIPPING') {
        shipments[shipIdx].shipment_status = 'SHIPPING';
        shipments[shipIdx].shipped_at = new Date().toISOString();
      } else if (status === 'COMPLETED') {
        shipments[shipIdx].shipment_status = 'DELIVERED';
        shipments[shipIdx].delivered_at = new Date().toISOString();
      } else if (status === 'CANCELLED') {
        shipments[shipIdx].shipment_status = 'FAILED';
      }
      db.set(KEYS.SHIPMENTS, shipments);
    }

    // Check if all packages in the parent order are resolved to update parent order status
    const parentOrderId = groups[idx].order_id;
    const parentGroupPackages = groups.filter(g => g.order_id === parentOrderId);

    const allStatuses = parentGroupPackages.map(p => p.group_status);
    const uniqueStatuses = Array.from(new Set(allStatuses));

    if (uniqueStatuses.length === 1) {
      db.updateOrderStatus(parentOrderId, uniqueStatuses[0] as any);
    } else {
      // parent order becomes SHIPPING if at least one is SHIPPING
      if (allStatuses.includes('SHIPPING')) {
        db.updateOrderStatus(parentOrderId, 'SHIPPING');
      } else if (allStatuses.includes('PACKING')) {
        db.updateOrderStatus(parentOrderId, 'PACKING');
      }
    }

    return true;
  },

  // REVIEWS
  getReviews: (productId: string): ProductReviewWithUser[] => {
    const reviews = db.get<ProductReview[]>(KEYS.REVIEWS).filter(r => r.product_id === productId && r.status === 'VISIBLE');
    const users = db.get<User[]>(KEYS.USERS);
    const variants = db.get<ProductVariant[]>(KEYS.VARIANTS);

    return reviews.map(r => {
      const user = users.find(u => u.user_id === r.user_id) || { full_name: 'Anonymous', avatar: '' };

      // try to find variant details if order_item_id is mapped
      let variantName = '';
      if (r.order_item_id) {
        const orderItem = db.get<OrderItem[]>(KEYS.ORDER_ITEMS).find(oi => oi.order_item_id === r.order_item_id);
        if (orderItem) {
          const v = variants.find(vr => vr.variant_id === orderItem.variant_id);
          if (v && v.attributeValues) {
            variantName = v.attributeValues.map(av => av.value_name).join(' / ');
          }
        }
      }

      return {
        ...r,
        user: {
          full_name: user.full_name,
          avatar: user.avatar
        },
        variant_name: variantName
      };
    });
  },
  addReview: (userId: string, productId: string, rating: number, comment: string, orderItemId?: string): ProductReview => {
    const reviews = db.get<ProductReview[]>(KEYS.REVIEWS);
    const newReview: ProductReview = {
      review_id: generateId(),
      user_id: userId,
      product_id: productId,
      order_item_id: orderItemId,
      rating,
      comment,
      status: 'VISIBLE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    reviews.push(newReview);
    db.set(KEYS.REVIEWS, reviews);

    // Recompute product ratings
    const allProdReviews = reviews.filter(r => r.product_id === productId && r.status === 'VISIBLE');
    const totalRating = allProdReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / allProdReviews.length;

    const products = db.get<Product[]>(KEYS.PRODUCTS);
    const prodIdx = products.findIndex(p => p.product_id === productId);
    if (prodIdx !== -1) {
      products[prodIdx].average_rating = parseFloat(avgRating.toFixed(1));
      products[prodIdx].review_count = allProdReviews.length;
      db.set(KEYS.PRODUCTS, products);
    }

    return newReview;
  },

  // NOTIFICATIONS
  getNotifications: () => db.get<any[]>(KEYS.NOTIFICATIONS),
  markNotificationRead: (id: string) => {
    const list = db.get<any[]>(KEYS.NOTIFICATIONS);
    const idx = list.findIndex(n => n.id === id);
    if (idx !== -1) {
      list[idx].is_read = true;
      db.set(KEYS.NOTIFICATIONS, list);
    }
  },

  // SELLER PRODUCTS MANAGEMENT
  addSellerProduct: (shopId: string, product: Omit<Product, 'product_id' | 'shop_id' | 'average_rating' | 'review_count' | 'sold_quantity' | 'created_at' | 'updated_at'>, variantsList: { price: number; original_price?: number; sku: string; stock: number; attributes: { attribute_name: string; value_name: string }[] }[]): ProductWithDetails => {
    const products = db.get<Product[]>(KEYS.PRODUCTS);
    const pImages = db.get<ProductImage[]>(KEYS.PRODUCT_IMAGES);
    const variants = db.get<ProductVariant[]>(KEYS.VARIANTS);
    const inventories = db.get<Inventory[]>(KEYS.INVENTORY);

    const productId = generateId();
    const slug = product.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

    const newProduct: Product = {
      ...product,
      product_id: productId,
      shop_id: shopId,
      slug,
      status: 'ACTIVE',
      average_rating: 0,
      review_count: 0,
      sold_quantity: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    products.push(newProduct);
    db.set(KEYS.PRODUCTS, products);

    // Save main thumbnail image
    if (product.thumbnail) {
      pImages.push({
        image_id: generateId(),
        product_id: productId,
        image_url: product.thumbnail,
        display_order: 1,
        created_at: new Date().toISOString()
      });
      db.set(KEYS.PRODUCT_IMAGES, pImages);
    }

    // Save Variants
    const spawnedVariants: any[] = [];
    variantsList.forEach((v, index) => {
      const variantId = generateId();
      const newVar: ProductVariant = {
        variant_id: variantId,
        product_id: productId,
        sku: v.sku || 'SKU-' + Math.floor(100000 + Math.random() * 900000),
        price: v.price,
        original_price: v.original_price,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        attributeValues: v.attributes.map((a, i) => ({
          attribute_name: a.attribute_name,
          value_name: a.value_name,
          value_id: 'val-' + Math.random().toString(36).substring(2, 6)
        }))
      };
      variants.push(newVar);

      inventories.push({
        inventory_id: generateId(),
        variant_id: variantId,
        quantity: v.stock || 0,
        reserved_quantity: 0,
        updated_at: new Date().toISOString()
      });

      spawnedVariants.push({ ...newVar, inventory: inventories[inventories.length - 1] });
    });

    db.set(KEYS.VARIANTS, variants);
    db.set(KEYS.INVENTORY, inventories);

    return {
      ...newProduct,
      shop: db.getShop(shopId)!,
      images: pImages.filter(i => i.product_id === productId),
      variants: spawnedVariants
    };
  },
  deleteSellerProduct: (productId: string): boolean => {
    const products = db.get<Product[]>(KEYS.PRODUCTS);
    const idx = products.findIndex(p => p.product_id === productId);
    if (idx === -1) return false;

    // Delete variants and images as cascades
    products.splice(idx, 1);
    db.set(KEYS.PRODUCTS, products);

    const variants = db.get<ProductVariant[]>(KEYS.VARIANTS);
    const varsToDelete = variants.filter(v => v.product_id === productId).map(v => v.variant_id);
    db.set(KEYS.VARIANTS, variants.filter(v => v.product_id !== productId));

    const inventories = db.get<Inventory[]>(KEYS.INVENTORY);
    db.set(KEYS.INVENTORY, inventories.filter(i => !varsToDelete.includes(i.variant_id)));

    const images = db.get<ProductImage[]>(KEYS.PRODUCT_IMAGES);
    db.set(KEYS.PRODUCT_IMAGES, images.filter(i => i.product_id !== productId));

    return true;
  }
};

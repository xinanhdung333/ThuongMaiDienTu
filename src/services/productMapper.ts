import type { Category, Brand, ProductWithDetails, ProductVariantWithInventory, Shop } from '@/types';

export const fallbackCategories: Category[] = [
  {
    category_id: 'cat-1',
    category_name: 'Electronics',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&q=80',
    description: 'Smart devices and gadgets',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  },
  {
    category_id: 'cat-2',
    category_name: 'Fashion',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&q=80',
    description: 'Trendy accessories and apparel',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  },
  {
    category_id: 'cat-3',
    category_name: 'Home & Living',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&q=80',
    description: 'Comfortable and practical essentials',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  },
];

export const normalizeProduct = (product: any, shops: Shop[] = []): ProductWithDetails => {
  const shop = shops.find((entry) => entry.shop_id === product.shop_id) || {
    shop_id: product.shop_id || 'unknown-shop',
    owner_id: '',
    shop_name: 'Lumina Store',
    logo: '',
    description: 'Official store',
    rating: 5,
    total_followers: 0,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as Shop;

  const variants = (product.variants || []).map((variant: any): ProductVariantWithInventory => {
    const attributeValues = variant.attributeValues || variant.attributes?.map((entry: any) => ({
      attribute_name: entry.attribute_name || entry.attribute?.attribute_name || 'Option',
      value_name: entry.value_name || entry.value?.value_name || 'Default',
      value_id: entry.value_id || entry.value?.value_id || '',
    })) || [];

    return {
      ...variant,
      price: Number(variant.price ?? 0),
      original_price: variant.original_price === null || variant.original_price === undefined
        ? undefined
        : Number(variant.original_price),
      weight: variant.weight === null || variant.weight === undefined ? undefined : Number(variant.weight),
      inventory: variant.inventory?.[0] || variant.inventory || undefined,
      attributeValues,
    };
  });

  const images = (product.images || []).map((image: any) => ({
    ...image,
    image_url: image.image_url || image.url || '',
  }));

  return {
    ...product,
    shop,
    brand: product.brand || undefined,
    category: product.category || undefined,
    images,
    variants,
    thumbnail: product.thumbnail || images[0]?.image_url || '',
    average_rating: Number(product.average_rating ?? 0),
    review_count: Number(product.review_count ?? 0),
    sold_quantity: Number(product.sold_quantity ?? 0),
    slug: product.slug || product.product_id,
    status: product.status || 'ACTIVE',
  } as ProductWithDetails;
};

export const normalizeProducts = (products: any[], shops: Shop[] = []): ProductWithDetails[] => {
  return (products || []).map((product) => normalizeProduct(product, shops));
};

export const buildBrandOptions = (products: ProductWithDetails[]): Brand[] => {
  const uniqueBrands = new Map<string, Brand>();
  products.forEach((product) => {
    if (!product.brand?.brand_name) return;
    if (!uniqueBrands.has(product.brand.brand_name)) {
      uniqueBrands.set(product.brand.brand_name, {
        brand_id: product.brand.brand_id || `brand-${product.brand.brand_name.toLowerCase().replace(/\s+/g, '-')}`,
        brand_name: product.brand.brand_name,
        logo: product.brand.logo,
        description: product.brand.description,
      });
    }
  });

  return Array.from(uniqueBrands.values());
};

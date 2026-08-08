import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Inventory } from './entities/inventory.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage) private readonly imageRepository: Repository<ProductImage>,
    @InjectRepository(ProductVariant) private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(Inventory) private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  findAll(shopId?: string) {
    return this.productRepository.find({
      where: shopId ? { shop_id: shopId } : undefined,
      relations: ['images', 'variants', 'variants.inventory'],
    });
  }

  async findOne(product_id_or_slug: string) {
    const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let product: Product | null = null;
    if (uuidV4.test(product_id_or_slug)) {
      product = await this.productRepository.findOne({
        where: { product_id: product_id_or_slug },
        relations: ['images', 'variants', 'variants.inventory'],
      });
    } else {
      product = await this.productRepository.findOne({
        where: { slug: product_id_or_slug },
        relations: ['images', 'variants', 'variants.inventory'],
      });
    }
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(data: Partial<Product & { variants?: any[]; images?: any[] }>) {
    const variants = Array.isArray(data.variants) ? data.variants : [];
    const images = Array.isArray(data.images) ? data.images : [];
    const productData = { ...data } as any;
    delete productData.variants;
    delete productData.images;

    const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!productData.brand_id || productData.brand_id === '' || !uuidV4.test(productData.brand_id)) productData.brand_id = null;
    if (!productData.category_id || productData.category_id === '' || !uuidV4.test(productData.category_id)) productData.category_id = null;

    const product = this.productRepository.create(productData);

    const productId = await this.productRepository.manager.transaction(async (manager) => {
      const saved = (await manager.save(product)) as unknown as Product;

      for (const img of images) {
        const image = this.imageRepository.create({ product_id: saved.product_id, image_url: img.image_url, display_order: img.display_order || 1 });
        await manager.save(image);
      }

      for (const v of variants) {
        const variantData = {
          product_id: saved.product_id,
          sku: v.sku,
          price: Number(v.price) || 0,
          original_price: v.original_price === null || v.original_price === undefined || v.original_price === ''
            ? undefined
            : Number(v.original_price),
          weight: v.weight === null || v.weight === undefined || v.weight === ''
            ? undefined
            : Number(v.weight),
          status: v.status || 'ACTIVE',
        };
        const variant = this.variantRepository.create(variantData);
        const savedVar = (await manager.save(variant)) as unknown as ProductVariant;
        if (v.inventory) {
          const inv = this.inventoryRepository.create({ variant_id: savedVar.variant_id, quantity: v.inventory.quantity || 0, reserved_quantity: v.inventory.reserved_quantity || 0 });
          await manager.save(inv);
        }
      }

      return saved.product_id;
    });

    return this.findOne(productId);
  }

  async update(product_id: string, patch: Partial<Product>) {
    await this.productRepository.update({ product_id }, patch);
    return this.findOne(product_id);
  }

  async remove(product_id: string) {
    const product = await this.findOne(product_id);
    return this.productRepository.remove(product);
  }

  addImage(product_id: string, imageUrl: string) {
    const image = this.imageRepository.create({ product_id, image_url: imageUrl });
    return this.imageRepository.save(image);
  }

  async addVariant(product_id: string, data: Partial<ProductVariant>) {
    const payload = data as any;
    const variant = this.variantRepository.create({
      product_id,
      sku: payload.sku,
      price: Number(payload.price) || 0,
      original_price: payload.original_price === null || payload.original_price === undefined || payload.original_price === ''
        ? undefined
        : Number(payload.original_price),
      weight: payload.weight === null || payload.weight === undefined || payload.weight === ''
        ? undefined
        : Number(payload.weight),
      status: payload.status || 'ACTIVE',
    });
    const saved = await this.variantRepository.save(variant);
    const inventory = this.inventoryRepository.create({
      variant_id: saved.variant_id,
      quantity: Number(payload.inventory?.quantity ?? payload.stock ?? 99),
      reserved_quantity: Number(payload.inventory?.reserved_quantity ?? 0),
    });
    await this.inventoryRepository.save(inventory);
    return this.variantRepository.findOne({ where: { variant_id: saved.variant_id }, relations: ['inventory'] });
  }

  async updateVariant(variant_id: string, patch: Partial<ProductVariant>) {
    const variant = await this.variantRepository.findOne({ where: { variant_id } });
    if (!variant) throw new NotFoundException('Variant not found');

    Object.assign(variant, patch);
    return this.variantRepository.save(variant);
  }

  async removeVariant(variant_id: string) {
    const variant = await this.variantRepository.findOne({ where: { variant_id } });
    if (!variant) throw new NotFoundException('Variant not found');

    await this.inventoryRepository.delete({ variant_id });
    return this.variantRepository.remove(variant);
  }

  async updateInventory(variant_id: string, quantity: number) {
    const inventory = await this.inventoryRepository.findOne({ where: { variant_id } });
    if (!inventory) throw new NotFoundException('Inventory not found');
    inventory.quantity = quantity;
    return this.inventoryRepository.save(inventory);
  }
}

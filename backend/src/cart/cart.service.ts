import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { Product } from '../products/entities/product.entity';
import { Shop } from '../shops/entities/shop.entity';
import { Inventory } from '../products/entities/inventory.entity';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem) private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(ProductVariant) private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(Shop) private readonly shopRepository: Repository<Shop>,
    @InjectRepository(Inventory) private readonly inventoryRepository: Repository<Inventory>,
    private dataSource: DataSource,
  ) {}

  async getCart(userId: string) {
    const cart = await this.cartRepository.findOne({ where: { user_id: userId }, relations: ['items'] });
    if (!cart) {
      const created = await this.cartRepository.save(this.cartRepository.create({ user_id: userId }));
      return { cart_id: created.cart_id, user_id: created.user_id, items: [] };
    }

    if (cart.items && cart.items.length > 0) {
      try {
        for (let i = 0; i < cart.items.length; i++) {
          const item = cart.items[i];
          const variant = await this.variantRepository.findOne({
            where: { variant_id: item.variant_id },
            relations: ['attributes', 'attributes.value', 'attributes.value.attribute', 'inventory']
          });
          if (variant) {
            (variant as any).price = Number(variant.price);
            (variant as any).original_price = variant.original_price === null || variant.original_price === undefined
              ? undefined
              : Number(variant.original_price);
            (variant as any).attributeValues = (variant.attributes || []).map((entry: any) => ({
              attribute_name: entry.value?.attribute?.attribute_name || 'Option',
              value_name: entry.value?.value_name || 'Default',
              value_id: entry.value_id || entry.value?.value_id || '',
            }));
            (item as any).variant = variant;
            const product = await this.productRepository.findOne({
              where: { product_id: (variant as any).product_id },
              relations: ['images']
            });
            if (product) {
              (product as any).thumbnail = product.thumbnail || product.images?.[0]?.image_url || '';
              (item as any).product = product;
              const shop = await this.shopRepository.findOne({
                where: { shop_id: (product as any).shop_id }
              });
              if (shop) {
                (item as any).shop = shop;
              }
            }
          }
        }
      } catch (error) {
        this.logger.error('Failed to fetch item details for cart', error);
        const debugError = error instanceof Error ? error.message : String(error);
        (cart as any).debug_error = debugError;
      }
    }

    return cart;
  }

  async addItem(userId: string, variant_id: string, quantity: number) {
    const safeQuantity = Math.max(1, Number(quantity) || 1);
    const variant = await this.variantRepository.findOne({
      where: { variant_id },
      relations: ['inventory'],
    });
    if (!variant) throw new NotFoundException('Variant not found');

    let inventory = variant.inventory?.[0];
    if (!inventory) {
      inventory = await this.inventoryRepository.save(this.inventoryRepository.create({
        variant_id,
        quantity: 99,
        reserved_quantity: 0,
      }));
    }

    const cart = await this.getCart(userId);
    const existing = await this.cartItemRepository.findOne({ where: { cart_id: cart.cart_id, variant_id } });
    const nextQuantity = (existing?.quantity || 0) + safeQuantity;
    const available = inventory.quantity - inventory.reserved_quantity;
    if (available < nextQuantity) {
      throw new BadRequestException('Insufficient stock available');
    }

    if (existing) {
      existing.quantity = nextQuantity;
      return this.cartItemRepository.save(existing);
    }
    const item = this.cartItemRepository.create({ cart_id: cart.cart_id, variant_id, quantity: safeQuantity });
    return this.cartItemRepository.save(item);
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    const cart = await this.getCart(userId);
    const item = await this.cartItemRepository.findOne({ where: { cart_item_id: itemId, cart_id: cart.cart_id } });
    if (!item) throw new NotFoundException('Cart item not found');
    item.quantity = quantity;
    return this.cartItemRepository.save(item);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getCart(userId);
    const item = await this.cartItemRepository.findOne({ where: { cart_item_id: itemId, cart_id: cart.cart_id } });
    if (!item) throw new NotFoundException('Cart item not found');
    await this.cartItemRepository.remove(item);
    return { deleted: true };
  }

  async clearCart(userId: string) {
    const cart = await this.getCart(userId);
    await this.cartItemRepository.delete({ cart_id: cart.cart_id });
    return { cleared: true };
  }
}

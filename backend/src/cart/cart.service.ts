import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { Product } from '../products/entities/product.entity';
import { Shop } from '../shops/entities/shop.entity';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem) private readonly cartItemRepository: Repository<CartItem>,
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
        const variantRepo = this.dataSource.getRepository(ProductVariant);
        const productRepo = this.dataSource.getRepository(Product);
        const shopRepo = this.dataSource.getRepository(Shop);

        for (let i = 0; i < cart.items.length; i++) {
          const item = cart.items[i];
          const variant = await variantRepo.findOne({
            where: { variant_id: item.variant_id },
            relations: ['attributes', 'attributes.value', 'attributes.value.attribute', 'inventory']
          });
          if (variant) {
            (item as any).variant = variant;
            const product = await productRepo.findOne({
              where: { product_id: (variant as any).product_id },
              relations: ['images']
            });
            if (product) {
              (item as any).product = product;
              const shop = await shopRepo.findOne({
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
        (cart as any).debug_error = error.message || String(error);
      }
    }

    return cart;
  }

  async addItem(userId: string, variant_id: string, quantity: number) {
    const cart = await this.getCart(userId);
    const existing = await this.cartItemRepository.findOne({ where: { cart_id: cart.cart_id, variant_id } });
    if (existing) {
      existing.quantity += quantity;
      return this.cartItemRepository.save(existing);
    }
    const item = this.cartItemRepository.create({ cart_id: cart.cart_id, variant_id, quantity });
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

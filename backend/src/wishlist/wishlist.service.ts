import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistItem } from './entities/wishlist-item.entity';

@Injectable()
export class WishlistService {
  constructor(@InjectRepository(WishlistItem) private readonly wishlistRepository: Repository<WishlistItem>) {}

  async getWishlist(userId: string) {
    return this.wishlistRepository.find({ where: { user_id: userId } });
  }

  async toggle(userId: string, product_id: string) {
    const existing = await this.wishlistRepository.findOne({ where: { user_id: userId, product_id } });
    if (existing) {
      await this.wishlistRepository.remove(existing);
      return { added: false };
    }
    await this.wishlistRepository.save(this.wishlistRepository.create({ user_id: userId, product_id }));
    return { added: true };
  }

  async remove(userId: string, productId: string) {
    const existing = await this.wishlistRepository.findOne({ where: { user_id: userId, product_id: productId } });
    if (existing) {
      await this.wishlistRepository.remove(existing);
    }
    return { deleted: true };
  }
}

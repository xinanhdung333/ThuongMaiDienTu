import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get(':userId')
  getWishlist(@Param('userId') userId: string) {
    return this.wishlistService.getWishlist(userId);
  }

  @Post(':userId')
  toggle(@Param('userId') userId: string, @Body('product_id') product_id: string) {
    return this.wishlistService.toggle(userId, product_id);
  }

  @Delete(':userId/:productId')
  remove(@Param('userId') userId: string, @Param('productId') productId: string) {
    return this.wishlistService.remove(userId, productId);
  }
}

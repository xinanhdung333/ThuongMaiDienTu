import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':userId')
  getCart(@Param('userId') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post(':userId/items')
  addItem(@Param('userId') userId: string, @Body() body: { variant_id: string; quantity?: number }) {
    return this.cartService.addItem(userId, body.variant_id, body.quantity || 1);
  }

  @Patch(':userId/items/:itemId')
  updateItem(@Param('userId') userId: string, @Param('itemId') itemId: string, @Body('quantity') quantity: number) {
    return this.cartService.updateItem(userId, itemId, quantity);
  }

  @Delete(':userId/items/:itemId')
  removeItem(@Param('userId') userId: string, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(userId, itemId);
  }

  @Delete(':userId')
  clearCart(@Param('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }
}

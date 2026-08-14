import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CartService } from './cart.service';

@Controller('carts')
@UseGuards(AuthGuard('jwt'))
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':userId')
  getCart(@Param('userId') userId: string, @Req() req: any) {
    return this.cartService.getCart(this.requireOwner(userId, req));
  }

  @Post(':userId/items')
  addItem(@Param('userId') userId: string, @Body() body: { variant_id: string; quantity?: number }, @Req() req: any) {
    return this.cartService.addItem(this.requireOwner(userId, req), body.variant_id, body.quantity || 1);
  }

  @Patch(':userId/items/:itemId')
  updateItem(@Param('userId') userId: string, @Param('itemId') itemId: string, @Body('quantity') quantity: number, @Req() req: any) {
    return this.cartService.updateItem(this.requireOwner(userId, req), itemId, quantity);
  }

  @Delete(':userId/items/:itemId')
  removeItem(@Param('userId') userId: string, @Param('itemId') itemId: string, @Req() req: any) {
    return this.cartService.removeItem(this.requireOwner(userId, req), itemId);
  }

  @Delete(':userId')
  clearCart(@Param('userId') userId: string, @Req() req: any) {
    return this.cartService.clearCart(this.requireOwner(userId, req));
  }

  private requireOwner(userId: string, req: any) {
    if (req.user?.user_id !== userId) throw new ForbiddenException();
    return userId;
  }
}

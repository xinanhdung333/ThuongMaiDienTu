import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.ordersService.findAll(req.user.user_id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const order = await this.ordersService.findOne(id);
    if (order.user_id !== req.user.user_id) throw new ForbiddenException();
    return order;
  }

  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.ordersService.create(req.user.user_id, body);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string, @Req() req: any) {
    return this.ordersService.updateStatus(req.user.user_id, id, status);
  }

  @Post(':id/momo-create')
  createMoMo(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.ordersService.createMoMoPayment(req.user.user_id, id, body);
  }

  @Post(':id/cod/confirm-collection')
  confirmCodCollection(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.confirmCodCollection(req.user, id);
  }

  @Post('groups/:groupId/shipments')
  addShipment(@Param('groupId') groupId: string, @Body() body: any) {
    return this.ordersService.addShipment(groupId, body);
  }
}

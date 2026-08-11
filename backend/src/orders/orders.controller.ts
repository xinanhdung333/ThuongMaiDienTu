import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@Query('user_id') user_id?: string) {
    return this.ordersService.findAll(user_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.ordersService.create(body);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status);
  }

  @Post(':id/payments')
  addPayment(@Param('id') id: string, @Body() body: any) {
    return this.ordersService.addPayment(id, body);
  }

  @Post(':id/momo-create')
  createMoMo(@Param('id') id: string, @Body() body: any) {
    return this.ordersService.createMoMoPayment(id, body);
  }

  @Post('groups/:groupId/shipments')
  addShipment(@Param('groupId') groupId: string, @Body() body: any) {
    return this.ordersService.addShipment(groupId, body);
  }
}

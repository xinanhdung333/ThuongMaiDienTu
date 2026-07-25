import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { VouchersService } from './vouchers.service';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Get()
  findAll(@Query('shop_id') shop_id?: string) {
    return shop_id ? this.vouchersService.findActive(shop_id) : this.vouchersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vouchersService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.vouchersService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.vouchersService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vouchersService.remove(id);
  }
}

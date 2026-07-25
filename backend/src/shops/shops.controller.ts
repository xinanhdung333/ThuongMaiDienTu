import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ShopsService } from './shops.service';

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Get()
  getAll() {
    return this.shopsService.findAll();
  }

  @Get('owner/:ownerId')
  getByOwner(@Param('ownerId') ownerId: string) {
    return this.shopsService.findByOwner(ownerId);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.shopsService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.shopsService.create(body);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.shopsService.approve(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.shopsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shopsService.remove(id);
  }
}

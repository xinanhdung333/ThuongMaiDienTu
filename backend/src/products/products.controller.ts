import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  getAll(@Query('shop_id') shopId?: string) {
    return this.productsService.findAll(shopId);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.productsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.productsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post(':id/images')
  addImage(@Param('id') id: string, @Body('image_url') image_url: string) {
    return this.productsService.addImage(id, image_url);
  }

  @Post(':id/variants')
  addVariant(@Param('id') id: string, @Body() body: any) {
    return this.productsService.addVariant(id, body);
  }

  @Patch(':id/variants/:variantId')
  updateVariant(@Param('id') id: string, @Param('variantId') variantId: string, @Body() body: any) {
    return this.productsService.updateVariant(variantId, body);
  }

  @Delete(':id/variants/:variantId')
  removeVariant(@Param('id') id: string, @Param('variantId') variantId: string) {
    return this.productsService.removeVariant(variantId);
  }

  @Patch(':id/variants/:variantId/inventory')
  updateVariantInventory(@Param('id') id: string, @Param('variantId') variantId: string, @Body('quantity') quantity: number) {
    return this.productsService.updateInventory(variantId, quantity);
  }
}

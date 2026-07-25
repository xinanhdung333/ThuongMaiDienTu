import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Inventory } from './entities/inventory.entity';
import { VariantAttributeValue } from './entities/variant-attribute-value.entity';
import { AttributeValue } from './entities/attribute-value.entity';
import { Attribute } from './entities/attribute.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage, ProductVariant, Inventory, VariantAttributeValue, AttributeValue, Attribute])],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}

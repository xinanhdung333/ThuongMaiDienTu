import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderShopGroup } from './entities/order-shop-group.entity';
import { OrderItem } from './entities/order-item.entity';
import { Payment } from './entities/payment.entity';
import { Shipment } from './entities/shipment.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { Shop } from '../shops/entities/shop.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderShopGroup, OrderItem, Payment, Shipment, OrderStatusHistory, Shop, ProductVariant])],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PaymentsController } from './payments.controller';
import { Order } from './entities/order.entity';
import { OrderShopGroup } from './entities/order-shop-group.entity';
import { OrderItem } from './entities/order-item.entity';
import { Payment } from './entities/payment.entity';
import { Shipment } from './entities/shipment.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { Shop } from '../shops/entities/shop.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { Inventory } from '../products/entities/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderShopGroup, OrderItem, Payment, Shipment, OrderStatusHistory, Shop, ProductVariant, Inventory])],
  providers: [OrdersService],
  controllers: [OrdersController, PaymentsController],
  exports: [OrdersService],
})
export class OrdersModule {}

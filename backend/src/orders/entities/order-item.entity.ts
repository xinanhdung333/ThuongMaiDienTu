import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { OrderShopGroup } from './order-shop-group.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  order_item_id: string;

  @Column('uuid')
  order_id: string;

  @Column('uuid')
  order_shop_id: string;

  @Column('uuid')
  variant_id: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  unit_price: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  subtotal: number;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => OrderShopGroup, (group) => group.items)
  @JoinColumn({ name: 'order_shop_id' })
  orderShopGroup: OrderShopGroup;

  @ManyToOne(() => ProductVariant, { eager: true })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;
}

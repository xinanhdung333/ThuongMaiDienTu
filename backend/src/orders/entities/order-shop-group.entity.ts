import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';

@Entity('order_shop_groups')
export class OrderShopGroup {
  @PrimaryGeneratedColumn('uuid')
  order_shop_id: string;

  @Column('uuid')
  order_id: string;

  @Column('uuid')
  shop_id: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  shipping_fee: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  total_amount: number;

  @Column({ type: 'varchar', length: 30, default: 'PENDING' })
  group_status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: string;

  @ManyToOne(() => Order, (order) => order.shopGroups)
  order: Order;

  @OneToMany(() => OrderItem, (item) => item.orderShopGroup)
  items: OrderItem[];
}

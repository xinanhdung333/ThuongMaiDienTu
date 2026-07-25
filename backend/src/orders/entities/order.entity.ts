import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrderShopGroup } from './order-shop-group.entity';
import { OrderStatusHistory } from './order-status-history.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  order_id: string;

  @Column({ length: 30, unique: true })
  order_code: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid', { nullable: true })
  address_id?: string;

  @Column('uuid', { nullable: true })
  payment_method_id?: string;

  @Column('uuid', { nullable: true })
  shipping_method_id?: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  shipping_fee: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  total_amount: number;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @Column({ type: 'varchar', length: 30, default: 'PENDING' })
  order_status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: string;

  @OneToMany(() => OrderShopGroup, (group) => group.order)
  shopGroups: OrderShopGroup[];

  @OneToMany(() => OrderStatusHistory, (history) => history.order)
  statusHistory: OrderStatusHistory[];
}

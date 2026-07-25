import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_status_history')
export class OrderStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  history_id: string;

  @Column('uuid')
  order_id: string;

  @Column({ length: 30 })
  status: string;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  changed_at: string;

  @ManyToOne(() => Order, (order) => order.statusHistory)
  order: Order;
}

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  payment_id: string;

  @Column('uuid')
  order_id: string;

  @Column({ length: 150, nullable: true })
  transaction_code?: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  payment_status: string;

  @Column({ type: 'timestamp', nullable: true })
  paid_at?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;
}

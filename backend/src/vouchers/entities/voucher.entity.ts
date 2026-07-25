import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('vouchers')
export class Voucher {
  @PrimaryGeneratedColumn('uuid')
  voucher_id: string;

  @Column('uuid', { nullable: true })
  shop_id?: string;

  @Column({ length: 50, unique: true })
  voucher_code: string;

  @Column({ length: 150 })
  voucher_name: string;

  @Column({ length: 20 })
  discount_type: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  discount_value: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  max_discount?: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  min_order_amount: number;

  @Column({ type: 'int', nullable: true })
  usage_limit?: number;

  @Column({ type: 'int', default: 0 })
  used_count: number;

  @Column({ type: 'timestamp' })
  start_at: string;

  @Column({ type: 'timestamp' })
  end_at: string;

  @Column({ length: 20, default: 'ACTIVE' })
  status: string;
}

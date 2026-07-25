import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  shipment_id: string;

  @Column('uuid')
  order_shop_id: string;

  @Column({ length: 100, unique: true, nullable: true })
  tracking_number?: string;

  @Column({ length: 100, nullable: true })
  carrier?: string;

  @Column({ type: 'timestamp', nullable: true })
  shipped_at?: string;

  @Column({ type: 'timestamp', nullable: true })
  delivered_at?: string;

  @Column({ type: 'varchar', length: 30, default: 'PREPARING' })
  shipment_status: string;
}

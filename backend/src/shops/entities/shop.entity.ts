import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn('uuid')
  shop_id: string;

  @Column('uuid')
  owner_id: string;

  @Column({ length: 150 })
  shop_name: string;

  @Column({ type: 'text', nullable: true })
  logo?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'numeric', precision: 2, scale: 1, default: 5.0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  total_followers: number;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: string;
}

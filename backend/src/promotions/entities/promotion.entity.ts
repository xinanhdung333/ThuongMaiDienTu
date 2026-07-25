import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  promotion_id: string;

  @Column({ length: 150 })
  title: string;

  @Column({ length: 20 })
  type: string;

  @Column({ type: 'jsonb', nullable: true })
  criteria?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  benefits?: Record<string, any>;

  @Column({ type: 'timestamp' })
  start_at: string;

  @Column({ type: 'timestamp' })
  end_at: string;

  @Column({ length: 20, default: 'ACTIVE' })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;
}

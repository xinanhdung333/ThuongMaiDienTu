import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('product_reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  review_id: string;

  @Column('uuid')
  product_id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid', { nullable: true })
  order_item_id?: string | null;

  @Column('int')
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment?: string | null;

  @Column({ length: 20, default: 'VISIBLE' })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: string;
}

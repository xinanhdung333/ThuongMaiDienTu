import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  review_id: string;

  @Column('uuid')
  product_id: string;

  @Column('uuid')
  user_id: string;

  @Column('int')
  rating: number;

  @Column({ length: 1000 })
  title: string;

  @Column({ length: 2000 })
  comment: string;

  @Column({ type: 'jsonb', nullable: true })
  images?: string[];

  @Column({ length: 20, default: 'PUBLISHED' })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;
}

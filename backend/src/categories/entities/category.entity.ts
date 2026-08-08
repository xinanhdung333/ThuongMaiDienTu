import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  category_id: string;

  @Column('uuid', { nullable: true })
  parent_id?: string | null;

  @Column({ length: 150 })
  category_name: string;

  @Column({ type: 'text', nullable: true })
  image?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ length: 20, default: 'ACTIVE' })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;
}

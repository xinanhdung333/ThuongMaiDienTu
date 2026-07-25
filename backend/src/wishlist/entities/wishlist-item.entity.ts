import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('wishlists')
export class WishlistItem {
  @PrimaryGeneratedColumn('uuid')
  wishlist_id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid')
  product_id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;
}

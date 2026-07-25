import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  product_id: string;

  @Column('uuid')
  shop_id: string;

  @Column('uuid', { nullable: true })
  brand_id?: string;

  @Column('uuid', { nullable: true })
  category_id?: string;

  @Column({ length: 255 })
  product_name: string;

  @Column({ length: 255, unique: true, nullable: true })
  slug?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  thumbnail?: string;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;

  @Column({ type: 'numeric', precision: 2, scale: 1, default: 0 })
  average_rating: number;

  @Column({ type: 'int', default: 0 })
  review_count: number;

  @Column({ type: 'int', default: 0 })
  sold_quantity: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: string;

  @OneToMany(() => ProductImage, (image) => image.product)
  images: ProductImage[];

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: ProductVariant[];
}

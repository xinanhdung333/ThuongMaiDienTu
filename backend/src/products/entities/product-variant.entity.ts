import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';
import { Inventory } from './inventory.entity';
import { VariantAttributeValue } from './variant-attribute-value.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  variant_id: string;

  @Column('uuid')
  product_id: string;

  @Column({ length: 80, unique: true })
  sku: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  original_price?: number;

  @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
  weight?: number;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: string;

  @ManyToOne(() => Product, (product) => product.variants)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @OneToMany(() => Inventory, (inventory) => inventory.variant)
  inventory: Inventory[];

  @OneToMany(() => VariantAttributeValue, (attr) => attr.variant)
  attributes: VariantAttributeValue[];
}

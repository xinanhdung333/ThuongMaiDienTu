import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductVariant } from './product-variant.entity';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  inventory_id: string;

  @Column('uuid')
  variant_id: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  reserved_quantity: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: string;

  @ManyToOne(() => ProductVariant, (variant) => variant.inventory)
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;
}

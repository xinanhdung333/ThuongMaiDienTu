import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { AttributeValue } from './attribute-value.entity';

@Entity('variant_attribute_values')
export class VariantAttributeValue {
  @PrimaryColumn('uuid')
  variant_id: string;

  @PrimaryColumn('uuid')
  value_id: string;

  @ManyToOne(() => ProductVariant, (variant) => variant.attributes)
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @ManyToOne(() => AttributeValue, (value) => value.variantAttributes)
  @JoinColumn({ name: 'value_id' })
  value: AttributeValue;
}

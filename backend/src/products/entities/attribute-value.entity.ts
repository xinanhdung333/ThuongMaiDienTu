import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Attribute } from './attribute.entity';
import { VariantAttributeValue } from './variant-attribute-value.entity';

@Entity('attribute_values')
export class AttributeValue {
  @PrimaryGeneratedColumn('uuid')
  value_id: string;

  @Column('uuid')
  attribute_id: string;

  @Column({ length: 100 })
  value_name: string;

  @ManyToOne(() => Attribute, (attribute) => attribute.values)
  @JoinColumn({ name: 'attribute_id' })
  attribute: Attribute;

  @OneToMany(() => VariantAttributeValue, (variant) => variant.value)
  variantAttributes: VariantAttributeValue[];
}

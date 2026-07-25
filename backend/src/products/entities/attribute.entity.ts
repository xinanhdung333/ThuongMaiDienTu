import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AttributeValue } from './attribute-value.entity';

@Entity('attributes')
export class Attribute {
  @PrimaryGeneratedColumn('uuid')
  attribute_id: string;

  @Column({ length: 100, unique: true })
  attribute_name: string;

  @OneToMany(() => AttributeValue, (value) => value.attribute)
  values: AttributeValue[];
}

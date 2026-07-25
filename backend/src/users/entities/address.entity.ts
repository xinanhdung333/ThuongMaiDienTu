import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  address_id: string;

  @Column('uuid')
  user_id: string;

  @Column({ length: 120 })
  receiver_name: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 120 })
  province: string;

  @Column({ length: 120 })
  district: string;

  @Column({ length: 120 })
  ward: string;

  @Column('text')
  detail_address: string;

  @Column({ default: false })
  is_default: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  @ManyToOne(() => User, (user) => user.addresses)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

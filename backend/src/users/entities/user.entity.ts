import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Address } from './address.entity';
import { UserRole } from './user-role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ length: 120 })
  full_name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 20, unique: true, nullable: true })
  phone?: string;

  @Column('text')
  password_hash: string;

  @Column({ type: 'text', nullable: true })
  avatar?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender?: string;

  @Column({ type: 'date', nullable: true })
  birthday?: string;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: string;

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];

  @OneToMany(() => UserRole, (role) => role.user)
  roles: UserRole[];
}

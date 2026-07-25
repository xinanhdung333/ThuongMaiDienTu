import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  notification_id: string;

  @Column('uuid')
  recipient_id: string;

  @Column({ length: 150 })
  title: string;

  @Column({ length: 2000 })
  content: string;

  @Column({ length: 20, default: 'UNREAD' })
  status: string;

  @Column({ length: 50 })
  type: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;
}

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  message_id: string;

  @Column('uuid')
  sender_id: string;

  @Column('uuid')
  recipient_id: string;

  @Column({ length: 2000 })
  content: string;

  @Column({ length: 20, default: 'UNREAD' })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;
}

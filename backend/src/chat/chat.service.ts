import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(@InjectRepository(Message) private readonly messageRepository: Repository<Message>) {}

  findConversation(userA: string, userB: string) {
    return this.messageRepository.find({
      where: [
        { sender_id: userA, recipient_id: userB },
        { sender_id: userB, recipient_id: userA },
      ],
      order: { created_at: 'ASC' },
    });
  }

  findUnread(user_id: string) {
    return this.messageRepository.find({ where: { recipient_id: user_id, status: 'UNREAD' }, order: { created_at: 'ASC' } });
  }

  async findOne(message_id: string) {
    const message = await this.messageRepository.findOne({ where: { message_id } });
    if (!message) throw new NotFoundException('Message not found');
    return message;
  }

  create(data: Partial<Message>) {
    const message = this.messageRepository.create(data);
    return this.messageRepository.save(message);
  }

  async markRead(message_id: string) {
    await this.messageRepository.update({ message_id }, { status: 'READ' });
    return this.findOne(message_id);
  }
}

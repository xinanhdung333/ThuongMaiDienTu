import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  findAllForUser(recipient_id: string) {
    return this.notificationRepository.find({ where: { recipient_id }, order: { created_at: 'DESC' } });
  }

  async findOne(notification_id: string) {
    const notification = await this.notificationRepository.findOne({ where: { notification_id } });
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  create(data: Partial<Notification>) {
    const notification = this.notificationRepository.create(data);
    return this.notificationRepository.save(notification);
  }

  async markRead(notification_id: string) {
    await this.notificationRepository.update({ notification_id }, { status: 'READ' });
    return this.findOne(notification_id);
  }

  async remove(notification_id: string) {
    const notification = await this.findOne(notification_id);
    return this.notificationRepository.remove(notification);
  }
}

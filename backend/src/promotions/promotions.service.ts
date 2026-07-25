import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
  ) {}

  findAll() {
    return this.promotionRepository.find({ order: { start_at: 'ASC' } });
  }

  findActive() {
    return this.promotionRepository.find({ where: { status: 'ACTIVE' }, order: { start_at: 'ASC' } });
  }

  async findOne(promotion_id: string) {
    const promotion = await this.promotionRepository.findOne({ where: { promotion_id } });
    if (!promotion) throw new NotFoundException('Promotion not found');
    return promotion;
  }

  create(data: Partial<Promotion>) {
    const promotion = this.promotionRepository.create(data);
    return this.promotionRepository.save(promotion);
  }

  async update(promotion_id: string, patch: Partial<Promotion>) {
    await this.promotionRepository.update({ promotion_id }, patch);
    return this.findOne(promotion_id);
  }

  async remove(promotion_id: string) {
    const promotion = await this.findOne(promotion_id);
    return this.promotionRepository.remove(promotion);
  }
}

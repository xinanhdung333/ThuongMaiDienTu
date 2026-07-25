import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from './entities/shop.entity';

@Injectable()
export class ShopsService {
  constructor(@InjectRepository(Shop) private readonly shopRepository: Repository<Shop>) {}

  findAll() {
    return this.shopRepository.find();
  }

  async findOne(shop_id: string) {
    const shop = await this.shopRepository.findOne({ where: { shop_id } });
    if (!shop) throw new NotFoundException('Shop not found');
    return shop;
  }

  async findByOwner(owner_id: string) {
    return this.shopRepository.findOne({ where: { owner_id } });
  }

  async create(data: Partial<Shop>) {
    const existing = await this.findByOwner(data.owner_id as string);
    if (existing) {
      throw new BadRequestException('This user already has a shop registration.');
    }

    const normalizedStatus = String(data.status || 'PENDING').toUpperCase();
    const shop = this.shopRepository.create({
      ...data,
      status: normalizedStatus,
    });
    return this.shopRepository.save(shop);
  }

  async approve(shop_id: string) {
    const shop = await this.findOne(shop_id);
    shop.status = 'ACTIVE';
    return this.shopRepository.save(shop);
  }

  async update(shop_id: string, patch: Partial<Shop>) {
    await this.shopRepository.update({ shop_id }, patch);
    return this.findOne(shop_id);
  }

  async remove(shop_id: string) {
    const shop = await this.findOne(shop_id);
    return this.shopRepository.remove(shop);
  }
}

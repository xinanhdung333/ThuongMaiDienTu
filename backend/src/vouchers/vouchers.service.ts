import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Voucher } from './entities/voucher.entity';

@Injectable()
export class VouchersService {
  constructor(@InjectRepository(Voucher) private readonly voucherRepository: Repository<Voucher>) {}

  findAll() {
    return this.voucherRepository.find();
  }

  findActive(shop_id?: string) {
    const query = this.voucherRepository.createQueryBuilder('voucher').where('voucher.status = :status', { status: 'ACTIVE' });
    if (shop_id) query.andWhere('voucher.shop_id = :shop_id', { shop_id });
    return query.getMany();
  }

  async findOne(voucher_id: string) {
    const voucher = await this.voucherRepository.findOne({ where: { voucher_id } });
    if (!voucher) throw new NotFoundException('Voucher not found');
    return voucher;
  }

  create(data: Partial<Voucher>) {
    const voucher = this.voucherRepository.create(data);
    return this.voucherRepository.save(voucher);
  }

  async update(voucher_id: string, patch: Partial<Voucher>) {
    await this.voucherRepository.update({ voucher_id }, patch);
    return this.findOne(voucher_id);
  }

  async remove(voucher_id: string) {
    const voucher = await this.findOne(voucher_id);
    return this.voucherRepository.remove(voucher);
  }
}

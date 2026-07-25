import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(@InjectRepository(Review) private readonly reviewRepository: Repository<Review>) {}

  findAll() {
    return this.reviewRepository.find();
  }

  findByProduct(product_id: string) {
    return this.reviewRepository.find({ where: { product_id, status: 'PUBLISHED' } });
  }

  async findOne(review_id: string) {
    const review = await this.reviewRepository.findOne({ where: { review_id } });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  create(data: Partial<Review>) {
    const review = this.reviewRepository.create(data);
    return this.reviewRepository.save(review);
  }

  async update(review_id: string, patch: Partial<Review>) {
    await this.reviewRepository.update({ review_id }, patch);
    return this.findOne(review_id);
  }

  async remove(review_id: string) {
    const review = await this.findOne(review_id);
    return this.reviewRepository.remove(review);
  }
}

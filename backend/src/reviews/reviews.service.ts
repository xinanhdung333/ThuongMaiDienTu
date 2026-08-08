import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class ReviewsService {
  private readonly uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  constructor(
    @InjectRepository(Review) private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
  ) {}

  findAll() {
    return this.reviewRepository.find();
  }

  async findByProduct(product_id_or_slug: string) {
    const product_id = await this.resolveProductId(product_id_or_slug);
    if (!product_id) return [];

    return this.reviewRepository.find({
      where: { product_id, status: 'VISIBLE' },
      order: { created_at: 'DESC' },
    });
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

  private async resolveProductId(product_id_or_slug: string) {
    if (this.uuidV4.test(product_id_or_slug)) return product_id_or_slug;

    const product = await this.productRepository.findOne({
      where: { slug: product_id_or_slug },
      select: { product_id: true },
    });

    return product?.product_id;
  }
}

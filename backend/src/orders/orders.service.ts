import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { randomUUID } from 'crypto';
import { Order } from './entities/order.entity';
import { OrderShopGroup } from './entities/order-shop-group.entity';
import { OrderItem } from './entities/order-item.entity';
import { Shop } from '../shops/entities/shop.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { Payment } from './entities/payment.entity';
import { Shipment } from './entities/shipment.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderShopGroup) private readonly groupRepository: Repository<OrderShopGroup>,
    @InjectRepository(OrderItem) private readonly itemRepository: Repository<OrderItem>,
    @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Shipment) private readonly shipmentRepository: Repository<Shipment>,
    @InjectRepository(OrderStatusHistory) private readonly historyRepository: Repository<OrderStatusHistory>,
    private readonly dataSource: DataSource,
  ) {}

  findAll(user_id?: string) {
    const options: any = {
      relations: [
        'shopGroups',
        'shopGroups.shop',
        'shopGroups.items',
        'shopGroups.items.variant',
        'shopGroups.items.variant.product',
        'statusHistory',
        'address'
      ],
      order: { created_at: 'DESC' },
    };
    if (user_id) {
      options.where = { user_id };
    }
    return this.orderRepository.find(options);
  }

  async findOne(order_id: string) {
    const order = await this.orderRepository.findOne({
      where: { order_id },
      relations: [
        'shopGroups',
        'shopGroups.shop',
        'shopGroups.items',
        'shopGroups.items.variant',
        'shopGroups.items.variant.product',
        'statusHistory',
        'address'
      ]
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(data: Partial<Order>) {
    // basic validation: ensure referenced shops and variants exist
    const groups = Array.isArray((data as any).shopGroups) ? (data as any).shopGroups : [];
    const shopIds = groups.map((g: any) => g.shop_id).filter(Boolean);
    const variantIds = groups.flatMap((g: any) => (g.items || []).map((it: any) => it.variant_id)).filter(Boolean);

    if (shopIds.length) {
      const existingShops = await this.dataSource.manager.find(Shop, { where: { shop_id: In(shopIds) } as any });
      const existingShopIds = new Set(existingShops.map(s => (s as any).shop_id));
      const missingShops = shopIds.filter((id: string) => !existingShopIds.has(id));
      if (missingShops.length) {
        throw new BadRequestException(`Referenced shops not found: ${missingShops.join(', ')}`);
      }
    }

    if (variantIds.length) {
      const existingVariants = await this.dataSource.manager.find(ProductVariant, { where: { variant_id: In(variantIds) } as any });
      const existingVariantIds = new Set(existingVariants.map(v => (v as any).variant_id));
      const missingVariants = variantIds.filter((id: string) => !existingVariantIds.has(id));
      if (missingVariants.length) {
        throw new BadRequestException(`Referenced variants not found: ${missingVariants.join(', ')}`);
      }
    }

    const { shopGroups: inputShopGroups, ...orderFields } = data as any;
    const order: Order = this.orderRepository.create({
      ...orderFields,
      order_code: data.order_code ?? this.generateOrderCode(),
    } as Partial<Order>);

    // groups/items will be persisted explicitly after the order is saved

    const savedOrderId = await this.dataSource.transaction(async (manager) => {
      // save order first to obtain order_id
      const savedOrder = await manager.save(Order, order);

      // then persist shop groups and items with explicit FK values
      if (Array.isArray(inputShopGroups)) {
        for (const g of inputShopGroups) {
          const { items: groupItems, ...groupFields } = g;
          const subtotal = Number(groupFields.subtotal ?? 0);
          const shippingFee = Number(groupFields.shipping_fee ?? 0);
          const discount = Number(groupFields.discount ?? 0);
          const grpEntity: OrderShopGroup = this.groupRepository.create({
            ...groupFields,
            subtotal,
            shipping_fee: shippingFee,
            discount,
            total_amount: Math.max(0, subtotal + shippingFee - discount),
            order_id: savedOrder.order_id,
          } as Partial<OrderShopGroup>);
          const savedGrp = await manager.save(OrderShopGroup, grpEntity);

          if (Array.isArray(groupItems) && groupItems.length) {
            const items = groupItems.map((it: any) => ({
              ...it,
              order_id: savedOrder.order_id,
              order_shop_id: savedGrp.order_shop_id,
            } as any));
            for (const it of items) {
              await manager.query(
                `INSERT INTO order_items(order_id, order_shop_id, variant_id, quantity, unit_price, discount, subtotal) VALUES($1,$2,$3,$4,$5,$6,$7)`,
                [it.order_id, it.order_shop_id, it.variant_id, it.quantity, it.unit_price, it.discount || 0, it.subtotal],
              );
            }
          }
        }
      }

      return savedOrder.order_id;
    });

    return this.findOne(savedOrderId);
  }

  private generateOrderCode() {
    return `ORD-${randomUUID().split('-')[0].toUpperCase()}`;
  }

  async updateStatus(order_id: string, status: string) {
    await this.orderRepository.update({ order_id }, { order_status: status, updated_at: new Date().toISOString() });
    await this.historyRepository.save({ order_id, status, changed_at: new Date().toISOString() } as OrderStatusHistory);
    return this.findOne(order_id);
  }

  async addPayment(order_id: string, payment: Partial<Payment>) {
    const record = this.paymentRepository.create({ ...payment, order_id });
    return this.paymentRepository.save(record);
  }

  async addShipment(order_shop_id: string, shipment: Partial<Shipment>) {
    const record = this.shipmentRepository.create({ ...shipment, order_shop_id });
    return this.shipmentRepository.save(record);
  }
}

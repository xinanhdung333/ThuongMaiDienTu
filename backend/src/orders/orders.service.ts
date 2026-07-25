import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderShopGroup } from './entities/order-shop-group.entity';
import { OrderItem } from './entities/order-item.entity';
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
  ) {}

  findAll() {
    return this.orderRepository.find({ relations: ['shopGroups', 'statusHistory'] });
  }

  async findOne(order_id: string) {
    const order = await this.orderRepository.findOne({ where: { order_id }, relations: ['shopGroups', 'statusHistory'] });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  create(data: Partial<Order>) {
    const order = this.orderRepository.create(data);
    return this.orderRepository.save(order);
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

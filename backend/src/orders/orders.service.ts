import { Injectable, NotFoundException, BadRequestException, BadGatewayException, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { randomUUID } from 'crypto';
import { Order } from './entities/order.entity';
import { OrderShopGroup } from './entities/order-shop-group.entity';
import { OrderItem } from './entities/order-item.entity';
import { Shop } from '../shops/entities/shop.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { Inventory } from '../products/entities/inventory.entity';
import { Payment } from './entities/payment.entity';
import { Shipment } from './entities/shipment.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import axios from 'axios';
import * as crypto from 'crypto';

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

  async createMoMoPayment(order_id: string, payload: { amount: number; orderInfo?: string }) {
    const order = await this.orderRepository.findOne({ where: { order_id } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.order_status !== 'PENDING') throw new BadRequestException('Only pending orders can be paid');
    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretkey = process.env.MOMO_SECRET;
    if (!partnerCode || !accessKey || !secretkey) {
      throw new BadRequestException('MoMo chưa được cấu hình. Hãy thiết lập MOMO_PARTNER_CODE, MOMO_ACCESS_KEY và MOMO_SECRET trong backend/.env.');
    }

    const expectedAmount = Number(order.total_amount);
    if (!Number.isFinite(expectedAmount) || expectedAmount < 1000) {
      throw new BadRequestException('Số tiền thanh toán MoMo phải từ 1.000 VND.');
    }

    const requestId = `${partnerCode}${Date.now()}`;
    const orderId = requestId;
    const amount = String(Math.round(expectedAmount));
    const orderInfo = payload.orderInfo || `Order ${order_id}`;
    const redirectUrl = process.env.MOMO_REDIRECT_URL;
    const ipnUrl = process.env.MOMO_IPN_URL;
    if (!redirectUrl || !ipnUrl) {
      throw new BadRequestException('MoMo chưa có MOMO_REDIRECT_URL hoặc MOMO_IPN_URL trong backend/.env.');
    }
    const requestType = process.env.MOMO_REQUEST_TYPE || 'captureWallet';
    const extraData = '';

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = crypto.createHmac('sha256', secretkey).update(rawSignature).digest('hex');

    const body = {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: 'en'
    };

    try {
      const resp = await axios.post(
        process.env.MOMO_API_URL || 'https://test-payment.momo.vn/v2/gateway/api/create',
        body,
        {
          timeout: 30000,
          headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        },
      );
      if (resp.data?.resultCode !== 0 || !resp.data?.payUrl) {
        throw new BadRequestException(resp.data?.message || 'MoMo could not create a payment link');
      }
      await this.paymentRepository.upsert({
        order_id,
        transaction_code: orderId,
        amount: expectedAmount,
        payment_status: 'PENDING',
      }, ['order_id']);
      return resp.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // MoMo returns useful resultCode/message in its response body. Preserve
        // it instead of masking every upstream validation error as a 502.
        if (error.response) {
          throw new HttpException(
            error.response.data || { message: 'MoMo Sandbox từ chối yêu cầu thanh toán.' },
            error.response.status,
          );
        }
        const reason = error.code || error.message;
        throw new BadGatewayException(`Không thể kết nối tới MoMo Sandbox: ${reason}`);
      }
      throw error;
    }
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
    if (!Array.isArray(inputShopGroups) || inputShopGroups.length === 0) {
      throw new BadRequestException('Order must contain at least one shop group');
    }
    const order: Order = this.orderRepository.create({
      ...orderFields,
      order_code: data.order_code ?? this.generateOrderCode(),
    } as Partial<Order>);

    // groups/items will be persisted explicitly after the order is saved

    const savedOrderId = await this.dataSource.transaction(async (manager) => {
      let calculatedSubtotal = 0;
      const normalizedGroups: any[] = [];
      for (const group of inputShopGroups) {
        const normalizedItems: any[] = [];
        for (const inputItem of group.items || []) {
          const quantity = Number(inputItem.quantity);
          if (!Number.isInteger(quantity) || quantity <= 0) throw new BadRequestException('Invalid item quantity');
          const variant = await manager.findOne(ProductVariant, { where: { variant_id: inputItem.variant_id } });
          if (!variant || variant.status !== 'ACTIVE') throw new BadRequestException('Product variant is unavailable');
          const inventory = await manager.createQueryBuilder(Inventory, 'inventory')
            .setLock('pessimistic_write')
            .where('inventory.variant_id = :variantId', { variantId: variant.variant_id })
            .getOne();
          if (!inventory || inventory.quantity - inventory.reserved_quantity < quantity) {
            throw new BadRequestException(`Insufficient stock for variant ${variant.variant_id}`);
          }
          inventory.reserved_quantity += quantity;
          await manager.save(Inventory, inventory);
          const unitPrice = Number(variant.price);
          const subtotal = unitPrice * quantity;
          calculatedSubtotal += subtotal;
          normalizedItems.push({ variant_id: variant.variant_id, quantity, unit_price: unitPrice, discount: 0, subtotal });
        }
        if (!normalizedItems.length) throw new BadRequestException('A shop group must contain items');
        normalizedGroups.push({ ...group, items: normalizedItems });
      }
      const shippingFee = Number(orderFields.shipping_fee || 0);
      const discount = Number(orderFields.discount || 0);
      if (shippingFee < 0 || discount < 0 || discount > calculatedSubtotal + shippingFee) throw new BadRequestException('Invalid order totals');
      order.subtotal = calculatedSubtotal;
      order.shipping_fee = shippingFee;
      order.discount = discount;
      order.total_amount = calculatedSubtotal + shippingFee - discount;

      // save order first to obtain order_id
      const savedOrder = await manager.save(Order, order);
      await manager.save(Payment, manager.create(Payment, {
        order_id: savedOrder.order_id,
        amount: savedOrder.total_amount,
        payment_status: 'PENDING',
      }));

      // then persist shop groups and items with explicit FK values
      if (Array.isArray(normalizedGroups)) {
        for (const g of normalizedGroups) {
          const { items: groupItems, ...groupFields } = g;
          const subtotal = groupItems.reduce((sum: number, item: any) => sum + item.subtotal, 0);
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
    const order = await this.findOne(order_id);
    const nextStatus = String(status || '').toUpperCase();
    if (nextStatus === 'CANCELLED' && order.order_status !== 'CANCELLED') {
      await this.releaseReservation(order_id);
    }
    await this.orderRepository.update({ order_id }, { order_status: nextStatus, updated_at: new Date().toISOString() });
    await this.historyRepository.save({ order_id, status: nextStatus, changed_at: new Date().toISOString() } as OrderStatusHistory);
    return this.findOne(order_id);
  }

  async handleMoMoIpn(payload: Record<string, any>) {
    const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${payload.amount}&extraData=${payload.extraData || ''}&message=${payload.message || ''}&orderId=${payload.orderId}&orderInfo=${payload.orderInfo}&orderType=${payload.orderType || ''}&partnerCode=${payload.partnerCode}&payType=${payload.payType || ''}&requestId=${payload.requestId}&responseTime=${payload.responseTime}&resultCode=${payload.resultCode}&transId=${payload.transId}`;
    const expectedSignature = crypto.createHmac('sha256', process.env.MOMO_SECRET || '').update(rawSignature).digest('hex');
    const payment = await this.paymentRepository.findOne({ where: { transaction_code: payload.orderId } });
    const signature = String(payload.signature || '');
    if (!payment || signature.length !== expectedSignature.length || !crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))) {
      return { resultCode: 1, message: 'Invalid payment notification' };
    }
    if (Number(payment.amount) !== Number(payload.amount)) return { resultCode: 1, message: 'Amount mismatch' };
    if (payment.payment_status === 'SUCCESS') return { resultCode: 0, message: 'Success' };
    if (Number(payload.resultCode) !== 0) {
      payment.payment_status = 'FAILED';
      await this.paymentRepository.save(payment);
      await this.updateStatus(payment.order_id, 'CANCELLED');
      return { resultCode: 0, message: 'Failure recorded' };
    }
    await this.dataSource.transaction(async (manager) => {
      const items = await manager.find(OrderItem, { where: { order_id: payment.order_id } });
      for (const item of items) {
        const inventory = await manager.createQueryBuilder(Inventory, 'inventory')
          .setLock('pessimistic_write').where('inventory.variant_id = :id', { id: item.variant_id }).getOneOrFail();
        inventory.reserved_quantity -= item.quantity;
        inventory.quantity -= item.quantity;
        await manager.save(Inventory, inventory);
      }
      await manager.update(Payment, { payment_id: payment.payment_id }, {
        payment_status: 'SUCCESS', paid_at: new Date().toISOString(),
      });
      await manager.update(Order, { order_id: payment.order_id }, { order_status: 'CONFIRMED', updated_at: new Date().toISOString() });
      await manager.save(OrderStatusHistory, manager.create(OrderStatusHistory, { order_id: payment.order_id, status: 'CONFIRMED' }));
    });
    return { resultCode: 0, message: 'Success' };
  }

  private async releaseReservation(orderId: string) {
    await this.dataSource.transaction(async (manager) => {
      const items = await manager.find(OrderItem, { where: { order_id: orderId } });
      for (const item of items) {
        const inventory = await manager.createQueryBuilder(Inventory, 'inventory')
          .setLock('pessimistic_write').where('inventory.variant_id = :id', { id: item.variant_id }).getOne();
        if (inventory) {
          inventory.reserved_quantity = Math.max(0, inventory.reserved_quantity - item.quantity);
          await manager.save(Inventory, inventory);
        }
      }
    });
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

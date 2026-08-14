import { Injectable, NotFoundException, BadRequestException, BadGatewayException, HttpException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { randomUUID } from 'crypto';
import { Order } from './entities/order.entity';
import { OrderShopGroup } from './entities/order-shop-group.entity';
import { OrderItem } from './entities/order-item.entity';
import { Shop } from '../shops/entities/shop.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { Product } from '../products/entities/product.entity';
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

  async createMoMoPayment(userId: string, order_id: string, payload: { orderInfo?: string }) {
    const order = await this.orderRepository.findOne({ where: { order_id } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.user_id !== userId) throw new ForbiddenException();
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

    // Persist the provider order id before calling MoMo. This makes IPNs
    // traceable even if the browser closes immediately after receiving payUrl.
    await this.paymentRepository.update({ order_id }, {
      transaction_code: orderId,
      amount: expectedAmount,
      payment_status: 'PENDING',
    });
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

  async create(userId: string, data: Partial<Order>) {
    // basic validation: ensure referenced shops and variants exist
    const groups = Array.isArray((data as any).shopGroups) ? (data as any).shopGroups : [];
    const { shopGroups: inputShopGroups, ...orderFields } = data as any;
    if (!Array.isArray(inputShopGroups) || inputShopGroups.length === 0) {
      throw new BadRequestException('Order must contain at least one shop group');
    }
    // The database currently stores the storefront method aliases in the
    // order columns (varchar(30)). Keep that stored value, but resolve the
    // alias only when looking up the trusted shipping fee.
    const paymentMethodId = String(orderFields.payment_method_id || '');
    const shippingMethodId = String(orderFields.shipping_method_id || '');
    const shippingMethodName = ({
      'ship-std': 'Standard', 'ship-fast': 'Fast', 'ship-exp': 'Express',
    } as Record<string, string>)[shippingMethodId.toLowerCase()] || '';
    if (!paymentMethodId || !shippingMethodId) throw new BadRequestException('Payment and shipping methods are required');
    const order: Order = this.orderRepository.create({
      // user_id and all monetary fields always come from the authenticated
      // user/server calculations, never from the checkout payload.
      user_id: userId,
      address_id: orderFields.address_id,
      payment_method_id: paymentMethodId,
      shipping_method_id: shippingMethodId,
      note: orderFields.note,
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
          const product = await manager.findOne(Product, { where: { product_id: variant.product_id } });
          if (!product || product.shop_id !== group.shop_id) throw new BadRequestException('Variant does not belong to the supplied shop');
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
      const shippingRow = await manager.query(
        'SELECT shipping_fee FROM shipping_methods WHERE (shipping_method_id::text = $1 OR method_name = $2) AND is_active = TRUE',
        [shippingMethodId, shippingMethodName],
      );
      if (!shippingRow[0]) throw new BadRequestException('Invalid shipping method');
      // A package is created for each shop, so apply the trusted method fee per package.
      const shippingFee = Number(shippingRow[0].shipping_fee) * normalizedGroups.length;
      const discount = 0; // Voucher calculation is intentionally server-owned; client totals are ignored.
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
          const shippingFee = Number(shippingRow[0].shipping_fee);
          const discount = 0;
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

  async updateStatus(actorId: string, order_id: string, status: string) {
    const order = await this.findOne(order_id);
    const nextStatus = String(status || '').toUpperCase();
    const transitions: Record<string, string[]> = {
      PENDING: ['CANCELLED'], CONFIRMED: ['PACKING', 'CANCELLED'],
      PACKING: ['SHIPPING', 'CANCELLED'], SHIPPING: ['COMPLETED'],
    };
    if (!transitions[order.order_status]?.includes(nextStatus)) throw new BadRequestException('Invalid order status transition');
    const groups = await this.groupRepository.find({ where: { order_id } });
    const shops = await this.dataSource.manager.find(Shop, { where: { shop_id: In(groups.map(group => group.shop_id)) } as any });
    const isOwner = shops.some(shop => shop.owner_id === actorId);
    if (nextStatus !== 'CANCELLED' && !isOwner) throw new ForbiddenException();
    if (nextStatus === 'CANCELLED' && order.user_id !== actorId && !isOwner) throw new ForbiddenException();
    if (nextStatus === 'CANCELLED' && order.order_status !== 'CANCELLED') {
      await this.releaseReservation(order_id);
    }
    await this.orderRepository.update({ order_id }, { order_status: nextStatus, updated_at: new Date().toISOString() });
    await this.historyRepository.save({ order_id, status: nextStatus, changed_at: new Date().toISOString() } as OrderStatusHistory);
    return this.findOne(order_id);
  }


  async handleMoMoIpn(payload: Record<string, any>) {
    if (!process.env.MOMO_SECRET || !process.env.MOMO_ACCESS_KEY) {
      return { resultCode: 1, message: 'Payment provider is not configured' };
    }
    const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${payload.amount}&extraData=${payload.extraData || ''}&message=${payload.message || ''}&orderId=${payload.orderId}&orderInfo=${payload.orderInfo}&orderType=${payload.orderType || ''}&partnerCode=${payload.partnerCode}&payType=${payload.payType || ''}&requestId=${payload.requestId}&responseTime=${payload.responseTime}&resultCode=${payload.resultCode}&transId=${payload.transId}`;
    const expectedSignature = crypto.createHmac('sha256', process.env.MOMO_SECRET || '').update(rawSignature).digest('hex');
    const payment = await this.paymentRepository.findOne({ where: { transaction_code: payload.orderId } });
    const signature = String(payload.signature || '');
    if (!payment || signature.length !== expectedSignature.length || !crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))) {
      return { resultCode: 1, message: 'Invalid payment notification' };
    }
    if (Number(payment.amount) !== Number(payload.amount)) return { resultCode: 1, message: 'Amount mismatch' };
    let message = 'Success';
    await this.dataSource.transaction(async (manager) => {
      const lockedPayment = await manager.findOne(Payment, {
        where: { payment_id: payment.payment_id }, lock: { mode: 'pessimistic_write' },
      });
      if (!lockedPayment) throw new NotFoundException('Payment not found');
      if (lockedPayment.payment_status === 'SUCCESS' || lockedPayment.payment_status === 'FAILED') {
        message = 'Already processed';
        return;
      }
      if (Number(payload.resultCode) !== 0) {
        await manager.update(Payment, { payment_id: lockedPayment.payment_id }, { payment_status: 'FAILED' });
        const items = await manager.find(OrderItem, { where: { order_id: lockedPayment.order_id } });
        for (const item of items) {
          const inventory = await manager.createQueryBuilder(Inventory, 'inventory').setLock('pessimistic_write')
            .where('inventory.variant_id = :id', { id: item.variant_id }).getOne();
          if (inventory) {
            inventory.reserved_quantity = Math.max(0, inventory.reserved_quantity - item.quantity);
            await manager.save(Inventory, inventory);
          }
        }
        await manager.update(Order, { order_id: lockedPayment.order_id }, { order_status: 'CANCELLED', updated_at: new Date().toISOString() });
        await manager.save(OrderStatusHistory, manager.create(OrderStatusHistory, { order_id: lockedPayment.order_id, status: 'CANCELLED' }));
        message = 'Failure recorded';
        return;
      }
      const items = await manager.find(OrderItem, { where: { order_id: lockedPayment.order_id } });
      for (const item of items) {
        const inventory = await manager.createQueryBuilder(Inventory, 'inventory')
          .setLock('pessimistic_write').where('inventory.variant_id = :id', { id: item.variant_id }).getOneOrFail();
        inventory.reserved_quantity -= item.quantity;
        inventory.quantity -= item.quantity;
        await manager.save(Inventory, inventory);
      }
      await manager.update(Payment, { payment_id: lockedPayment.payment_id }, {
        payment_status: 'SUCCESS', paid_at: new Date().toISOString(),
      });
      await manager.update(Order, { order_id: lockedPayment.order_id }, { order_status: 'CONFIRMED', updated_at: new Date().toISOString() });
      await manager.save(OrderStatusHistory, manager.create(OrderStatusHistory, { order_id: lockedPayment.order_id, status: 'CONFIRMED' }));
    });
    return { resultCode: 0, message };
  }

  async confirmCodCollection(actor: { user_id: string; roles?: string[] }, orderId: string) {
    const roles = actor.roles || [];
    if (!roles.some(role => ['ADMIN', 'STAFF', 'SHIPPER'].includes(String(role).toUpperCase()))) {
      throw new ForbiddenException('Only staff or shippers can confirm COD collection');
    }
    await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, { where: { order_id: orderId }, lock: { mode: 'pessimistic_write' } });
      const payment = await manager.findOne(Payment, { where: { order_id: orderId }, lock: { mode: 'pessimistic_write' } });
      if (!order || !payment) throw new NotFoundException('Order or payment not found');
      if (order.order_status !== 'SHIPPING' || payment.payment_status !== 'PENDING') {
        throw new BadRequestException('COD may only be collected for a shipping, unpaid order');
      }
      const items = await manager.find(OrderItem, { where: { order_id: orderId } });
      for (const item of items) {
        const inventory = await manager.createQueryBuilder(Inventory, 'inventory').setLock('pessimistic_write')
          .where('inventory.variant_id = :id', { id: item.variant_id }).getOneOrFail();
        inventory.reserved_quantity -= item.quantity;
        inventory.quantity -= item.quantity;
        await manager.save(Inventory, inventory);
      }
      await manager.update(Payment, { payment_id: payment.payment_id }, { payment_status: 'SUCCESS', paid_at: new Date().toISOString() });
      await manager.update(Order, { order_id: orderId }, { order_status: 'COMPLETED', updated_at: new Date().toISOString() });
      await manager.save(OrderStatusHistory, manager.create(OrderStatusHistory, { order_id: orderId, status: 'COMPLETED' }));
    });
    return this.findOne(orderId);
  }

  private async cancelPaymentOrder(orderId: string) {
    await this.releaseReservation(orderId);
    await this.orderRepository.update({ order_id: orderId }, { order_status: 'CANCELLED', updated_at: new Date().toISOString() });
    await this.historyRepository.save({ order_id: orderId, status: 'CANCELLED', changed_at: new Date().toISOString() } as OrderStatusHistory);
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

  async addShipment(order_shop_id: string, shipment: Partial<Shipment>) {
    const record = this.shipmentRepository.create({ ...shipment, order_shop_id });
    return this.shipmentRepository.save(record);
  }
}

import { Body, Controller, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';

// MoMo calls this endpoint server-to-server, so it deliberately has no JWT.
// Authenticity is established by the HMAC verification in OrdersService.
@Controller('payments')
export class PaymentsController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('momo/ipn')
  momoIpn(@Body() body: Record<string, any>) {
    return this.ordersService.handleMoMoIpn(body);
  }
}

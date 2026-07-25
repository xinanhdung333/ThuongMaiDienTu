import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ShopsModule } from './shops/shops.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ChatModule } from './chat/chat.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PromotionsModule } from './promotions/promotions.module';
import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { DatabaseSeedService } from './database-seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env', expandVariables: true }),
    CacheModule.register({
      ttl: parseInt(process.env.CACHE_TTL || '30', 10),
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          limit: parseInt(process.env.RATE_LIMIT_MAX || '20', 10),
          ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
        },
      ],
      errorMessage: 'Too many requests, please try again later.',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', '1'),
        database: config.get<string>('DB_NAME', 'Shopeelite'),
        autoLoadEntities: true,
        synchronize: false,
        logging: false,
      }),
    }),
    AuthModule,
    UsersModule,
    ShopsModule,
    ProductsModule,
    OrdersModule,
    VouchersModule,
    ReviewsModule,
    ChatModule,
    NotificationsModule,
    PromotionsModule,
    CartModule,
    WishlistModule,
  ],
  providers: [DatabaseSeedService],
})
export class AppModule {}

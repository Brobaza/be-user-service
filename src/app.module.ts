import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { redisStore } from 'cache-manager-redis-yet';
import { UsersController } from './controllers/user.controller';
import { CacheDomain } from './domains/cache.domain';
import { loadConfiguration } from './libs/config';
import AppLoggerService from './libs/logger';
import { User } from './models/interfaces/user.entity';
import { UsersService } from './services/user.service';
import { UserAddress } from './models/interfaces/user_address.entity';
import { UserAddressService } from './services/address.service';
import { TransactionDomain } from './domains/transaction.domain';
import { ConsumerService } from './queue/base/consumer.base-queue';
import { ProducerService } from './queue/base/producer.base-queue';
import { UserAbout } from './models/interfaces/user.about';
import { UserAboutService } from './services/user_about.service';
import { FriendRequest } from './models/interfaces/friend_requests.entity';
import { FriendRequestService } from './services/friend_request.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [() => loadConfiguration()],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<TypeOrmModuleOptions> => {
        return {
          type: 'postgres',
          host: configService.get<string>('postgres.host'),
          port: configService.get<number>('postgres.port'),
          username: configService.get<string>('postgres.username'),
          password: configService.get<string>('postgres.password'),
          database: configService.get<string>('postgres.database'),
          synchronize: !configService.get<boolean>('isProd'),
          dropSchema: false,
          logging: false,
          logger: 'advanced-console',
          autoLoadEntities: true,
          entities: [User, UserAddress, UserAbout, FriendRequest],
        };
      },
    }),

    TypeOrmModule.forFeature([User, UserAddress, UserAbout, FriendRequest]),

    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { host, port, database, password } = configService.get('redis');
        return {
          store: await redisStore({
            database,
            password,
            socket: { host, port },
          }),
        };
      },
    }),
  ],
  controllers: [UsersController],
  providers: [
    // * config
    AppLoggerService,

    // * services
    UsersService,
    UserAddressService,
    UserAboutService,
    FriendRequestService,

    // * domains
    TransactionDomain,
    CacheDomain,

    // * queues
    ConsumerService,
    ProducerService,
  ],
})
export class AppModule {}

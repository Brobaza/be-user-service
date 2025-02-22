import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UsersController } from './controllers/user.controller';
import { loadConfiguration } from './libs/config';
import AppLoggerService from './libs/logger';
import { User } from './models/interfaces/user.entity';
import { UsersService } from './services/user.service';

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
          entities: [User],
        };
      },
    }),

    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [AppLoggerService, UsersService],
})
export class AppModule {}

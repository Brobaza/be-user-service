import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import AppLoggerService from './libs/logger';
import { USER_PROTO_SERVICE_PACKAGE_NAME } from './gen/user.service';
import { join } from 'path';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ReflectionService } from '@grpc/reflection';

async function bootstrap() {
  const appModule = await NestFactory.create(AppModule);

  const configService = appModule.get(ConfigService);

  appModule.enableCors({
    origin: true,
    credentials: true,
  });

  appModule.use(helmet());

  appModule.use(cookieParser());

  appModule.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      protoPath: join(process.cwd(), 'proto/user.service.proto'),
      package: USER_PROTO_SERVICE_PACKAGE_NAME,
      url: configService.get('grpcUrl'),
      onLoadPackageDefinition: (pkg, server) => {
        new ReflectionService(pkg).addToServer(server);
      },
    },
  });

  appModule.useLogger(appModule.get(AppLoggerService));

  appModule.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  appModule.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
    }),
  );

  appModule.use(compression({ level: 6 }));

  await appModule.startAllMicroservices();

  const port = configService.get<number>('port');

  await appModule.listen(port, () => {
    const logger: Logger = new Logger('Server connection');
    logger.log(
      `👤User service has started successfully running on port ${port}`,
    );
  });
}
bootstrap();

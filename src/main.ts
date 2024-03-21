import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as helmet from 'helmet';
import { AppModule } from './app.module';
// import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import {
  ConfigurationService,
  MongoExceptionFilter,
  HttpExceptionFilter,
} from '@shafiqrathore/logeld-tenantbackend-common-future';

import { Transport } from '@nestjs/microservices';
import configureSwagger from './swaggerConfigurations';

// import { SnakeCaseInterceptor } from './shared/interceptors/snake-case.interceptor';
import * as requestIp from 'request-ip';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { json } from 'express';
import { CustomInterceptor } from 'utils/customInterceptor';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Main');
  const globalPrefix = '/api';
  const conf = app.get<ConfigurationService>(ConfigurationService);
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      port: conf.get('SELF_MICROSERVICE_PORT'),
      retryAttempts: 5,
      retryDelay: 5000,
    },
  });
  await app.startAllMicroservices();
  console.log('Microservice is listening');
  app.enableCors();
  app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
  app.use(requestIp.mw());

  app.use(json({ limit: '10mb' }));

  // Build the swagger doc only in dev mode
  configureSwagger(app, logger);

  app.setGlobalPrefix(globalPrefix);

  // Validate query params and body
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Convert exceptions to JSON readable format
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new MongoExceptionFilter());
  // app.useGlobalFilters(new BaseWsExceptionFilter())

  // Convert all JSON object keys to snake_case
  // app.useGlobalInterceptors(new SnakeCaseInterceptor());
  app.use(CustomInterceptor);
  await app.listen(AppModule.port);

  // Log current url of app
  let baseUrl = app.getHttpServer().address().address;
  if (baseUrl === '0.0.0.0' || baseUrl === '::') {
    baseUrl = 'localhost';
  }

  logger.log(`Listening to http://${baseUrl}:${AppModule.port}${globalPrefix}`);
}
bootstrap();

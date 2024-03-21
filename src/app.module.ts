import { Module, Injectable, Scope } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './services/app.service';
import { DefectsService } from './services/defects.service';
import {
  ConfigurationService,
  MessagePatternResponseInterceptor,
  SharedModule,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import { AppController } from './controllers/app.controller';
import { Transport, ClientProxyFactory } from '@nestjs/microservices';
import tunnel from 'tunnel-ssh';
import tunnelConfig from './tunnelConfig';
import { DefectSchema } from 'mongoDb/schema/defectSchema';
import { DriverSignSchema } from 'mongoDb/schema/driverSign';
import { TISchema } from 'mongoDb/schema/TISchema';
import { DefectsController } from 'controllers/defects.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SignService } from 'services/signService';
import { eldSubmitionRecord } from 'mongoDb/schema/eldSubmitionRecord';
import { iftaSubmissionRecord } from 'mongoDb/schema/iftaSubmissionRecord';
const getProxyObject = (
  proxyName: string,
  hostPort: string,
  tcpPort: string,
) => {
  return {
    provide: proxyName,
    useFactory: (config: ConfigurationService) => {
      return ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          port: Number(config.get(tcpPort)),
          host: config.get(hostPort),
        },
      });
    },
    inject: [ConfigurationService],
  };
};

@Module({
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: 'inspections', schema: TISchema }]),
    MongooseModule.forFeature([{ name: 'defects', schema: DefectSchema }]),
    MongooseModule.forFeature([
      { name: 'driverSign', schema: DriverSignSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'eldSubmitionRecord', schema: eldSubmitionRecord },
    ]),
    MongooseModule.forFeature([
      { name: 'iftaSubmissionRecord', schema: iftaSubmissionRecord },
    ]),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigurationService) => {
        const useTunnel = JSON.parse(
          configService.get('USE_TUNNEL') ?? 'false',
        );

        const mongooseConfig = {
          uri: configService.mongoUri,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        };

        if (useTunnel) {
          const { devServerTunnelConfig } = tunnelConfig;
          return new Promise((res, rej) => {
            tunnel(devServerTunnelConfig, async (error, server) => {
              if (server) {
                // lets overwrite default mongouri to use tunnel-ssh
                mongooseConfig.uri = devServerTunnelConfig.mongoDBUri;
                console.log(
                  `tunnel created with host: ${devServerTunnelConfig.host}`,
                );
                res(mongooseConfig);
              } else {
                console.log(
                  `tunnel connection failed with: ${devServerTunnelConfig.host}`,
                );
                console.log(error);
                rej(error);
              }
            });
          });
        }
        return mongooseConfig;
      },
      inject: [ConfigurationService],
    }),
  ],
  controllers: [AppController, DefectsController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: MessagePatternResponseInterceptor,
    },
    {
      provide: 'HOS_SERVICE',
      useFactory: (config: ConfigurationService) => {
        const port: number = Number(config.get('HOS_MICROSERVICE_PORT'));
        const host = config.get('HOS_MICROSERVICE_HOST');

        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            port,
            host,
          },
        });
      },
      inject: [ConfigurationService],
    },
    {
      provide: 'UNIT_SERVICE',
      useFactory: (config: ConfigurationService) => {
        const port: number = Number(config.get('UNIT_MICROSERVICE_PORT'));
        const host = config.get('UNIT_MICROSERVICE_HOST');

        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            port,
            host,
          },
        });
      },
      inject: [ConfigurationService],
    },
  {
      provide: 'PUSH_NOTIFICATION_SERVICE',
      useFactory: (config: ConfigurationService) => {
        const port: number = Number(config.get('PUSH_NOTIFICATION_MICROSERVICE_PORT'));
        const host = config.get('PUSH_NOTIFICATION_MICROSERVICE_HOST');

        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            port,
            host,
          },
        });
      },
      inject: [ConfigurationService],
    },
      {
      provide: 'DRIVER_SERVICE',
      useFactory: (config: ConfigurationService) => {
        const port: number = Number(config.get('DRIVER_MICROSERVICE_PORT'));
        const host = config.get('DRIVER_MICROSERVICE_HOST');

        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            port,
            host,
          },
        });
      },
      inject: [ConfigurationService],
    },
    { useClass: AppService, provide: 'AppService' },
    { useClass: DefectsService, provide: 'DefectsService' },
    { useClass: SignService, provide: 'SignService' },
    ConfigurationService,
  ],
})
export class AppModule {
  static port: number | string;
  static isDev: boolean;

  constructor(private readonly _configurationService: ConfigurationService) {
    AppModule.port = AppModule.normalizePort(
      _configurationService.get('SELF_MICROSERVICE_HOST'),
    );
    AppModule.isDev = _configurationService.isDevelopment;
  }

  /**
   * Normalize port or return an error if port is not valid
   * @param val The port to normalize
   */
  private static normalizePort(val: number | string): number | string {
    const port: number = typeof val === 'string' ? parseInt(val, 10) : val;

    if (Number.isNaN(port)) {
      return val;
    }

    if (port >= 0) {
      return port;
    }

    throw new Error(`Port "${val}" is invalid.`);
  }
}

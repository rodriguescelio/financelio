import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  Type,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { readdirSync } from 'fs';
import { join } from 'path';
import { AuthMiddleware } from './middleware/auth.middleware';

const load = (path: string): Type<any>[] => {
  let result = [];

  try {
    const fullpath = join(__dirname, path);
    result = readdirSync(fullpath)
      .filter((it) => it.endsWith('.js') && !it.endsWith('.d.js'))
      .map((it) => require(join(fullpath, it)))
      .map((it) => Object.values(it)[0] as Type<any>);
  } catch (e) {}

  return result;
};

const entities = load('./model/entity');

@Module({
  controllers: load('./controller'),
  providers: load('./service'),
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      exclude: ['/api*'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASS,
      database: process.env.DATABASE_NAME,
      synchronize: false,
      entities,
    }),
    TypeOrmModule.forFeature(entities),
    JwtModule.register({
      secret: process.env.TOKEN_SECRET,
      signOptions: {
        expiresIn: '24h',
      },
    }),
  ],
})
class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude({ path: '/auth/(.*)', method: RequestMethod.POST }) 
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

NestFactory.create(AppModule, { cors: true }).then((app) => {
  app.setGlobalPrefix('api');
  app.listen(3000);
});

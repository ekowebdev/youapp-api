import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './common/guards';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlacklistMiddleware } from './middleware/blacklist.middleware';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.DB_URI),
    ConfigModule.forRoot({ isGlobal: true }),
    ProfileModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    AppService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(BlacklistMiddleware)
      .forRoutes({ path: '/logout', method: RequestMethod.POST });
  }
}

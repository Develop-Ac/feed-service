import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { MinioModule } from './minio/minio.module';
import { FeedModule } from './feed/feed.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

import { HolidaysModule } from './modules/holidays/holidays.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MinioModule,
    FeedModule,
    EventsModule,
    AuthModule,
    UsersModule,
    HolidaysModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

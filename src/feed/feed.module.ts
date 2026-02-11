import { Module } from '@nestjs/common';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MinioModule } from '../minio/minio.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, MinioModule, AuthModule],
  controllers: [FeedController],
  providers: [FeedService]
})
export class FeedModule { }

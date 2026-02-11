import { Module } from '@nestjs/common';
import { HolidaysService } from './holidays.service';
import { HolidaysController } from './holidays.controller';
import { PrismaService } from '../../prisma/prisma.service';


@Module({
    imports: [],
    controllers: [HolidaysController],
    providers: [HolidaysService, PrismaService],
    exports: [HolidaysService],
})
export class HolidaysModule { }

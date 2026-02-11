import { Controller, Get, Post, Query, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { HolidaysService } from './holidays.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Feriados')
@Controller('feriados')
export class HolidaysController {
    constructor(private readonly holidaysService: HolidaysService) { }

    @Get()
    @ApiOperation({ summary: 'Lista feriados filtrados por ano' })
    @ApiQuery({ name: 'ano', required: false, type: Number })
    async findAll(@Query('ano') ano?: string) {
        const yearParsed = ano ? parseInt(ano, 10) : new Date().getFullYear();
        return this.holidaysService.findAll(yearParsed);
    }

}

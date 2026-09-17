import { Controller, Get, Post, Delete, Param, Body, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { AuthGuard } from '../auth/auth.guard';
import { pode } from '../auth/pode';
import type { FastifyRequest } from 'fastify';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Post()
    @UseGuards(AuthGuard)
    create(@Body() createEventDto: CreateEventDto, @Req() req: FastifyRequest) {
        if (!pode(req.user, '/feed', 'criar')) {
            throw new UnauthorizedException('Você não tem permissão para criar eventos.');
        }
        return this.eventsService.create(createEventDto, req.user.id);
    }

    @Get()
    @UseGuards(AuthGuard)
    findAll() {
        return this.eventsService.findAll();
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    remove(@Param('id') id: string, @Req() req: FastifyRequest) {
        if (!pode(req.user, '/feed', 'deletar')) {
            throw new UnauthorizedException('Você não tem permissão para excluir eventos.');
        }
        return this.eventsService.remove(id);
    }
}

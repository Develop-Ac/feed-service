import { Controller, Get, Post, Delete, Param, Body, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Post()
    @UseGuards(AuthGuard)
    create(@Body() createEventDto: CreateEventDto, @Req() req) {
        if (req.user?.setor?.toLowerCase() !== 'admin') {
            throw new UnauthorizedException('Somente admin pode criar eventos.');
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
    remove(@Param('id') id: string, @Req() req) {
        if (req.user?.setor?.toLowerCase() !== 'admin') {
            throw new UnauthorizedException('Somente admin pode excluir eventos.');
        }
        return this.eventsService.remove(id);
    }
}

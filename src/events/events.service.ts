import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateEventDto, authorId: string) {
        return this.prisma.fed_eventos.create({
            data: {
                titulo: dto.titulo,
                descricao: dto.descricao,
                data: new Date(dto.data),
                hora: dto.hora,
                local: dto.local,
                tipo: dto.tipo,
                autor_id: authorId,
            }
        });
    }

    async findAll() {
        const [events, holidays] = await Promise.all([
            this.prisma.fed_eventos.findMany({
                orderBy: { data: 'asc' },
                where: {
                    data: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
                },
                include: { autor: { select: { id: true, nome: true, setor: true, avatar_url: true } } }
            }),
            this.prisma.sis_feriados.findMany({
                where: {
                    data: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
                },
                orderBy: { data: 'asc' }
            })
        ]);

        const holidayEvents = holidays.map(h => ({
            id: `feriado-${h.id}`,
            titulo: h.nome,
            descricao: h.descricao || h.nome,
            data: h.data,
            hora: '00:00',
            local: h.tipo, // NACIONAL, ESTADUAL, MUNICIPAL, COMEMORATIVA
            tipo: h.tipo,
            autor: {
                id: 'system',
                nome: 'Sistema',
                setor: 'System',
                avatar_url: null
            }
        }));

        // Merge and Sort
        const allEvents = [...events, ...holidayEvents].sort((a, b) => {
            return new Date(a.data).getTime() - new Date(b.data).getTime();
        });

        return allEvents;
    }

    async remove(id: string) {
        return this.prisma.fed_eventos.delete({
            where: { id }
        });
    }
}

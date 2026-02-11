import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FileLogger } from '../../common/file-logger';

@Injectable()
export class HolidaysService {
    private readonly logger = new FileLogger();

    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async findAll(year?: number, local?: string) {
        const where: any = {};
        if (year) {
            where.ano = year;
        }
        // Filtro simples de local se fornecido
        // Se local for 'BR', pega nacionais. Se for UF, pega estaduais daquela UF.
        // Se for 'SORRISO-MT' ou IBGE, pega municipais.
        // A logica exata depende de como o front vai pedir.
        // Por enquanto retorna tudo ou filtrado por ano.

        return this.prisma.sis_feriados.findMany({
            where,
            orderBy: {
                data: 'asc',
            },
        });
    }
}

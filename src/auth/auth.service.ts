import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) { }

    async validateUser(userId: string) {
        // Mock removed, using real DB user
        // if (userId === 'cm6fb5q7e0000v9037v6q4j1b') ...

        const user = await this.prisma.sis_usuarios.findUnique({
            where: { id: userId },
            include: {
                sis_permissoes: true
            }
        });

        // Allow by code if needed? No, ID is safer.

        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private minioService: MinioService,
    ) { }

    async getProfile(userId: string) {
        const user = await this.prisma.sis_usuarios.findUnique({
            where: { id: userId },
            select: {
                id: true,
                nome: true,
                avatar_url: true,
                tema_preferencia: true,
                setor: true,
                _count: {
                    select: { fed_posts: true }
                }
                // Exclude sensitive fields like senha
            },
        });

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        return user;
    }

    async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
        const { nome, tema_preferencia, senha_atual, nova_senha } = updateProfileDto;
        const dataToUpdate: any = {};

        if (nome) dataToUpdate.nome = nome;
        if (tema_preferencia) dataToUpdate.tema_preferencia = tema_preferencia;

        // Password update logic
        if (nova_senha) {
            if (!senha_atual) {
                throw new BadRequestException('Senha atual é necessária para definir uma nova senha');
            }

            const user = await this.prisma.sis_usuarios.findUnique({ where: { id: userId } });
            if (!user) throw new NotFoundException('Usuário não encontrado');

            // Verify current password
            // NOTE: Assuming bcrypt. If legacy system uses different hash, this will fail.
            // TODO: Verify compatibility with "sistema" hashing.
            const isPasswordValid = await bcrypt.compare(senha_atual, user.senha);
            if (!isPasswordValid) {
                throw new BadRequestException('Senha atual incorreta');
            }

            const salt = await bcrypt.genSalt();
            dataToUpdate.senha = await bcrypt.hash(nova_senha, salt);
        }

        return this.prisma.sis_usuarios.update({
            where: { id: userId },
            data: dataToUpdate,
            select: {
                id: true,
                nome: true,
                avatar_url: true,
                tema_preferencia: true,
                setor: true,
                _count: {
                    select: { fed_posts: true }
                }
            },
        });
    }

    async uploadAvatar(userId: string, file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Arquivo não fornecido');
        }

        // Upload to Minio
        // Prefix with user folder for organization
        const result = await this.minioService.uploadFile(file, `avatars/${userId}/`);

        // Update user avatar_url
        const avatarUrl = result.url;
        await this.prisma.sis_usuarios.update({
            where: { id: userId },
            data: { avatar_url: avatarUrl },
        });

        return { avatar_url: avatarUrl };
    }
}

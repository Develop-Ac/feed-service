import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Req, UseInterceptors, UploadedFiles, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { FeedService } from './feed.service';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthGuard } from '../auth/auth.guard';
import { pode } from '../auth/pode';
import { FastifyFilesInterceptor } from '../common/multipart/fastify-multipart.interceptor';
import type { ArquivoEnviado } from '../common/multipart/arquivo-enviado.interface';
import type { FastifyRequest } from 'fastify';

@Controller('feed')
export class FeedController {
    constructor(private readonly feedService: FeedService) { }

    @Post()
    @UseGuards(AuthGuard)
    @UseInterceptors(FastifyFilesInterceptor('files'))
    create(@Body() createFeedDto: CreatePostDto, @Req() req: FastifyRequest, @UploadedFiles() files: ArquivoEnviado[] = []) {
        if (!pode(req.user, '/feed', 'editar')) {
            throw new UnauthorizedException('Você não tem permissão para postar no feed.');
        }
        return this.feedService.create(createFeedDto, req.user.id, files);
    }

    @Get()
    @UseGuards(AuthGuard)
    findAll(@Query('skip') skip = '0', @Query('take') take = '10', @Req() req: FastifyRequest) {
        return this.feedService.findAll(Number(skip), Number(take), req.user?.id);
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    async remove(@Param('id') id: string, @Req() req: FastifyRequest) {
        const post = await this.feedService.findOne(id);
        if (!post) {
            throw new NotFoundException('Post não encontrado.');
        }

        const isAuthor = post.autor_id === req.user.id;
        if (!isAuthor && !pode(req.user, '/feed', 'deletar')) {
            throw new UnauthorizedException('Você não tem permissão para excluir este post.');
        }
        return this.feedService.remove(id);
    }

    @Post(':id/like')
    @UseGuards(AuthGuard)
    toggleLike(@Param('id') id: string, @Req() req: FastifyRequest) {
        return this.feedService.toggleLike(id, req.user.id);
    }

    @Get(':id/comments')
    @UseGuards(AuthGuard)
    getComments(@Param('id') id: string) {
        return this.feedService.getComments(id);
    }

    @Post(':id/comments')
    @UseGuards(AuthGuard)
    addComment(@Param('id') id: string, @Body() body: { conteudo: string }, @Req() req: FastifyRequest) {
        return this.feedService.addComment(id, req.user.id, body.conteudo);
    }

    @Delete('comments/:id')
    @UseGuards(AuthGuard)
    removeComment(@Param('id') id: string, @Req() req: FastifyRequest) {
        return this.feedService.removeComment(id, req.user.id, pode(req.user, '/feed', 'deletar'));
    }
}

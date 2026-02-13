import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Req, UseInterceptors, UploadedFiles, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { FeedService } from './feed.service';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthGuard } from '../auth/auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('feed')
export class FeedController {
    constructor(private readonly feedService: FeedService) { }

    @Post()
    @UseGuards(AuthGuard)
    @UseInterceptors(FilesInterceptor('files'))
    create(@Body() createFeedDto: CreatePostDto, @Req() req, @UploadedFiles() files: Array<Express.Multer.File>) {
        const canPost = req.user?.setor?.toLowerCase() === 'admin' ||
            req.user?.sis_permissoes?.some(p => p.tela === '/feed' && p.editar);

        if (!canPost) {
            throw new UnauthorizedException('Você não tem permissão para postar no feed.');
        }
        return this.feedService.create(createFeedDto, req.user.id, files);
    }

    @Get()
    @UseGuards(AuthGuard)
    findAll(@Query('skip') skip = '0', @Query('take') take = '10', @Req() req) {
        return this.feedService.findAll(Number(skip), Number(take), req.user?.id);
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    async remove(@Param('id') id: string, @Req() req) {
        const post = await this.feedService.findOne(id);
        if (!post) {
            throw new NotFoundException('Post não encontrado.');
        }

        const isAuthor = post.autor_id === req.user.id;
        const canDelete = req.user?.setor?.toLowerCase() === 'admin' ||
            req.user?.sis_permissoes?.some(p => p.tela === '/feed' && p.deletar);

        if (!isAuthor && !canDelete) {
            throw new UnauthorizedException('Você não tem permissão para excluir este post.');
        }
        return this.feedService.remove(id);
    }

    @Post(':id/like')
    @UseGuards(AuthGuard)
    toggleLike(@Param('id') id: string, @Req() req) {
        return this.feedService.toggleLike(id, req.user.id);
    }

    @Get(':id/comments')
    @UseGuards(AuthGuard)
    getComments(@Param('id') id: string) {
        return this.feedService.getComments(id);
    }

    @Post(':id/comments')
    @UseGuards(AuthGuard)
    addComment(@Param('id') id: string, @Body() body: { conteudo: string }, @Req() req) {
        return this.feedService.addComment(id, req.user.id, body.conteudo);
    }

    @Delete('comments/:id')
    @UseGuards(AuthGuard)
    removeComment(@Param('id') id: string, @Req() req) {
        const canDelete = req.user?.setor?.toLowerCase() === 'admin' ||
            req.user?.sis_permissoes?.some(p => p.tela === '/feed' && p.deletar);

        return this.feedService.removeComment(id, req.user.id, canDelete);
    }
}

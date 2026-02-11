import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Req, UseInterceptors, UploadedFiles, UnauthorizedException } from '@nestjs/common';
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
        if (req.user?.setor?.toLowerCase() !== 'admin') {
            // throw new UnauthorizedException('Somente admin pode postar no feed.');
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
    remove(@Param('id') id: string, @Req() req) {
        if (req.user?.setor?.toLowerCase() !== 'admin') {
            throw new UnauthorizedException('Somente admin pode excluir posts.');
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
        const isAdmin = req.user?.setor?.toLowerCase() === 'admin';
        return this.feedService.removeComment(id, req.user.id, isAdmin);
    }
}

import { Controller, Get, Patch, Post, Body, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard'; // Assuming AuthGuard exists and works
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    getProfile(@Request() req) {
        // req.user is populated by AuthGuard
        return this.usersService.getProfile(req.user.id); // Assuming req.user has id
    }

    @Patch('me')
    updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
        return this.usersService.updateProfile(req.user.id, updateProfileDto);
    }

    @Post('me/avatar')
    @UseInterceptors(FileInterceptor('file', {
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        }
    }))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
        return this.usersService.uploadAvatar(req.user.id, file);
    }
}

import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.headers['x-user-id'];

        if (!userId) {
            throw new UnauthorizedException('User ID header missing');
        }

        try {
            const user = await this.authService.validateUser(userId);
            request.user = user;
            return true;
        } catch (e) {
            throw new UnauthorizedException();
        }
    }
}

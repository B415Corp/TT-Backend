import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth') // This will group your endpoints under a "auth" tag in Swagger UI
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @ApiOperation({ summary: 'Authenticate user and return JWT token' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'user@example.com' },
                password: { type: 'string', example: '123' },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'The JWT token.' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async login(@Request() req) {
        return this.authService.login(req.user);
    }
}

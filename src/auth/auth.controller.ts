import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from '../dto/login-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and return JWT token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: '11123@mail.com' },
        password: { type: 'string', example: '123' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'The JWT token.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() req: LoginUserDto) {
    return this.authService.login(req);
  }
}

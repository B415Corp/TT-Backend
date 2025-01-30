import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from '../api/users/dto/login-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and return JWT token' })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'alexeykoh@mail.com' },
        password: { type: 'string', example: '1234567890' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'The JWT token.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() req: LoginUserDto) {
    return this.authService.login(req);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (Protected)' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all users.',
  })
  // @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req) {
    return this.usersService.findAll();
  }

  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user by ID (Protected)' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user information.',
  })
  // @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user (Protected)' })
  @ApiResponse({ status: 200, description: 'Successfully deleted the user.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

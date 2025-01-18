import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SubscriptionGuard } from 'src/auth/guards/subscription.guard';
import { SubscriptionType } from 'src/common/enums/subscription-type.enum';
import { Subscription } from 'src/decorators/subscription.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../decorators/get-user.decorator';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Test free feature' })
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @Get('free_feature')
  @Subscription(
    SubscriptionType.FREE,
    SubscriptionType.BASIC,
    SubscriptionType.PREMIUM,
  )
  async getFreeFeature(@GetUser() user: User) {
    return this.usersService.findById(user.user_id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Test premium feature' })
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @Get('premium_feature')
  @Subscription(SubscriptionType.PREMIUM)
  async getPremiumFeature(@GetUser() user: User) {
    return this.usersService.findById(user.user_id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@GetUser() user: User) {
    return this.usersService.findById(user.user_id);
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user by ID (Protected)' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user information.',
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a user (Protected)' })
  @ApiResponse({
    status: 200,
    description: 'User information has been successfully updated.',
  })
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async update(@GetUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(user.user_id, updateUserDto);
  }
}

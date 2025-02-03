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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../decorators/get-user.decorator';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { ChangeSubscriptionDto } from './dto/change-subscription.dto';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Test free feature' })
  // @UseGuards(JwtAuthGuard, SubscriptionGuard)
  // @Get('free_feature')
  // @Subscription(
  //   SubscriptionType.FREE,
  //   SubscriptionType.BASIC,
  //   SubscriptionType.PREMIUM
  // )
  // async getFreeFeature(@GetUser() user: User) {
  //   return this.usersService.findById(user.user_id);
  // }

  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Test premium feature' })
  // @UseGuards(JwtAuthGuard, SubscriptionGuard)
  // @Get('premium_feature')
  // @Subscription(SubscriptionType.PREMIUM)
  // async getPremiumFeature(@GetUser() user: User) {
  //   return this.usersService.findById(user.user_id);
  // }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user details' })
  @ApiResponse({ status: 200, type: User })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@GetUser() user: User) {
    return this.usersService.findById(user.user_id);
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, type: User })
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, type: User })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiErrorResponses()
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user details' })
  @ApiResponse({ status: 200, type: User })
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async update(@GetUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(user.user_id, updateUserDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user subscription' })
  @ApiResponse({ status: 200, type: User })
  @UseGuards(JwtAuthGuard)
  @Patch('me/subscription')
  async changeSubscription(
    @GetUser() user: User,
    @Body() changeSubscriptionDto: ChangeSubscriptionDto
  ) {
    return this.usersService.changeSubscription(
      user.user_id,
      changeSubscriptionDto
    );
  }
}

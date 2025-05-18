import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Version,
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
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import { SearchUsersDto } from './dto/search-users.dto';
import { SubscriptionGuard } from 'src/guards/subscription.guard';
import { UserTypeDto } from './dto/user-type.dto';
import { UserTypeV2Dto } from './dto/user-type-v2.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Show avatars' })
  @ApiResponse({ status: 200 })
  @Get('/avatar')
  async showAvatar() {
    return this.usersService.showAvatar();
  }

  @ApiOperation({ summary: 'ci-cd' })
  @ApiResponse({ status: 200 })
  @Get('/ci-cd')
  async testCiCD() {
    return { message: 'ci-cd' };
  }

  @Version('1')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search for users by name or email (v1)' })
  @ApiResponse({ status: 200, type: [UserTypeDto] })
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @Get('search')
  // @Subscription(SubscriptionType.BASIC)
  async searchUsers(
    @Query() searchUsersDto: SearchUsersDto
  ): Promise<Array<UserTypeDto>> {
    const { maxResults = 5, page = 1 } = searchUsersDto;
    const offset = (page - 1) * maxResults;
    return this.usersService.searchUsers(searchUsersDto, maxResults, offset);
  }

  @Version('2')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Enhanced search for users with additional data (v2)',
  })
  @ApiResponse({ status: 200, type: [UserTypeV2Dto] })
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @Get('search')
  async searchUsersV2(
    @Query() searchUsersDto: SearchUsersDto
  ): Promise<Array<UserTypeV2Dto>> {
    return this.usersService.enhancedSearchUsers(searchUsersDto);
  }

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
  @ApiResponse({ status: 200, type: UserTypeDto })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@GetUser() user: User): Promise<UserTypeDto> {
    return this.usersService.findById(user.user_id) as Promise<UserTypeDto>;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, type: UserTypeDto })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiErrorResponses()
  async findOne(@Param('id') id: string): Promise<UserTypeDto> {
    return this.usersService.findById(id) as Promise<UserTypeDto>;
  }

  @ApiOperation({ summary: 'Find a user by ID' })
  @ApiResponse({ status: 200, type: UserTypeDto })
  @Get('find/:id')
  async findUser(
    @GetUser() user: User,
    @Param('id') id: string
  ): Promise<UserTypeDto | undefined> {
    return this.usersService.findUser(id);
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, type: UserTypeDto })
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<UserTypeDto> {
    return this.usersService.create(createUserDto) as Promise<UserTypeDto>;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user details' })
  @ApiResponse({ status: 200, type: UserTypeDto })
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async update(
    @GetUser() user: User,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserTypeDto> {
    return this.usersService.update(user.user_id, updateUserDto);
  }
}

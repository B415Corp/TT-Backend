import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/decorators/get-user.decorator';
import { User } from 'src/entities/user.entity';
import { Friendship } from 'src/entities/friend.entity';
import { PaginationQueryDto } from 'src/common/pagination/pagination-query.dto';
import { Paginate, PaginationParams } from 'src/decorators/paginate.decorator';
import { PaginatedResponseDto } from 'src/common/pagination/paginated-response.dto';

@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get my friendships',
    description: 'Get user friendships',
  })
  @ApiResponse({ status: 200, type: Friendship, isArray: true })
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async search(@GetUser() user: User): Promise<Friendship[]> {
    return this.friendshipService.findAll(user.user_id);
  }

  @ApiOkResponse({ type: PaginatedResponseDto<Friendship> })
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get my friends',
    description: 'Get user friends',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @UseGuards(JwtAuthGuard)
  @Get('/friends')
  @Paginate()
  async getFriends(
    @GetUser() user: User,
    @PaginationParams() paginationQuery: PaginationQueryDto
  ) {
    return this.friendshipService.getFriends(user.user_id, paginationQuery);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get my friendships',
    description: 'Get user friendships',
  })
  @ApiResponse({ status: 200, type: Friendship, isArray: true })
  @UseGuards(JwtAuthGuard)
  @Get('/:user_id')
  async getByUserId(@Param('friendId') friendId: string): Promise<Friendship> {
    return this.friendshipService.findByUserId(friendId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Send a friendship request',
    description: 'Send a friendship request to a user',
  })
  @ApiResponse({ status: 201, type: Friendship })
  @UseGuards(JwtAuthGuard)
  @Post('/request/:friendId')
  async sendRequest(
    @GetUser() user: User,
    @Param('friendId') friendId: string
  ): Promise<Friendship> {
    return this.friendshipService.create(user.user_id, friendId, user.name);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Accept a friendship request',
    description: 'Accept a friendship request',
  })
  @ApiResponse({ status: 200, type: Friendship })
  @UseGuards(JwtAuthGuard)
  @Put('/accept/:id')
  async acceptRequest(
    @GetUser() user: User,
    @Param('id') id: string
  ): Promise<Friendship> {
    return this.friendshipService.accept(id, user.user_id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Decline a friendship request',
    description: 'Decline a friendship request',
  })
  @ApiResponse({ status: 204 })
  @UseGuards(JwtAuthGuard)
  @Put('/decline/:id')
  async declineRequest(
    @GetUser() user: User,
    @Param('id') id: string
  ): Promise<void> {
    await this.friendshipService.decline(id, user.user_id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cancel a friendship request',
    description: 'Cancel a friendship request',
  })
  @ApiResponse({ status: 204 })
  @UseGuards(JwtAuthGuard)
  @Delete('/cancel/:id')
  async cancelRequest(
    @GetUser() user: User,
    @Param('id') id: string
  ): Promise<void> {
    return this.friendshipService.cancel(id, user.user_id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get pending friendship requests',
    description: 'Get pending friendship requests sent to the user',
  })
  @ApiResponse({ status: 200, type: Friendship, isArray: true })
  @UseGuards(JwtAuthGuard)
  @Get('/requests/pending')
  async getPendingFriendshipRequests(
    @GetUser() user: User
  ): Promise<Friendship[]> {
    return this.friendshipService.getPendingFriendshipRequests(user.user_id);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from '../../entities/tag.entity';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/decorators/get-user.decorator';
import { User } from 'src/entities/user.entity';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, type: Tag })
  @Post('me')
  @ApiOperation({ summary: 'Create a new tag for the authenticated user' })
  createForUser(
    @GetUser() user: User,
    @Body() createTagDto: CreateTagDto
  ): Promise<Tag> {
    return this.tagsService.create(createTagDto, user.user_id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, type: Tag })
  @Get('me')
  @ApiOperation({ summary: 'Get all tags for the authenticated user' })
  findAll(@GetUser() user: User): Promise<Tag[]> {
    return this.tagsService.findByUserId(user.user_id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, type: Tag })
  @Get(':id')
  @ApiOperation({ summary: 'Get a tag by ID' })
  findOne(@Param('id') id: string): Promise<Tag> {
    return this.tagsService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, type: Tag })
  @Patch(':id')
  @ApiOperation({ summary: 'Update a tag by ID' })
  update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
    @GetUser() user: User
  ): Promise<Tag> {
    return this.tagsService.update(id, updateTagDto, user.user_id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tag by ID' })
  remove(@Param('id') id: string, @GetUser() user: User): Promise<void> {
    return this.tagsService.remove(id, user.user_id);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { Notes } from '../../entities/notes.entity.js';
import { CreateNotesDto } from './dto/create-notes.dto.js';
import { UpdateNotesDto } from './dto/update-notes.dto.js';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PaginatedResponseDto } from 'src/common/pagination/paginated-response.dto';
import { GetUser } from 'src/decorators/get-user.decorator';
import { User } from 'src/entities/user.entity';
import { Paginate, PaginationParams } from 'src/decorators/paginate.decorator';
import { PaginationQueryDto } from 'src/common/pagination/pagination-query.dto';

@ApiTags('notes')
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @ApiBearerAuth()
  @ApiOkResponse({ type: Notes })
  @ApiOperation({ summary: 'Create new note' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createNotesDto: CreateNotesDto,
    @GetUser() user: User
  ): Promise<Notes> {
    return this.notesService.create(createNotesDto, user.user_id);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: PaginatedResponseDto<Notes> })
  @ApiOperation({ summary: 'Get all user notes' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  @Paginate()
  async findAll(
    @GetUser() user: User,
    @PaginationParams() paginationQuery: PaginationQueryDto
  ) {
    return this.notesService.findAll(user.user_id, paginationQuery);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: Notes })
  @ApiOperation({ summary: 'Get note by id' })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @GetUser() user: User
  ): Promise<Notes> {
    return this.notesService.findOne(id, user.user_id);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: Notes })
  @ApiOperation({ summary: 'Update note by id' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateNotesDto: UpdateNotesDto,
  ): Promise<Notes> {
    return this.notesService.update(id, updateNotesDto);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: Notes })
  @ApiOperation({ summary: 'Delete note by id' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.notesService.remove(id);
  }
}

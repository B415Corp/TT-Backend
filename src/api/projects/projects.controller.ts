import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User } from '../../entities/user.entity';
import { GetUser } from '../../decorators/get-user.decorator';
import { PaginatedResponseDto } from '../../common/pagination/paginated-response.dto';
import { Project } from '../../entities/project.entity';
import {
  Paginate,
  PaginationParams,
} from '../../decorators/paginate.decorator';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new project', description: '' })
  @ApiResponse({
    status: 201,
    description: 'The project has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createClient(
    @Body() createProjectDto: CreateProjectDto,
    @GetUser() user: User,
  ) {
    return this.projectsService.create(createProjectDto, user.user_id);
  }

  @ApiOkResponse({ type: PaginatedResponseDto<Project> })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my projects', description: '' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @Paginate()
  async getMe(
    @GetUser() user: User,
    @PaginationParams() paginationQuery: PaginationQueryDto,
  ) {
    return this.projectsService.findByKey(
      'user_owner_id',
      user.user_id,
      paginationQuery,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getClientById(@Param('id') id: string) {
    return this.projectsService.findById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated the project.',
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateClient(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted the project.',
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Post(':id/tags')
  @UseGuards(JwtAuthGuard)
  async addTags(
    @Param('id') id: string,
    @Body() body: { tag_ids: string[] }
  ) {
    return this.projectsService.addTags(id, body.tag_ids);
  }

  @Delete(':id/tags')
  @UseGuards(JwtAuthGuard)
  async removeTags(
    @Param('id') id: string,
    @Body() body: { tag_ids: string[] }
  ) {
    return this.projectsService.removeTags(id, body.tag_ids);
  }
}

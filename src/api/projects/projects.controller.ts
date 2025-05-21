import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import { Roles } from 'src/guards/roles.decorator';
import { PROJECT_ROLE } from 'src/common/enums/project-role.enum';
import { RoleGuard } from 'src/guards/role.guard';
import { ProjectFilterDto } from './dto/project-filter.dto';
import { GetProjectByIdDTO } from './dto/get-project-by-id.dto';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({
    status: 201,
    description: 'The project has been successfully created.',
    type: CreateProjectDto,
  })
  @Post('create')
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
    @GetUser() user: User
  ) {
    return this.projectsService.create(createProjectDto, user.user_id);
  }

  @ApiOkResponse({ type: PaginatedResponseDto<Project> })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my projects' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['name', 'created_at'],
    description: 'Sort by field',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: PROJECT_ROLE,
    description: 'Filter by project role',
  })
  @ApiQuery({
    name: 'client_id',
    required: false,
    type: String,
    description: 'Filter by client ID',
  })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @Paginate()
  async getMe(
    @GetUser() user: User,
    @PaginationParams() paginationQuery: PaginationQueryDto,
    @Query() filterQuery: ProjectFilterDto
  ) {
    return this.projectsService.findMyProjects(
      user.user_id,
      paginationQuery,
      filterQuery
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved project.',
    type: Project,
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getProjectById(
    @GetUser() user: User,
    @Param('id') id: string
  ): Promise<GetProjectByIdDTO> {
    return this.projectsService.findById(id,user.user_id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated the project.',
    type: Project,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles([PROJECT_ROLE.OWNER], 'project')
  @Patch(':id')
  async updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto
  ) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted the project.',
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles([PROJECT_ROLE.OWNER], 'project')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @ApiOperation({ summary: 'Populate project members for existing projects' })
  @ApiResponse({
    status: 200,
    description:
      'Successfully populated project members for all existing projects.',
  })
  @Post('populate-members')
  async populateProjectMembers() {
    return this.projectsService.createProjectMembersForExistingProjects();
  }
}

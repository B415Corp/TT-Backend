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
import { AddUserProjectDto } from './dto/add-user-project.dto';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

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
    @GetUser() user: User,
  ) {
    return this.projectsService.create(createProjectDto, user.user_id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add user to project' })
  @ApiResponse({
    status: 201,
    description: 'User has been successfully added.',
    type: Project,
  })
  @UseGuards(JwtAuthGuard)
  @Post(':project_id/add_member')
  async addUser(
    @Body() addUserProjectDto: AddUserProjectDto,
    @Param('project_id') project_id: string,
    @GetUser() user: User,
  ) {
    return this.projectsService.addUser(project_id, addUserProjectDto.user_id, user.user_id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add user to project' })
  @ApiResponse({
    status: 201,
    description: 'User has been successfully added.',
    type: Project,
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':project_id/delete_member')
  async deleteUser(
    @Body() addUserProjectDto: AddUserProjectDto,
    @Param('project_id') project_id: string,
    @GetUser() user: User,
  ) {
    return this.projectsService.deleteUser(project_id, addUserProjectDto.user_id, user.user_id);
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
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved project.',
    type: Project,
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getProjectById(@Param('id') id: string) {
    return this.projectsService.findById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated the project.',
    type: Project,
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateProject(
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
}

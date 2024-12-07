import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { User } from '../../entities/user.entity';
import { GetUser } from '../../decorators/get-user.decorator';

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

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my projects', description: '' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@GetUser() user: User) {
    return this.projectsService.findByKey('user_owner_id', user.user_id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getClientById(@Param('id') id: string) {
    return this.projectsService.findById(id);
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

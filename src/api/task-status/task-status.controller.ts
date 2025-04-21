import { Controller } from '@nestjs/common';
import { TaskStatusService } from './task-status.service';

@Controller('task-status')
export class TaskStatusController {
  constructor(private readonly taskStatusService: TaskStatusService) {}

  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Get satus by project id' })
  // @UseGuards(JwtAuthGuard)
  // @Get(':id')
  // async getByProjectId(@Param('id') id: string) {
  //   return this.taskStatusService.findByProjectId(id);
  // }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // @ApiOperation({ summary: 'Create a new status list' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'The project has been successfully created.',
  //   type: CreateTaskStatusDTO,
  // })
  // @Post(':project_id')
  // async createProject(
  //   @Param('project_id') id: string,
  //   @Body() createTaskStatusDTO: CreateTaskStatusDTO
  // ) {
  //   return this.taskStatusService.create(id, createTaskStatusDTO.names);
  // }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // @ApiOperation({ summary: 'Update a status list' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'The status list has been successfully update.',
  //   type: CreateTaskStatusDTO,
  // })
  // @Patch(':project_id')
  // async patchProject(
  //   @Param('project_id') project_id: string,
  //   @Body() createTaskStatusDTO: CreateTaskStatusDTO
  // ) {
  //   return this.taskStatusService.updateByProjectId(project_id, createTaskStatusDTO.names);
  // }
}

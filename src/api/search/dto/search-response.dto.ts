import { ApiProperty } from '@nestjs/swagger';
import { Client } from 'src/entities/client.entity';
import { Project } from 'src/entities/project.entity';
import { Task } from 'src/entities/task.entity';

export class SearchResponse {
  @ApiProperty({
    type: [Project],
    description: 'List of projects matching the search term',
  })
  projects: Project[];

  @ApiProperty({
    type: [Task],
    description: 'List of tasks matching the search term',
  })
  tasks: Task[];

  @ApiProperty({
    type: [Client],
    description: 'List of clients matching the search term',
  })
  clients: Client[];
}

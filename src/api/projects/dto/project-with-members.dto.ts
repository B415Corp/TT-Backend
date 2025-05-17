import { ApiProperty } from '@nestjs/swagger';
import { Project } from 'src/entities/project.entity';

export class ProjectWithMembersDto {
  @ApiProperty({ type: Project })
  project: Project;

  @ApiProperty({ type: Object })
  shared: {
    role: string; // or ProjectRole if you have it defined
    approved: boolean;
  };
}

import { Entity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Project } from 'src/entities/project.entity';
import { ProjectMember } from 'src/entities/project-shared.entity';
import { Currency } from 'src/entities/currency.entity';
import { Client } from 'src/entities/client.entity';
import { PROJECT_ROLE } from 'src/common/enums/project-role.enum';
import { IsEnum, IsNotEmpty } from 'class-validator';

@Entity()
export class ProjectInfoDTO {
  @ApiProperty()
  owner: ProjectMember | null;

  @ApiProperty()
  isUserOwner: boolean;

  @ApiProperty()
  invitedUsers: Array<ProjectMember>;

  @ApiProperty()
  myRate: number | null;

  @ApiProperty()
  myPaymentType: string | null;

  @ApiProperty()
  myCurrency: Currency | null;

  @ApiProperty()
  client: Client;

  @ApiProperty({type: Number})
  projectDuration: number;

  @ApiProperty({ enum: PROJECT_ROLE, default: PROJECT_ROLE.EXECUTOR })
  @IsEnum(PROJECT_ROLE)
  @IsNotEmpty()
  myRole: PROJECT_ROLE;
}

@Entity()
export class GetProjectByIdDTO {
  @ApiProperty()
  project: Project;

  @ApiProperty()
  info: ProjectInfoDTO;
}

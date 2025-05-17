import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PROJECT_MEMBER_FILTERLTER } from 'src/common/enums/project-member-filter.enum';

export class GetMembersByFilterDTO {
  @ApiProperty({
    enum: PROJECT_MEMBER_FILTERLTER,
    default: PROJECT_MEMBER_FILTERLTER.ALL,
  })
  @IsEnum(PROJECT_MEMBER_FILTERLTER)
  @IsNotEmpty()
  role: PROJECT_MEMBER_FILTERLTER;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  project_id: string;
}

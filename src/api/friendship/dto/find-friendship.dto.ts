import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { FriendshipStatus } from 'src/common/enums/friendship-status.enum';
import { PaginationQueryDto } from 'src/common/pagination/pagination-query.dto';

export class FindFriendshipDto extends PaginationQueryDto  {
  @ApiPropertyOptional({ enum: FriendshipStatus })
  @IsEnum(FriendshipStatus)
  @IsOptional()
  status?: FriendshipStatus;
}

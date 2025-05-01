import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { FriendshipStatus } from 'src/common/enums/friendship-status.enum';
import { PaginationQueryDto } from 'src/common/pagination/pagination-query.dto';

export class FindFriendshipDto extends PaginationQueryDto  {
  @ApiProperty({ enum: FriendshipStatus })
  @IsEnum(FriendshipStatus)
  status: FriendshipStatus;
}

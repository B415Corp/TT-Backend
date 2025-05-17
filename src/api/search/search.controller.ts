import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchDto } from './dto/search.dto';
import { GetUser } from '../../decorators/get-user.decorator';
import { User } from '../../entities/user.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SearchResponse } from './dto/search-response.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Search',
    description: 'Search for projects, tasks, and clients related to the user.',
  })
  @ApiResponse({ status: 200, type: SearchResponse })
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiResponse({ status: 200, description: 'Search results' })
  async search(
    @GetUser() user: User,
    @Query() searchDto: SearchDto
  ): Promise<SearchResponse> {
    return this.searchService.search(user, searchDto.searchTerm);
  }
}

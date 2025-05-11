import { Controller, Get, Query, UseGuards, Version } from '@nestjs/common';
import { Paginate } from '../../decorators/paginate.decorator';
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
import { SearchDtoV2 } from './dto/search.dtoV2';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Version('1')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Search',
    description: 'Search for projects, tasks, and clients related to the user.',
  })
  @ApiResponse({ status: 200, type: SearchResponse })
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiResponse({ status: 200, description: 'Search results' })
  @Paginate()
  async search(
    @GetUser() user: User,
    @Query() searchDto: SearchDto
  ): Promise<SearchResponse> {
    return this.searchService.search(user, searchDto.searchTerm);
  }

  @Version('2')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Search',
    description: 'Search for projects, tasks, and clients related to the user.',
  })
  @ApiResponse({ status: 200, type: SearchResponse })
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Search results' })
  @Get()
  async searchV2(
    @GetUser() user: User,
    @Query() searchDto: SearchDtoV2
  ): Promise<SearchResponse> {
    return this.searchService.searchV2(
      user,
      searchDto.searchTerm,
      searchDto.searchLocation,
      undefined, // maxResults (по умолчанию)
      undefined, // offset (по умолчанию)
      searchDto.sort
    );
  }
}

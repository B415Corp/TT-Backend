import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchDto } from './dto/search.dto';
import { GetUser } from '../../decorators/get-user.decorator';
import { User } from '../../entities/user.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('search')
@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) {}

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Search', description: 'Search for projects, tasks, and clients related to the user.' })
    @UseGuards(JwtAuthGuard)
    @Get()
    @ApiResponse({ status: 200, description: 'Search results' })
    async search(@GetUser() user: User, @Query() searchDto: SearchDto) {
        return this.searchService.search(user, searchDto.searchTerm);
    }
}
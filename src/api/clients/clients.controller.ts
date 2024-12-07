import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { User } from '../../entities/user.entity';
import { GetUser } from '../../decorators/get-user.decorator';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({
    status: 201,
    description: 'The client has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createClient(
    @Body() createClientDto: CreateClientDto,
    @GetUser() user: User,
  ) {
    return this.clientsService.create(createClientDto, user.user_id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all my clients' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@GetUser() user: User) {
    console.log(user);
    return this.clientsService.findByKey('user_id', user.user_id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a client by id',
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getClientById(@Param('id') id: string) {
    return this.clientsService.findById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a client' })
  @ApiResponse({ status: 200, description: 'Successfully updated the client.' })
  @ApiResponse({ status: 404, description: 'Client not found.' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateClient(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, updateClientDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a client' })
  @ApiResponse({ status: 200, description: 'Successfully deleted the client.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }
}

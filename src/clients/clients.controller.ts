import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new client', description: '' })
  @ApiResponse({
    status: 201,
    description: 'The client has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createClient(
    @Body() createClientDto: CreateClientDto,
    @Req() request: any,
  ) {
    console.log(request.user);
    return this.clientsService.create(createClientDto, request.user.user_id);
  }

  @Get('')
  async getAllClients() {
    return this.clientsService.findAll();
  }

  @Get(':id')
  async getClientById(@Param('id') id: string) {
    return this.clientsService.findById(id);
  }
}

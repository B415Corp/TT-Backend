import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { Currency } from '../../entities/currency.entity';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('currencies')
@Controller('currencies')
@ApiBearerAuth()
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Retrieve all currencies' })
  @ApiResponse({ status: 200, type: Currency })
  @ApiResponse({ status: 200, description: 'Return all currencies.' })
  findAll(): Promise<Currency[]> {
    return this.currenciesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Retrieve a currency by ID' })
  @ApiResponse({ status: 200, type: Currency })
  @ApiResponse({ status: 404, description: 'Currency not found.' })
  findOne(@Param('id') id: string): Promise<Currency> {
    return this.currenciesService.findOne(+id);
  }
}

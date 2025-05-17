import { Controller, Get, Param } from '@nestjs/common';
import { PlansService } from './plans.service';
import { Plan } from 'src/entities/plan.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Currency } from 'src/entities/currency.entity';

@ApiTags('plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all currencies' })
  @ApiResponse({ status: 200, type: Currency })
  @ApiResponse({ status: 200, description: 'Return all currencies.' })
  findAll(): Promise<Plan[]> {
    return this.plansService.getAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a currency by ID' })
  @ApiResponse({ status: 200, type: Currency })
  @ApiResponse({ status: 404, description: 'Currency not found.' })
  findOne(@Param('id') id: string): Promise<Plan> {
    return this.plansService.getById(Number(id));
  }
}

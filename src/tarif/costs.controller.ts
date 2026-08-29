import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CostsService } from './costs.service';
import { CreateCostDto } from './dto/create-cost.dto';
import { UpdateCostDto } from './dto/update-cost.dto';

@Controller('costs')
export class CostsController {
  constructor(private readonly costsService: CostsService) {}

  @Get()
  async findAll() {
    const costs = await this.costsService.findAll();
    return {
      message: 'Successfully retrieved all costs',
      data: costs,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const cost = await this.costsService.findOne(id);
    return {
      message: 'Successfully retrieved cost details',
      data: cost,
    };
  }

  @Post()
  async create(@Body() createCostDto: CreateCostDto) {
    const newCost = await this.costsService.create(createCostDto);
    return {
      message: 'Cost successfully created',
      data: newCost,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateCostDto,
  ) {
    const updatedCost = await this.costsService.update(id, input);
    return {
      message: 'Cost successfully updated',
      data: updatedCost,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const removedCost = await this.costsService.remove(id);
    return {
      message: 'Cost successfully removed',
      data: removedCost,
    };
  }
}

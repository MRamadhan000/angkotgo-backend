import { Controller, Get } from '@nestjs/common';
import { StatisticsService } from './stats.service';

@Controller('stats')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  async getStatistics() {
    return await this.statisticsService.getDashboardStatistics();
  }
}

import { Controller, Get, Param } from '@nestjs/common';
import { DashboardService } from 'src/service/dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('bills/:month/:year')
  async findBills(@Param() params: any): Promise<any[]> {
    return this.dashboardService.findBills(params.month, params.year);
  }

}

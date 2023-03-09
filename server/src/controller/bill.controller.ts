import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { BillDTO } from 'src/model/dto/bill.dto';
import { BillDeleteRequestDTO } from 'src/model/dto/billDeleteRequest.dto';
import { Bill } from 'src/model/entity/bill.entity';
import { BillService } from 'src/service/bill.service';

@Controller('bill')
export class BillController {
  constructor(private readonly billService: BillService) {}

  @Post('create')
  persist(@Body() bill: BillDTO): Promise<Bill[]> {
    return this.billService.create(bill);
  }

  @Get('findAll')
  findAll(): Promise<Bill[]> {
    return this.billService.findAll();
  }

  @Delete('deleteSingle/:id')
  deleteSingle(@Param() params: any): Promise<void> {
    return this.billService.deleteSingle(params.id);
  }

  @Post('delete/:id')
  delete(@Param() params: any, @Body() body: BillDeleteRequestDTO): Promise<void> {
    return this.billService.delete(params.id, body);
  }

}

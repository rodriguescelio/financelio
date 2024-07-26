import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CardDTO } from 'src/model/dto/card.dto';
import { InvoiceDTO } from 'src/model/dto/invoice.dto';
import { InvoicePaymentDTO } from 'src/model/dto/invoicePayment.dto';
import { ManualAmountDTO } from 'src/model/dto/manualAmount.dto';
import { Card } from 'src/model/entity/card.entity';
import { CardService } from 'src/service/card.service';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get('findAll')
  async findAll(): Promise<CardDTO[]> {
    return this.cardService.findAll();
  }

  @Post('persist')
  persist(@Body() card: Card): Promise<Card> {
    return this.cardService.persist(card);
  }

  @Delete('delete/:id')
  delete(@Param('id') id: string): Promise<void> {
    return this.cardService.delete(id);
  }

  @Get(':id/invoice/:ref')
  getInvoice(@Param() params: any): Promise<InvoiceDTO> {
    return this.cardService.getInvoice(params.id, params.ref);
  }

  @Post(':id/manualAmount')
  persistManualAmount(
    @Param('id') id: string,
    @Body() manualAmount: ManualAmountDTO,
  ): Promise<InvoiceDTO> {
    return this.cardService.persistManualAmount(id, manualAmount);
  }

  @Post(':id/pay')
  persistPayment(
    @Param('id') id: string,
    @Body() data: InvoicePaymentDTO,
  ): Promise<InvoiceDTO> {
    return this.cardService.persistPayment(id, data);
  }

  @Post(':cardId/reset/:receiptId')
  resetPayment(
    @Param('cardId') cardId: string,
    @Param('receiptId') receiptId: string,
  ): Promise<void> {
    return this.cardService.resetPayment(cardId, receiptId);
  }
}

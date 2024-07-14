import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CardDTO } from 'src/model/dto/card.dto';
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
  delete(@Param() params): Promise<void> {
    return this.cardService.delete(params.id);
  }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CardDTO } from 'src/model/dto/card.dto';
import { Bill } from 'src/model/entity/bill.entity';
import { Card } from 'src/model/entity/card.entity';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
    private readonly authService: AuthService,
  ) {}

  async findAll(): Promise<CardDTO[]> {
    const bills = await this.billRepository
      .createQueryBuilder('bill')
      .select('bill.amount', 'amount')
      .addSelect('bill.card.id', 'card')
      .where('bill.account.id = :id', {
        id: this.authService.sessionAccount.id,
      })
      .andWhere('bill.type != :type', { type: 'recurrence' })
      .getRawMany();

    return (
      await this.cardRepository.findBy({
        account: {
          id: this.authService.sessionAccount.id,
        },
      })
    ).map((card) => ({
      ...card,
      amountUsed: bills
        .filter((it) => it.card === card.id)
        .reduce((total, it) => total + parseFloat(it.amount), 0),
    }));
  }

  async persist(card: Card): Promise<Card> {
    const cardDB = card.id
      ? await this.cardRepository.findOneBy({ id: card.id })
      : new Card();

    cardDB.label = card.label;
    cardDB.amountLimit = card.amountLimit;
    cardDB.closeDay = card.closeDay;
    cardDB.payDay = card.payDay;

    if (!card.id) {
      cardDB.account = this.authService.sessionAccount;
    }

    await this.cardRepository.save(cardDB);

    return cardDB;
  }

  async delete(cardId): Promise<void> {
    const card = await this.cardRepository.findOneBy({
      account: {
        id: this.authService.sessionAccount.id,
      },
      id: cardId,
    });

    if (!card) {
      throw new HttpException('Invalid request!', HttpStatus.BAD_REQUEST);
    }

    await this.cardRepository.remove(card);
  }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from 'src/model/entity/card.entity';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';

@Injectable()
export class CardService {

  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    private readonly authService: AuthService
  ) {}

  async findAll(): Promise<Card[]> {
    return await this.cardRepository.findBy({
      account: {
        id: this.authService.sessionAccount.id
      },
    });
  }

  async persist(card: Card): Promise<Card> {
    const cardDB = card.id ? await this.cardRepository.findOneBy({ id: card.id }) : new Card();

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

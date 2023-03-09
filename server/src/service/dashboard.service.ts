import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Bill } from 'src/model/entity/bill.entity';
import { Card } from 'src/model/entity/card.entity';
import { BillType } from 'src/model/enumerated/billType.enum';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';

@Injectable()
export class DashboardService {

  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
    private readonly authService: AuthService
  ) {}

  setCloseDay(date: moment.Moment, closeDay: number) {
    if (closeDay === 31 && date.daysInMonth() < 31) {
      date.date(date.daysInMonth());
    } else {
      date.date(closeDay);
    }
  }

  async findBills(month: string, year: string): Promise<any[]> {
    const cards = await this.cardRepository.findBy({
      account: { id: this.authService.sessionAccount.id }
    });

    const result: any = {};

    for (const i in cards) {
      const card = cards[i];

      const data = moment().month(parseInt(month) - 1).year(parseInt(year));

      const dataInicial = data.clone().hour(0).minute(0).second(0).subtract(2, 'month');
      const dataFinal = data.clone().hour(23).minute(59).second(59).subtract(1, 'month');

      this.setCloseDay(dataInicial, card.closeDay);
      this.setCloseDay(dataFinal, card.closeDay);
      
      if (!result[card.id]) {
        result[card.id] = {
          id: card.id,
          label: card.label,
          payDate: data.clone().date(card.payDay).toDate(),
          bills: []
        };
      }

      const bills = await this.billRepository.findBy({
        account: {
          id: this.authService.sessionAccount.id,
        },
        card: { id: card.id },
      });

      bills.forEach(it => {
        if (it.type === BillType.RECURRENCE) {
          result[card.id].bills.push(it);
        } else {
          if (dataInicial.toDate() <= it.billDate && dataFinal.toDate() >= it.billDate) {
            result[card.id].bills.push(it);
          }
        }
      });
    }

    Object.keys(result).forEach(key => {
      result[key].total = result[key].bills.reduce((total, it) => total + it.amount, 0);
    });

    return Object.values(result);
  }
}

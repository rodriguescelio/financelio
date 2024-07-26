import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Bill } from 'src/model/entity/bill.entity';
import { BillType } from 'src/model/enumerated/billType.enum';
import { Between, Repository } from 'typeorm';

@Injectable()
export class RecurrenceSchedule {
  constructor(
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
  ) {}

  async generateBillForRef(
    recurrence: Bill,
    ref: moment.Moment,
  ): Promise<Bill | null> {
    const start = ref.startOf('month').toDate();
    const end = ref.endOf('month').toDate();

    const alreadyCreated = await this.billRepository.countBy({
      generatedViaRecurrence: true,
      rootBill: { id: recurrence.id },
      billDate: Between(start, end),
      active: true,
    });

    if (alreadyCreated === 0) {
      return this.billRepository.create({
        account: recurrence.account,
        generatedViaRecurrence: true,
        rootBill: recurrence,
        category: recurrence.category,
        card: recurrence.card,
        type: BillType.SINGLE,
        buyDate: recurrence.buyDate,
        description: `${recurrence.description} - (${ref.format('MM/YYYY')})`,
        amount: recurrence.amount,
        tags: recurrence.tags,
        billDate: ref
          .clone()
          .date(
            (recurrence.card
              ? recurrence.card.closeDay
              : moment(recurrence.billDate).date()) - 1,
          ),
      });
    }

    return null;
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async run() {
    const recurrences = await this.billRepository.find({
      where: { type: BillType.RECURRENCE, active: true },
      relations: {
        card: true,
        category: true,
        tags: true,
        account: true,
      },
    });

    if (recurrences.length) {
      const currentRef = moment();
      const bills = (
        await Promise.all(
          recurrences.map(async (it) => [
            await this.generateBillForRef(it, currentRef),
            await this.generateBillForRef(
              it,
              currentRef.clone().add(1, 'month'),
            ),
          ]),
        )
      )
        .flatMap((it) => it)
        .filter((it) => !!it);

      if (bills.length) {
        await this.billRepository.save(bills);
      }
    }
  }
}

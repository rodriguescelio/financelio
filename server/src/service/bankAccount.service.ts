import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BankAccountDTO } from 'src/model/dto/bankAccount.dto';
import { BankAccount } from 'src/model/entity/bankAccount.entity';
import { BankAccountEntry } from 'src/model/entity/bankAccountEntry.entity';
import { EntryType } from 'src/model/enumerated/entryType.enum';
import { MoreThan, Not, Repository } from 'typeorm';
import { AuthService } from './auth.service';

@Injectable()
export class BankAccountService {
  constructor(
    @InjectRepository(BankAccount)
    private bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(BankAccountEntry)
    private bankAccountEntryRepository: Repository<BankAccountEntry>,
    private readonly authService: AuthService,
  ) {}

  async findAll(): Promise<BankAccountDTO[]> {
    const bankAccounts = await this.bankAccountRepository.find({
      where: {
        account: {
          id: this.authService.sessionAccount.id,
        },
      },
      relations: {
        entries: true,
      },
    });

    return await Promise.all(
      bankAccounts.map(async (it) => {
        const dto = new BankAccountDTO(it);

        const lastValueChange = await this.bankAccountEntryRepository.findOne({
          where: {
            bankAccount: { id: it.id },
            type: EntryType.VALUE,
          },
          order: {
            createdAt: 'DESC',
          },
        });

        const whereChanges: any = {
          bankAccount: { id: it.id },
          type: Not(EntryType.VALUE),
        };

        if (lastValueChange) {
          dto.amount = lastValueChange.amount;
          whereChanges.createdAt = MoreThan(lastValueChange.createdAt);
        }

        dto.amount = (
          await this.bankAccountEntryRepository.findBy(whereChanges)
        ).reduce(
          (total, it) =>
            it.type === EntryType.CREDIT
              ? total + it.amount
              : total - it.amount,
          dto.amount,
        );

        return dto;
      }),
    );
  }

  async persist(bankAccount: BankAccount): Promise<BankAccount> {
    const bankAccountDB = bankAccount.id
      ? await this.bankAccountRepository.findOneBy({ id: bankAccount.id })
      : new BankAccount();

    bankAccountDB.label = bankAccount.label;

    if (!bankAccount.id) {
      bankAccountDB.account = this.authService.sessionAccount;
    }

    await this.bankAccountRepository.save(bankAccountDB);

    return bankAccountDB;
  }

  async persistEntry(
    bankAccountEntry: BankAccountEntry,
  ): Promise<BankAccountEntry> {
    const bankAccount = await this.bankAccountRepository.findOneBy({
      id: bankAccountEntry.bankAccount.id,
      account: {
        id: this.authService.sessionAccount.id,
      },
    });

    if (!bankAccount) {
      throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
    }

    const entry = new BankAccountEntry();

    entry.bankAccount = bankAccount;
    entry.type = bankAccountEntry.type;
    entry.amount = bankAccountEntry.amount;
    entry.description = bankAccountEntry.description;
    entry.receipt = bankAccountEntry.receipt;

    await this.bankAccountEntryRepository.save(entry);

    return entry;
  }

  async delete(bankAccountId): Promise<void> {
    const bankAccount = await this.bankAccountRepository.findOneBy({
      account: {
        id: this.authService.sessionAccount.id,
      },
      id: bankAccountId,
    });

    if (!bankAccount) {
      throw new HttpException('Invalid request!', HttpStatus.BAD_REQUEST);
    }

    await this.bankAccountRepository.remove(bankAccount);
  }
}

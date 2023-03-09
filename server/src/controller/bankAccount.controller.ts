import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { BankAccountDTO } from 'src/model/dto/bankAccount.dto';
import { BankAccount } from 'src/model/entity/bankAccount.entity';
import { BankAccountEntry } from 'src/model/entity/bankAccountEntry.entity';
import { BankAccountService } from 'src/service/bankAccount.service';

@Controller('bankAccount')
export class BankAccountController {
  constructor(private readonly bankAccountService: BankAccountService) {}

  @Get('findAll')
  async findAll(): Promise<BankAccountDTO[]> {
    return this.bankAccountService.findAll();
  }

  @Post('persist')
  persist(@Body() bankAccount: BankAccount): Promise<BankAccount> {
    return this.bankAccountService.persist(bankAccount);
  }

  @Post('persistEntry')
  persistEntry(@Body() bankAccountEntry: BankAccountEntry): Promise<BankAccountEntry> {
    return this.bankAccountService.persistEntry(bankAccountEntry);
  }

  @Delete('delete/:id')
  delete(@Param() params): Promise<void> {
    return this.bankAccountService.delete(params.id);
  }
}

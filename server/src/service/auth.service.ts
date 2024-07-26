import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginRequestDTO } from 'src/model/dto/loginRequest.dto';
import { TokenResponseDTO } from 'src/model/dto/tokenResponse.dto';
import { Account } from 'src/model/entity/account.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CheckEmailRequestDTO } from 'src/model/dto/checkEmailRequest.dto';

@Injectable()
export class AuthService {
  sessionAccount: Account;

  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private jwtService: JwtService,
  ) {}

  async login(loginRequest: LoginRequestDTO): Promise<TokenResponseDTO> {
    const account = await this.accountRepository.findOneBy({
      email: loginRequest.email.toLowerCase(),
    });

    if (
      !account ||
      !bcrypt.compareSync(loginRequest.password, account.password)
    ) {
      throw new HttpException('Invalid Email/Password.', HttpStatus.FORBIDDEN);
    }

    const token = this.jwtService.sign({
      id: account.id,
      name: account.name,
      email: account.email,
    });

    return new TokenResponseDTO(account, token);
  }

  async checkEmail(checkEmailRequest: CheckEmailRequestDTO) {
    const account = await this.accountRepository.findBy({
      email: checkEmailRequest.email.toLowerCase(),
    });
    return account.length === 0;
  }

  async signup(signupRequest: Account): Promise<TokenResponseDTO> {
    if (
      !(await this.checkEmail({ email: signupRequest.email.toLowerCase() }))
    ) {
      throw new HttpException('Email já em uso.', HttpStatus.FORBIDDEN);
    }

    const account = new Account();
    account.name = signupRequest.name;
    account.email = signupRequest.email;
    account.password = bcrypt.hashSync(
      signupRequest.password,
      parseInt(process.env.BCRYPT_SALT),
    );

    await this.accountRepository.save(account);

    return new TokenResponseDTO(
      account,
      this.jwtService.sign({ id: account.id }),
    );
  }

  async validate(token: string): Promise<boolean> {
    const tokenData: any = await this.jwtService.decode(token);

    if (tokenData) {
      const account = await this.accountRepository.findOneBy({
        id: tokenData.id,
      });

      if (account) {
        this.sessionAccount = account;
        return true;
      }
    }

    return false;
  }

  getData(): Account {
    return this.sessionAccount;
  }
}

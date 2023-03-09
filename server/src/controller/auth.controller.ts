import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CheckEmailRequestDTO } from 'src/model/dto/checkEmailRequest.dto';
import { LoginRequestDTO } from 'src/model/dto/loginRequest.dto';
import { TokenResponseDTO } from 'src/model/dto/tokenResponse.dto';
import { Account } from 'src/model/entity/account.entity';
import { AuthService } from 'src/service/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginRequest: LoginRequestDTO): Promise<TokenResponseDTO> {
    return this.authService.login(loginRequest);
  }
  
  @Post('signup')
  signup(@Body() signupRequest: Account): Promise<TokenResponseDTO> {
    return this.authService.signup(signupRequest);
  }

  @Post('checkEmail')
  checkEmail(@Body() checkEmailRequest: CheckEmailRequestDTO): Promise<boolean> {
    return this.authService.checkEmail(checkEmailRequest);
  }

  @Get('getData')
  validate() {
    return this.authService.getData();
  }
}

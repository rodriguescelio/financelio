import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from 'src/service/auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authorization = req.header('authorization');
    if (authorization) {
      this.authService.validate(authorization.substring(7)).then((isValid) => {
        if (isValid) {
          next();
        } else {
          res.status(HttpStatus.UNAUTHORIZED).send();
        }
      });
    } else {
      res.status(HttpStatus.UNAUTHORIZED).send();
    }
  }
}

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class BlacklistMiddleware implements NestMiddleware {
  constructor(
    private authService: AuthService
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    const isTokenBlacklisted = this.authService.isTokenBlacklisted(token);
    if (isTokenBlacklisted) {
      return res.status(401).json({ message: 'Token is invalid or expired.' });
    }
    next();
  }
}

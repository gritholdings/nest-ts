import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService, SessionUser } from './auth.service';

/** Authenticates `POST /auth/login` using the `email` + `password` body fields. */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }

  validate(email: string, password: string): Promise<SessionUser> {
    return this.authService.validateUser(email, password);
  }
}

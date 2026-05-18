import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

/** The shape stored in the session and exposed as `req.user`. */
export interface SessionUser {
  id: number;
  email: string;
  name: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly users: UsersService) {}

  /** Verifies email + password; throws 401 on any mismatch. */
  async validateUser(email: string, password: string): Promise<SessionUser> {
    const user = await this.users.findByEmailWithPassword(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return { id: user.id, email: user.email, name: user.name };
  }
}

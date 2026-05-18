import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { SessionUser } from './auth.service';

/**
 * Stores only the user id in the session cookie and rehydrates the full
 * user on each request, so a deleted user is logged out automatically.
 */
@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly users: UsersService) {
    super();
  }

  serializeUser(
    user: SessionUser,
    done: (err: Error | null, id: number) => void,
  ): void {
    done(null, user.id);
  }

  async deserializeUser(
    id: number,
    done: (err: Error | null, user: SessionUser | null) => void,
  ): Promise<void> {
    try {
      const user = await this.users.findOne(id);
      done(null, { id: user.id, email: user.email, name: user.name });
    } catch {
      // User no longer exists — treat the session as anonymous.
      done(null, null);
    }
  }
}

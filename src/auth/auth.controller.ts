import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import type { SessionUser } from './auth.service';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Body } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly users: UsersService) {}

  /** Create a new account. Does not log the user in. */
  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  /** Verify credentials (via LocalAuthGuard) and start a session. */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Req() req: Request): SessionUser {
    return req.user as SessionUser;
  }

  /** Clear the session and the login cookie. */
  @UseGuards(AuthenticatedGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: Request): Promise<{ loggedOut: true }> {
    return new Promise((resolve, reject) => {
      req.logout((logoutErr) => {
        if (logoutErr) return reject(logoutErr);
        req.session.destroy((destroyErr) => {
          if (destroyErr) return reject(destroyErr);
          resolve({ loggedOut: true });
        });
      });
    });
  }

  /** The currently logged-in user. */
  @UseGuards(AuthenticatedGuard)
  @Get('me')
  me(@Req() req: Request): SessionUser {
    return req.user as SessionUser;
  }
}

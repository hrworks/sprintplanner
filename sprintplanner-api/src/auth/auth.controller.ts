import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard, JwtAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const user = await this.authService.validateGoogleUser(req.user);
    const token = this.authService.generateToken(user);
    res.redirect(`/?token=${token}`);
  }

  @Get('dev')
  async devLogin(@Res() res: Response) {
    if (process.env.NODE_ENV === 'production') {
      res.status(404).send('Not found');
      return;
    }
    const user = await this.authService.getOrCreateDevUser();
    const token = this.authService.generateToken(user);
    res.json({ token });
  }
}

@Controller('api')
export class ApiController {
  constructor(private authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: any) {
    return this.authService.getUser(req.user.id);
  }
}

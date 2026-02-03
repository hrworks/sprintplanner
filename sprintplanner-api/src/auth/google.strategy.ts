import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private allowedDomains: string[];

  constructor(private configService: ConfigService) {
    const clientID = configService.get('GOOGLE_CLIENT_ID');
    // Use dummy values if not configured (dev mode)
    super({
      clientID: clientID || 'not-configured',
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET') || 'not-configured',
      callbackURL: configService.get('GOOGLE_CALLBACK_URL') || 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
    this.allowedDomains = (configService.get('ALLOWED_DOMAINS') || '')
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);
  }

  validate(accessToken: string, refreshToken: string, profile: any) {
    const email = profile.emails?.[0]?.value;
    const domain = email?.split('@')[1];

    if (this.allowedDomains.length && !this.allowedDomains.includes(domain)) {
      throw new UnauthorizedException('Domain not allowed');
    }

    return {
      googleId: profile.id,
      email,
      name: profile.displayName,
      avatarUrl: profile.photos?.[0]?.value,
    };
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthModuleOptions } from '../auth.module';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('AUTH_OPTIONS')
    readonly options: AuthModuleOptions,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: options.jwt.ignoreExpiration,
      secretOrKey: options.jwt.secret,
    });
  }

  async validate(payload: any) {
    return payload;
  }
}

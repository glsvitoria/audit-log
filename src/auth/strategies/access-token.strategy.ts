import { StrategiesHelper } from '@/common/helpers/strategies.helper'
import { JWTPayload } from '@/common/types/jwt-payload'
import { env } from '@/config/env-validation'
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
	Strategy,
	StrategiesHelper.ACCESS_TOKEN_STRATEGY
) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: `${env.ACCESS_TOKEN_SECRET}`,
			algorithms: ['HS256'],
		})
	}

	validate(payload: JWTPayload) {
		return { sub: payload.sub, enterpriseSub: payload.enterpriseSub, role: payload.role }
	}
}
